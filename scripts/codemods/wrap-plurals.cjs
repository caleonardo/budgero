/**
 * Converts hand-rolled English pluralization into ICU `plural()`.
 *
 *   `${n} transaction${n === 1 ? '' : 's'} deleted`
 *   -> plural(n, { one: '# transaction deleted', other: '# transactions deleted' })
 *
 * The count expression becomes `#`; any other interpolation is preserved as a
 * placeholder so translators keep a whole, reorderable sentence.
 */

const MACRO = '@lingui/core/macro';

function isStr(node) {
  return node && (node.type === 'StringLiteral' || (node.type === 'Literal' && typeof node.value === 'string'));
}

/** `X === 1 ? A : B` or `X !== 1 ? B : A` -> { count, one, other } */
function analyze(node) {
  if (!node || node.type !== 'ConditionalExpression') return null;
  const test = node.test;
  if (!test || test.type !== 'BinaryExpression') return null;
  if (test.operator !== '===' && test.operator !== '!==') return null;

  const right = test.right;
  const isOne = right && (right.type === 'NumericLiteral' || right.type === 'Literal') && right.value === 1;
  if (!isOne) return null;
  if (!isStr(node.consequent) || !isStr(node.alternate)) return null;

  return test.operator === '==='
    ? { count: test.left, one: node.consequent.value, other: node.alternate.value }
    : { count: test.left, one: node.alternate.value, other: node.consequent.value };
}

module.exports = function transformer(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);
  let changed = false;

  const src = (node) => {
    try {
      return j(node).toSource();
    } catch {
      return null;
    }
  };

  root.find(j.TemplateLiteral).forEach((path) => {
    const tl = path.node;
    const idx = tl.expressions.findIndex((e) => analyze(e));
    if (idx < 0) return;

    const info = analyze(tl.expressions[idx]);
    if (!info) return;
    const countSrc = src(info.count);
    if (!countSrc) return;

    const build = (variant) => {
      const quasis = [];
      const exprs = [];
      let acc = tl.quasis[0].value.cooked;

      for (let i = 0; i < tl.expressions.length; i++) {
        const expr = tl.expressions[i];
        const next = tl.quasis[i + 1] ? tl.quasis[i + 1].value.cooked : '';
        if (i === idx) {
          acc += variant + next;
        } else if (src(expr) === countSrc) {
          acc += '#' + next;
        } else {
          quasis.push(j.templateElement({ raw: acc, cooked: acc }, false));
          exprs.push(expr);
          acc = next;
        }
      }
      quasis.push(j.templateElement({ raw: acc, cooked: acc }, true));
      return j.templateLiteral(quasis, exprs);
    };

    const call = j.callExpression(j.identifier('plural'), [
      info.count,
      j.objectExpression([
        j.property('init', j.identifier('one'), build(info.one)),
        j.property('init', j.identifier('other'), build(info.other)),
      ]),
    ]);

    j(path).replaceWith(call);
    changed = true;
  });

  if (!changed) return null;

  const existing = root.find(j.ImportDeclaration, { source: { value: MACRO } });
  if (existing.size() > 0) {
    const specs = existing.at(0).get().node.specifiers || [];
    if (!specs.some((s) => s.imported && s.imported.name === 'plural')) {
      specs.push(j.importSpecifier(j.identifier('plural')));
    }
  } else {
    const decl = j.importDeclaration([j.importSpecifier(j.identifier('plural'))], j.literal(MACRO));
    const imports = root.find(j.ImportDeclaration);
    if (imports.size() > 0) imports.at(0).insertBefore(decl);
    else root.get().node.program.body.unshift(decl);
  }

  return root.toSource({ quote: 'single', lineTerminator: '\n' });
};

module.exports.parser = 'tsx';
