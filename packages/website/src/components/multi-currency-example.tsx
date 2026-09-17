import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';

export function MultiCurrencyExample() {
  const copy = useTranslations('updates');
  return (
    <section className="py-12 max-w-4xl mx-auto" aria-labelledby="currency-example-heading">
      <h2 id="currency-example-heading" className="text-3xl font-bold text-foreground mb-6">
        {' '}
        {copy('u_eb418fcfab2d')}{' '}
      </h2>
      <div className="space-y-4 text-lg text-foreground/75 leading-relaxed">
        <p> {copy('u_1b671170c614')} </p>
        <p> {copy('u_6d1b7adef011')} </p>
        <p>
          {' '}
          {copy('u_aacd26cc6c6e')}{' '}
          <Link href="/docs/multi-currency" className="underline hover:text-foreground">
            {' '}
            {copy('u_709d6781e312')}{' '}
          </Link>{' '}
          {copy('u_ccb88137d452')}{' '}
        </p>
      </div>
      <figure className="mt-8">
        <Image
          src="/features_desktop/multi_currency_desktop.png"
          alt={copy('u_ef9c2951cea5')}
          width={2880}
          height={2160}
          sizes="(min-width: 1024px) 896px, 100vw"
          className="w-full h-auto rounded-xl border border-border/60"
        />
        <figcaption className="mt-3 text-sm text-foreground/60">
          {' '}
          {copy('u_97b26520fb81')}{' '}
        </figcaption>
      </figure>
      <div className="mt-8 space-y-4 text-base text-foreground/75 leading-relaxed">
        <h3 className="text-xl font-semibold text-foreground"> {copy('u_040d8cd847b2')} </h3>
        <p> {copy('u_f253110be9f7')} </p>
        <Link href="/docs/csv-import" className="inline-block underline hover:text-foreground">
          {' '}
          {copy('u_6199de002ae0')}{' '}
        </Link>
      </div>
    </section>
  );
}
