import { getImageProps } from 'next/image';

export function BudgetPreview() {
  const { props: desktop } = getImageProps({
    src: '/demo-budget-desktop.png',
    alt: 'A demo household budget in Budgero, with everyday spending, home bills, and savings goals.',
    width: 2880,
    height: 1920,
    sizes: '(min-width: 1200px) 1152px, calc(100vw - 48px)',
  });
  const { props: mobile } = getImageProps({
    src: '/demo-budget-mobile.png',
    alt: 'The same demo budget on a phone, showing groceries spending and the amount still available.',
    width: 780,
    height: 1687,
    sizes: '(min-width: 392px) 360px, calc(100vw - 32px)',
  });

  return (
    <figure className="mx-auto mt-10 max-w-[360px] sm:mt-12 md:max-w-6xl">
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-2xl shadow-black/10">
        <picture>
          <source
            media="(min-width: 768px)"
            srcSet={desktop.srcSet}
            sizes={desktop.sizes}
            width={desktop.width}
            height={desktop.height}
          />
          {/* Next optimizes both sources; picture downloads only the matching layout. */}
          <img
            {...mobile}
            alt={desktop.alt}
            loading="eager"
            fetchPriority="high"
            className="h-auto w-full"
          />
        </picture>
      </div>
      <figcaption className="mt-3 text-center text-xs leading-5 text-muted-foreground">
        A plan for everyday spending and the things ahead. Shown with demo data.
      </figcaption>
    </figure>
  );
}
