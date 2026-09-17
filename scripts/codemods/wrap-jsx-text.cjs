/**
 * Wraps user-facing JSX text in <Trans>.
 *
 * Wraps an element's ENTIRE children (not just the text node) so translators get
 * a whole sentence with placeholders and can reorder freely — German pushes verbs
 * to the end of the clause, which per-fragment wrapping makes impossible.
 *
 * Conservative by design: any element with a child it cannot reason about is left
 * untouched and reported, rather than guessed at.
 */

const MACRO = '@lingui/react/macro';
const SKIP_ELEMENTS = new Set(['code', 'pre', 'script', 'style', 'svg', 'path', 'Trans']);
const SKIP_TEXT = /^[\s ]*$/;

// Text that carries no translatable content on its own.
const NOT_WORDS = /^[\s\d\p{P}\p{S}]*$/u;
const URL_OR_EMAIL = /^(https?:\/\/|www\.|mailto:)|^[\w.+-]+@[\w-]+\.\w+$/i;
const VERSION_LIKE = /^v?\d+(\.\d+)*([-+][\w.]+)?$/;

function meaningful(raw) {
  if (SKIP_TEXT.test(raw)) return false;
  const t = raw.trim();
  if (t.length < 2) return false;
  if (NOT_WORDS.test(t)) return false;
  if (URL_OR_EMAIL.test(t)) return false;
  if (VERSION_LIKE.test(t)) return false;
  // A lone token with no spaces and no lowercase run is almost always an
  // identifier, path, or acronym rather than a sentence.
  if (!/\s/.test(t) && !/[a-z]{2}/.test(t)) return false;
  return /\p{L}/u.test(t);
}

function elementName(node) {
  const n = node.openingElement && node.openingElement.name;
  if (!n) return null;
  if (n.type === 'JSXIdentifier') return n.name;
  if (n.type === 'JSXMemberExpression') return n.property && n.property.name;
  return null;
}

function simpleExpression(expr) {
  if (!expr) return false;
  switch (expr.type) {
    case 'Identifier':
      return true;
    case 'MemberExpression':
      return !expr.computed && simpleExpression(expr.object);
    case 'JSXEmptyExpression':
      return true;
    default:
      return false;
  }
}

// recast reprints JSXText from its decoded value, turning `&lt;` back into a
// literal `<` and producing invalid JSX. Leave entity-bearing text alone.
function hasHtmlEntity(node) {
  const raw = (node.extra && node.extra.raw) || node.raw;
  return typeof raw === 'string' && /&[a-zA-Z#][a-zA-Z0-9]*;/.test(raw);
}

function childOk(child, report) {
  switch (child.type) {
    case 'JSXText':
      if (hasHtmlEntity(child)) {
        report.htmlEntity++;
        return false;
      }
      return true;
    case 'JSXExpressionContainer':
      if (simpleExpression(child.expression)) return true;
      report.complexExpression++;
      return false;
    case 'JSXElement': {
      const name = elementName(child);
      if (name && SKIP_ELEMENTS.has(name)) {
        report.skippedTag++;
        return false;
      }
      // Nested elements are fine for Trans only when their own children are simple.
      return (child.children || []).every((c) => childOk(c, report));
    }
    default:
      report.otherNode++;
      return false;
  }
}

function insideTrans(path) {
  let p = path.parent;
  while (p) {
    const n = p.node;
    if (n && n.type === 'JSXElement' && elementName(n) === 'Trans') return true;
    p = p.parent;
  }
  return false;
}

module.exports = function transformer(file, api, options) {
  const j = api.jscodeshift;
  const root = j(file.source);
  const report = { wrapped: 0, complexExpression: 0, skippedTag: 0, otherNode: 0, htmlEntity: 0 };
  let changed = false;

  root.find(j.JSXElement).forEach((path) => {
    const node = path.node;
    const name = elementName(node);
    if (name && SKIP_ELEMENTS.has(name)) return;

    const children = node.children || [];
    if (!children.some((c) => c.type === 'JSXText' && meaningful(c.value))) return;
    if (insideTrans(path)) return;
    if (!children.every((c) => childOk(c, report))) return;

    // Preserve surrounding whitespace outside <Trans> so layout is unaffected.
    let start = 0;
    let end = children.length;
    while (start < end && children[start].type === 'JSXText' && SKIP_TEXT.test(children[start].value))
      start++;
    while (end > start && children[end - 1].type === 'JSXText' && SKIP_TEXT.test(children[end - 1].value))
      end--;
    if (start >= end) return;

    const lead = children.slice(0, start);
    const inner = children.slice(start, end);
    const tail = children.slice(end);

    const trans = j.jsxElement(
      j.jsxOpeningElement(j.jsxIdentifier('Trans'), []),
      j.jsxClosingElement(j.jsxIdentifier('Trans')),
      inner
    );

    node.children = [...lead, trans, ...tail];
    report.wrapped++;
    changed = true;
  });

  if (!changed) {
    if (options.reportPath) require('fs').appendFileSync(options.reportPath, `${file.path}\t${JSON.stringify(report)}\n`);
    return null;
  }

  const hasImport =
    root.find(j.ImportDeclaration, { source: { value: MACRO } }).size() > 0;

  if (hasImport) {
    const decl = root.find(j.ImportDeclaration, { source: { value: MACRO } }).at(0);
    const specs = decl.get().node.specifiers || [];
    if (!specs.some((s) => s.imported && s.imported.name === 'Trans')) {
      specs.push(j.importSpecifier(j.identifier('Trans')));
    }
  } else {
    const imports = root.find(j.ImportDeclaration);
    const decl = j.importDeclaration([j.importSpecifier(j.identifier('Trans'))], j.literal(MACRO));
    if (imports.size() > 0) imports.at(0).insertBefore(decl);
    else root.get().node.program.body.unshift(decl);
  }

  if (options.reportPath)
    require('fs').appendFileSync(options.reportPath, `${file.path}\t${JSON.stringify(report)}\n`);

  return root.toSource({ quote: 'single', lineTerminator: '\n' });
};

module.exports.parser = 'tsx';
