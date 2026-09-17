/**
 * Wraps translatable JSX attribute strings and toast messages in the `t` macro,
 * injecting `const { t } = useLingui()` into the enclosing component or hook.
 *
 * Skips anything whose enclosing function is not a component or a custom hook —
 * injecting a hook into a plain callback would violate the rules of hooks.
 */

const MACRO = '@lingui/react/macro';

const ATTRS = new Set([
  'placeholder',
  'title',
  'aria-label',
  'label',
  'description',
  'alt',
  'emptyText',
  'confirmText',
  'cancelText',
]);

const TOAST = /^toast$/;
const URL_OR_EMAIL = /^(https?:\/\/|www\.|mailto:|\/)|^[\w.+-]+@[\w-]+\.\w+$/i;
const TOKEN_LIKE = /^[\w-]*[-_.]{1}[\w-]*$/;

function translatable(value) {
  const t = (value || '').trim();
  if (t.length < 3) return false;
  if (URL_OR_EMAIL.test(t)) return false;
  if (!/\p{L}/u.test(t)) return false;
  // Needs a lowercase run somewhere, else it is an acronym or a code.
  if (!/[a-z]{2}/.test(t)) return false;
  // Slug/ident-looking single tokens ("budg-xxxx-xxxx", "data_key").
  if (!/\s/.test(t) && TOKEN_LIKE.test(t)) return false;
  return true;
}

function isComponentLike(name) {
  return !!name && (/^[A-Z]/.test(name) || /^use[A-Z]/.test(name));
}

function enclosingComponent(j, path) {
  let p = path.parent;
  while (p) {
    const n = p.node;
    if (n.type === 'FunctionDeclaration' && isComponentLike(n.id && n.id.name)) return n;
    if (n.type === 'ArrowFunctionExpression' || n.type === 'FunctionExpression') {
      const parent = p.parent && p.parent.node;
      if (parent && parent.type === 'VariableDeclarator' && isComponentLike(parent.id && parent.id.name)) {
        return n;
      }
      if (parent && parent.type === 'ExportDefaultDeclaration') return n;
    }
    p = p.parent;
  }
  return null;
}

function hasTBinding(fn) {
  if (!fn.body || fn.body.type !== 'BlockStatement') return false;
  return fn.body.body.some(
    (s) =>
      s.type === 'VariableDeclaration' &&
      s.declarations.some(
        (d) =>
          d.init &&
          d.init.type === 'CallExpression' &&
          d.init.callee &&
          d.init.callee.name === 'useLingui'
      )
  );
}

function injectT(j, fn) {
  if (!fn.body || fn.body.type !== 'BlockStatement') return false;
  if (hasTBinding(fn)) return true;
  const decl = j.variableDeclaration('const', [
    j.variableDeclarator(
      j.objectPattern([
        Object.assign(j.property('init', j.identifier('t'), j.identifier('t')), { shorthand: true }),
      ]),
      j.callExpression(j.identifier('useLingui'), [])
    ),
  ]);
  fn.body.body.unshift(decl);
  return true;
}

function tTemplate(j, value) {
  return j.taggedTemplateExpression(
    j.identifier('t'),
    j.templateLiteral([j.templateElement({ raw: value, cooked: value }, true)], [])
  );
}

module.exports = function transformer(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);
  const touchedFns = new Set();
  let changed = false;

  root.find(j.JSXAttribute).forEach((path) => {
    const node = path.node;
    const name = node.name && (node.name.name || (node.name.namespace && node.name.name));
    const attrName =
      typeof name === 'string'
        ? name
        : node.name && node.name.type === 'JSXNamespacedName'
          ? `${node.name.namespace.name}-${node.name.name.name}`
          : null;
    if (!attrName || !ATTRS.has(attrName)) return;
    if (!node.value || node.value.type !== 'StringLiteral' && node.value.type !== 'Literal') return;
    const value = node.value.value;
    if (typeof value !== 'string' || !translatable(value)) return;

    const fn = enclosingComponent(j, path);
    if (!fn) return;

    node.value = j.jsxExpressionContainer(tTemplate(j, value));
    touchedFns.add(fn);
    changed = true;
  });

  root.find(j.CallExpression).forEach((path) => {
    const callee = path.node.callee;
    const isToast =
      callee &&
      ((callee.type === 'MemberExpression' && callee.object && TOAST.test(callee.object.name)) ||
        (callee.type === 'Identifier' && TOAST.test(callee.name)));
    if (!isToast) return;

    const first = path.node.arguments[0];
    if (!first || (first.type !== 'StringLiteral' && first.type !== 'Literal')) return;
    if (typeof first.value !== 'string' || !translatable(first.value)) return;

    const fn = enclosingComponent(j, path);
    if (!fn) return;

    path.node.arguments[0] = tTemplate(j, first.value);
    touchedFns.add(fn);
    changed = true;
  });

  if (!changed) return null;

  let injected = false;
  touchedFns.forEach((fn) => {
    if (injectT(j, fn)) injected = true;
  });
  if (!injected) return null;

  const existing = root.find(j.ImportDeclaration, { source: { value: MACRO } });
  if (existing.size() > 0) {
    const specs = existing.at(0).get().node.specifiers || [];
    if (!specs.some((s) => s.imported && s.imported.name === 'useLingui')) {
      specs.push(j.importSpecifier(j.identifier('useLingui')));
    }
  } else {
    const decl = j.importDeclaration(
      [j.importSpecifier(j.identifier('useLingui'))],
      j.literal(MACRO)
    );
    const imports = root.find(j.ImportDeclaration);
    if (imports.size() > 0) imports.at(0).insertBefore(decl);
    else root.get().node.program.body.unshift(decl);
  }

  return root.toSource({ quote: 'single', lineTerminator: '\n' });
};

module.exports.parser = 'tsx';
