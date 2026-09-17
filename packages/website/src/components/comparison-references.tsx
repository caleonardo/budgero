import { useTranslations, useLocale } from 'next-intl';
type Source = { label: string; href: string };

export function ComparisonReferences({
  sources,
  reviewedOn,
}: {
  sources: Source[];
  reviewedOn: string;
}) {
  const copy = useTranslations('updates');
  const locale = useLocale();
  const reviewDate = new Date(reviewedOn).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
  return (
    <section className="py-10 max-w-3xl mx-auto" aria-label={copy('u_68577f782861')}>
      <h2 className="text-2xl font-semibold text-foreground mb-4">{copy('u_21cabd412236')}</h2>
      <p className="text-sm text-foreground/70 leading-relaxed">
        {' '}
        {copy('u_fe37cdec8213')} <time dateTime={reviewedOn}>{reviewDate}</time>
        {copy('u_7ce0a117350b')}{' '}
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
