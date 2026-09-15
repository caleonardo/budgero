/**
 * Extracts JSX text from website pages into next-intl message catalogs.
 *
 * Unlike Lingui, next-intl needs explicit keys, so one is derived from the
 * English text (slug + collision counter) and namespaced per route. Server
 * components get `await getTranslations`, client components `useTranslations`.
 *
 * Writes/merges messages into messages/en.json under `--messagesOut`.
 */

const fs = require('fs');
const path = require('path');

const SKIP_ELEMENTS = new Set(['code', 'pre', 'script', 'style', 'svg', 'path']);
const URL_OR_EMAIL = /^(https?:\/\/|www\.|mailto:)|^[\w.+-]+@[\w-]+\.\w+$/i;
const NOT_WORDS = /^[\s\d\p{P}\p{S}]*$/u;

function meaningful(raw) {
  const t = (raw || '').trim();
  if (t.length < 3) return false;
  if (NOT_WORDS.test(t)) return false;
  if (URL_OR_EMAIL.test(t)) return false;
  if (!/[a-z]{2}/.test(t)) return false;
  return /\p{L}/u.test(t);
}

function slugify(text) {
  const base = text
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\w\s]/g, ' ')
    .trim()
    .split(/\s+/)
    .slice(0, 6)
    .join('_')
    .slice(0, 48);
  return base || 'text';
}

function elementName(node) {
  const n = node.openingElement && node.openingElement.name;
  if (!n) return null;
  if (n.type === 'JSXIdentifier') return n.name;
  if (n.type === 'JSXMemberExpression') return n.property && n.property.name;
  return null;
}

function namespaceFor(filePath) {
  const m = filePath.match(/\[locale\]\/(.*)\/page\.tsx$/);
  const raw = m ? m[1] : 'home';
  return raw.replace(/[^\w]+/g, '_');
}

module.exports = function transformer(file, api, options) {
  const j = api.jscodeshift;
  const root = j(file.source);
  const ns = namespaceFor(file.path);
  const messages = {};
  const used = new Set();
  let changed = false;

  const keyFor = (text) => {
    const base = slugify(text);
    let key = base;
    let n = 2;
    while (used.has(key) && messages[key] !== text) key = `${base}_${n++}`;
    used.add(key);
    messages[key] = text;
    return key;
  };

  root.find(j.JSXText).forEach((p) => {
    const raw = p.node.value;
    if (!meaningful(raw)) return;

    const parent = p.parent && p.parent.node;
    if (parent && parent.type === 'JSXElement') {
      const name = elementName(parent);
      if (name && SKIP_ELEMENTS.has(name)) return;
    }

    const text = raw.replace(/\s+/g, ' ').trim();
    const lead = /^\s/.test(raw) ? ' ' : '';
    const tail = /\s$/.test(raw) ? ' ' : '';

    const call = j.jsxExpressionContainer(
      j.callExpression(j.identifier('t'), [j.literal(keyFor(text))])
    );

    if (lead || tail) {
      p.replace(j.jsxText(lead), call, j.jsxText(tail));
    } else {
      p.replace(call);
    }
    changed = true;
  });

  if (!changed) return null;

  const isClient = /^\s*['"]use client['"]/.test(file.source);
  const hook = isClient ? 'useTranslations' : 'getTranslations';
  const source = isClient ? 'next-intl' : 'next-intl/server';

  // Bind `t` inside the default-exported page component.
  const exports_ = root.find(j.ExportDefaultDeclaration);
  if (exports_.size() === 0) return null;
  const decl = exports_.at(0).get().node.declaration;
  const fn =
    decl.type === 'FunctionDeclaration' || decl.type === 'ArrowFunctionExpression' ? decl : null;
  if (!fn || !fn.body || fn.body.type !== 'BlockStatement') return null;

  const init = isClient
    ? j.callExpression(j.identifier(hook), [j.literal(ns)])
    : j.awaitExpression(j.callExpression(j.identifier(hook), [j.literal(ns)]));

  fn.body.body.unshift(
    j.variableDeclaration('const', [j.variableDeclarator(j.identifier('t'), init)])
  );

  if (!isClient) {
    fn.async = true;

    // Static rendering needs the locale set before any translation lookup, or
    // next-intl silently serves the default locale for every language.
    if (fn.params.length === 0) {
      const paramsProp = j.objectPattern([
        Object.assign(j.property('init', j.identifier('params'), j.identifier('params')), {
          shorthand: true,
        }),
      ]);
      paramsProp.typeAnnotation = j.tsTypeAnnotation(
        j.tsTypeLiteral([
          j.tsPropertySignature(
            j.identifier('params'),
            j.tsTypeAnnotation(
              j.tsTypeReference(
                j.identifier('Promise'),
                j.tsTypeParameterInstantiation([
                  j.tsTypeLiteral([
                    j.tsPropertySignature(
                      j.identifier('locale'),
                      j.tsTypeAnnotation(j.tsStringKeyword())
                    ),
                  ]),
                ])
              )
            )
          ),
        ])
      );
      fn.params.push(paramsProp);

      fn.body.body.unshift(
        j.expressionStatement(
          j.callExpression(j.identifier('setRequestLocale'), [j.identifier('locale')])
        )
      );
      fn.body.body.unshift(
        j.variableDeclaration('const', [
          j.variableDeclarator(
            j.objectPattern([
              Object.assign(j.property('init', j.identifier('locale'), j.identifier('locale')), {
                shorthand: true,
              }),
            ]),
            j.awaitExpression(j.identifier('params'))
          ),
        ])
      );
    }
  }

  const needed = isClient ? [hook] : [hook, 'setRequestLocale'];
  const existing = root.find(j.ImportDeclaration, { source: { value: source } });
  if (existing.size() > 0) {
    const specs = existing.at(0).get().node.specifiers || [];
    for (const name of needed) {
      if (!specs.some((s) => s.imported && s.imported.name === name)) {
        specs.push(j.importSpecifier(j.identifier(name)));
      }
    }
  } else {
    const imp = j.importDeclaration(
      needed.map((name) => j.importSpecifier(j.identifier(name))),
      j.literal(source)
    );
    const imports = root.find(j.ImportDeclaration);
    if (imports.size() > 0) imports.at(0).insertBefore(imp);
    else root.get().node.program.body.unshift(imp);
  }

  if (options.messagesOut) {
    const outPath = path.resolve(options.messagesOut);
    const current = fs.existsSync(outPath) ? JSON.parse(fs.readFileSync(outPath, 'utf8')) : {};
    current[ns] = { ...(current[ns] || {}), ...messages };
    fs.writeFileSync(outPath, `${JSON.stringify(current, null, 2)}\n`);
  }

  return root.toSource({ quote: 'single', lineTerminator: '\n' });
};

module.exports.parser = 'tsx';
