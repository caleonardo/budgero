import Image from 'next/image';
import Link from 'next/link';

export function MultiCurrencyExample() {
  return (
    <section className="py-12 max-w-4xl mx-auto" aria-labelledby="currency-example-heading">
      <h2 id="currency-example-heading" className="text-3xl font-bold text-foreground mb-6">
        A EUR budget with a GBP account
      </h2>
      <div className="space-y-4 text-lg text-foreground/75 leading-relaxed">
        <p>
          Suppose your household plans in euros and keeps a British account for travel. Set EUR as
          your budget currency and GBP as that account&apos;s currency. A £50 transaction stays
          visible as £50 in the account, while categories and reports use its euro value.
        </p>
        <p>
          At an illustrative rate of €1.18 per £1, that purchase uses €59 of the category&apos;s
          available money. To record an actual conversion cost of €60, override the
          transaction&apos;s rate to 1.20 so the budget reflects that cost. These rates illustrate
          the calculation; they are not current exchange-rate quotes.
        </p>
        <p>
          Budgero keeps the original amount, converted amount, and rate together. Read the{' '}
          <Link href="/docs/multi-currency" className="underline hover:text-foreground">
            currency and exchange-rate guide
          </Link>{' '}
          for transfers, rate overrides, and offline use.
        </p>
      </div>
      <figure className="mt-8">
        <Image
          src="/features_desktop/multi_currency_desktop.png"
          alt="Budgero transfer dialog showing a conversion from a USD account to a EUR account"
          width={2880}
          height={2160}
          sizes="(min-width: 1024px) 896px, 100vw"
          className="w-full h-auto rounded-xl border border-border/60"
        />
        <figcaption className="mt-3 text-sm text-foreground/60">
          Budgero&apos;s transfer dialog with a USD-to-EUR conversion. The GBP example above is
          illustrative.
        </figcaption>
      </figure>
      <div className="mt-8 space-y-4 text-base text-foreground/75 leading-relaxed">
        <h3 className="text-xl font-semibold text-foreground">
          Bring your bank transactions with you
        </h3>
        <p>
          Budgero does not connect automatically to your bank. Download a CSV, map its date,
          description, and amount columns, then review the imported transactions against your
          statement. A supported currency does not guarantee that every bank&apos;s export needs no
          adjustments. Start with a small sample and check date formats, decimal separators, and
          debit/credit columns before importing your history.
        </p>
        <Link href="/docs/csv-import" className="inline-block underline hover:text-foreground">
          Follow the CSV import and reconciliation guide
        </Link>
      </div>
    </section>
  );
}
