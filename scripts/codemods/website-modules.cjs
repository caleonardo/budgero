/**
 * Extracts English strings from module-level const data (comparison tables,
 * FAQ arrays, feature lists) in website pages into next-intl catalogs.
 *
 * Each qualifying `const X = [...]` becomes `const makeX = (t) => [...]` with
 * strings swapped for t('key') calls, and every function that (a) uses X and
 * (b) binds `const t = await getTranslations(...)` gets `const X = makeX(t);`
 * inserted after the t binding. Consts referenced anywhere else are left
 * untouched — the build audit flags those for manual review.
 *
 * Template literals are only converted when their sole interpolations are
 * `${pricing.<field>}`, which map onto ICU {field} placeholders.
 */

const fs = require('fs');
const path = require('path');

const SKIP_KEYS = new Set([
  'id', 'slug', 'href', 'url', 'icon', 'image', 'media', 'mediaMobile',
  'className', 'key', 'type', 'locale', 'currency', 'name', 'initial',
]);
const SKIP_CONSTS = new Set(['metadata', 'dynamic', 'revalidate']);
const URL_OR_EMAIL = /^(https?:\/\/|www\.|mailto:|[/#])|@[\w-]+\.\w+/i;

function humanish(text) {
  const t = (text || '').trim();
  if (t.length < 4) return false;
  if (!/[A-Za-z]{2}/.test(t)) return false;
  if (URL_OR_EMAIL.test(t)) return false;
  if (t.split(/\s+/).length < 2) return false;
  return true;
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

  const keyFor = (prefix, text) => {
    const base = `${prefix}_${slugify(text)}`.slice(0, 60);
    let key = base;
    let n = 2;
    while (used.has(key) && messages[key] !== text) key = `${base}_${n++}`;
    used.add(key);
    messages[key] = text;
    return key;
  };

  // Functions that bind `const t = await getTranslations(...)`.
  const tBindings = [];
  root
    .find(j.VariableDeclarator, { id: { name: 't' } })
    .filter((p) => {
      const init = p.node.init;
      return (
        init &&
        init.type === 'AwaitExpression' &&
        init.argument.type === 'CallExpression' &&
        init.argument.callee.name === 'getTranslations'
      );
    })
    .forEach((p) => {
      let fn = p;
      while (fn && !['FunctionDeclaration', 'FunctionExpression', 'ArrowFunctionExpression'].includes(fn.node.type)) {
        fn = fn.parent;
      }
      if (fn) tBindings.push({ fnPath: fn, declPath: p });
    });
  if (tBindings.length === 0) return null;

  const inside = (p, fnPath) => {
    let cur = p;
    while (cur) {
      if (cur.node === fnPath.node) return true;
      cur = cur.parent;
    }
    return false;
  };

  root.find(j.Program).forEach((program) => {
    for (const stmt of program.node.body) {
      if (stmt.type !== 'VariableDeclaration') continue;
      if (stmt.declarations.length !== 1) continue;
      const decl = stmt.declarations[0];
      if (!decl.id || decl.id.type !== 'Identifier' || SKIP_CONSTS.has(decl.id.name)) continue;
      if (!decl.init || !['ArrayExpression', 'ObjectExpression'].includes(decl.init.type)) continue;

      const name = decl.id.name;
      const declCollection = j(stmt);

      // Collect replacements first; commit only if the const qualifies.
      const strings = [];
      declCollection.find(j.Literal).forEach((p) => {
        if (typeof p.node.value !== 'string') return;
        const parent = p.parent.node;
        if (parent.type === 'Property' && parent.key === p.node) return;
        if (parent.type === 'Property' && parent.key.type === 'Identifier' && SKIP_KEYS.has(parent.key.name)) return;
        if (!humanish(p.node.value)) return;
        strings.push({ path: p, kind: 'plain', text: p.node.value.replace(/\s+/g, ' ').trim() });
      });
      declCollection.find(j.TemplateLiteral).forEach((p) => {
        const exprs = p.node.expressions;
        const ok = exprs.every(
          (e) =>
            e.type === 'MemberExpression' &&
            e.object.type === 'Identifier' &&
            e.object.name === 'pricing' &&
            e.property.type === 'Identifier'
        );
        if (!ok || exprs.length === 0) return;
        let text = '';
        p.node.quasis.forEach((q, i) => {
          text += q.value.cooked;
          if (exprs[i]) text += `{${exprs[i].property.name}}`;
        });
        text = text.replace(/\s+/g, ' ').trim();
        if (!humanish(text.replace(/\{\w+\}/g, 'x'))) return;
        strings.push({ path: p, kind: 'tpl', text, fields: exprs.map((e) => e.property.name) });
      });
      if (strings.length === 0) continue;

      // Every reference must live inside a function that binds t.
      const refs = root
        .find(j.Identifier, { name })
        .filter((p) => p.node !== decl.id)
        .filter((p) => !(p.parent.node.type === 'Property' && p.parent.node.key === p.node))
        .filter((p) => !(p.parent.node.type === 'MemberExpression' && p.parent.node.property === p.node))
        .filter((p) => !(p.parent.node.type === 'ImportSpecifier'));
      if (refs.size() === 0) continue;
      const targets = [];
      let external = false;
      refs.forEach((p) => {
        const owner = tBindings.find((b) => inside(p, b.fnPath));
        if (!owner) external = true;
        else if (!targets.includes(owner)) targets.push(owner);
      });
      if (external) continue;

      for (const s of strings) {
        if (s.kind === 'plain') {
          s.path.replace(j.callExpression(j.identifier('t'), [j.literal(keyFor(name, s.text))]));
        } else {
          const values = j.objectExpression(
            [...new Set(s.fields)].map((f) =>
              j.property(
                'init',
                j.identifier(f),
                j.memberExpression(j.identifier('pricing'), j.identifier(f))
              )
            )
          );
          s.path.replace(
            j.callExpression(j.identifier('t'), [j.literal(keyFor(name, s.text)), values])
          );
        }
      }

      // const X = [...] -> const makeX = (t: Translator) => [...]
      const maker = `make${name[0].toUpperCase()}${name.slice(1)}`;
      const param = j.identifier('t');
      param.typeAnnotation = j.tsTypeAnnotation(
        j.tsFunctionType.from({
          parameters: [
            Object.assign(j.identifier('key'), {
              typeAnnotation: j.tsTypeAnnotation(j.tsStringKeyword()),
            }),
            Object.assign(j.identifier('values'), {
              optional: true,
              typeAnnotation: j.tsTypeAnnotation(
                j.tsTypeReference(
                  j.identifier('Record'),
                  j.tsTypeParameterInstantiation([j.tsStringKeyword(), j.tsUnknownKeyword()])
                )
              ),
            }),
          ],
          typeAnnotation: j.tsTypeAnnotation(j.tsStringKeyword()),
        })
      );
      decl.id = j.identifier(maker);
      decl.init = j.arrowFunctionExpression([param], decl.init);

      for (const b of targets) {
        const body = b.fnPath.node.body.body;
        const at = body.findIndex(
          (st) => st.type === 'VariableDeclaration' && st.declarations.some((d) => d.id.name === 't')
        );
        body.splice(at + 1, 0,
          j.variableDeclaration('const', [
            j.variableDeclarator(
              j.identifier(name),
              j.callExpression(j.identifier(maker), [j.identifier('t')])
            ),
          ])
        );
      }
      changed = true;
    }
  });

  if (!changed) return null;

  if (options.messagesOut) {
    const outPath = path.resolve(options.messagesOut);
    const current = fs.existsSync(outPath) ? JSON.parse(fs.readFileSync(outPath, 'utf8')) : {};
    current[ns] = { ...(current[ns] || {}), ...messages };
    fs.writeFileSync(outPath, `${JSON.stringify(current, null, 2)}\n`);
  }

  return root.toSource({ quote: 'single', lineTerminator: '\n' });
};

module.exports.parser = 'tsx';
