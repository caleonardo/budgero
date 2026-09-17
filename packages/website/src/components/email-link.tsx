const escapeHtml = (value: string) =>
  value.replace(
    /[&<>"']/g,
    (character) =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
      })[character]!
  );

/** Keep public contact links intact when Cloudflare rewrites HTML at the edge. */
export function EmailLink({
  email,
  label = email,
  className = '',
}: {
  email: 'hello@budgero.app' | 'privacy@budgero.app';
  label?: string;
  className?: string;
}) {
  // JSX comments are removed by React. Emit Cloudflare's documented opt-out
  // comments as HTML, escaping every value rather than accepting raw markup.
  return (
    <span
      dangerouslySetInnerHTML={{
        __html: `<!--email_off--><a href="mailto:${escapeHtml(email)}" class="${escapeHtml(className)}">${escapeHtml(label)}</a><!--/email_off-->`,
      }}
    />
  );
}
