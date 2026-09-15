import { useTranslations } from 'next-intl';
import { getImageProps } from 'next/image';

export function BudgetPreview() {
  const copy = useTranslations('updates');
  const { props: desktop } = getImageProps({
    src: '/demo-budget-desktop.png',
    alt: copy('u_b83e43a2b18b'),
    width: 2880,
    height: 1920,
    sizes: '(min-width: 1200px) 1152px, calc(100vw - 48px)',
  });
  const { props: mobile } = getImageProps({
    src: '/demo-budget-mobile.png',
    alt: copy('u_5cc452d6a9f6'),
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
        {' '}
        {copy('u_30be50b17781')}{' '}
      </figcaption>
    </figure>
  );
}
