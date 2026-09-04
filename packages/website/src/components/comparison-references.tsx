type Source = { label: string; href: string };

export function ComparisonReferences({
  sources,
  reviewedOn,
}: {
  sources: Source[];
  reviewedOn: string;
}) {
  const reviewDate = new Date(reviewedOn).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
  return (
    <section className="py-10 max-w-3xl mx-auto" aria-label="Comparison sources">
      <h2 className="text-2xl font-semibold text-foreground mb-4">Sources and scope</h2>
      <p className="text-sm text-foreground/70 leading-relaxed">
        By Budgero, the maker of one of the apps compared. The references below were checked on{' '}
        <time dateTime={reviewedOn}>{reviewDate}</time>. These are documentation-based comparisons;
        bank availability and subscription offers can change. Check the provider&apos;s current
        terms and your specific accounts before switching.
      </p>
      <ul className="mt-4 space-y-2 text-sm text-foreground/75">
        {sources.map((source) => (
          <li key={source.href}>
            <a href={source.href} className="underline underline-offset-4 hover:text-foreground">
              {source.label}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
