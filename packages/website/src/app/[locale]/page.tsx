import { getTranslations, setRequestLocale } from 'next-intl/server';
import { withLocalizedUrls } from '@/lib/localized-metadata';
import { useTranslations } from 'next-intl';
export const dynamic = 'force-static';
export const revalidate = false;
import type { Metadata } from 'next';
import LandingPage from '@/components/landing/LandingPage';
import { pricing } from '@/lib/pricing';
import { homepageFaqs } from '@/lib/homepage-content';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const copy = await getTranslations({
    locale: (await params).locale,
    namespace: 'updates',
  });
  const { locale } = await params;
  return withLocalizedUrls(locale, '/', {
    title: copy('u_f2ecf929ee9c'),
    description: copy('u_0abc6f0aa791', {
      p0: pricing.monthly,
      p1: pricing.yearly,
    }),
    alternates: { canonical: 'https://budgero.app/' },
    openGraph: {
      title: copy('u_f2ecf929ee9c'),
      description: copy('u_0abc6f0aa791', {
        p0: pricing.monthly,
        p1: pricing.yearly,
      }),
      url: 'https://budgero.app/',
      // OG image is auto-emitted by /src/app/opengraph-image.tsx (1200x630 PNG).
    },
    twitter: {
      card: 'summary_large_image',
      title: copy('u_f2ecf929ee9c'),
      description: copy('u_0abc6f0aa791', {
        p0: pricing.monthly,
        p1: pricing.yearly,
      }),
      // Twitter image is auto-emitted by the same file convention.
    },
  });
}

const jsonLd = (copy: CopyTranslator) => ({
  '@context': 'https://schema.org',

  '@graph': [
    {
      '@type': 'SoftwareApplication',
      image: 'https://budgero.app/logo_512.png',
      '@id': 'https://budgero.app/#software',
      name: copy('u_045497ff4fcf'),
      applicationCategory: 'FinanceApplication',
      operatingSystem: [
        copy('u_2975104784a4'),
        copy('u_d598026a9cbc'),
        copy('u_aed6b7aa2a05'),
        copy('u_4828e60247c1'),
        copy('u_6d612a86bee4'),
        copy('u_355f5e748485'),
      ],
      url: 'https://budgero.app/',
      description: copy('u_e627a5cc71a3'),
      offers: [
        {
          '@type': 'Offer',
          '@id': 'https://budgero.app/#offer-self-host',
          name: copy('u_02c52ce2f60b'),
          price: '0',
          priceCurrency: 'USD',
          availability: 'https://schema.org/InStock',
        },
        {
          '@type': 'Offer',
          '@id': 'https://budgero.app/#offer-cloud-monthly',
          name: copy('u_94523db6cbd4'),
          price: pricing.monthly.replace(/[^0-9.]/g, ''),
          priceCurrency: 'USD',
          description: copy('u_cdb2da91d389'),
          priceSpecification: {
            '@type': 'UnitPriceSpecification',
            price: pricing.monthly.replace(/[^0-9.]/g, ''),
            priceCurrency: 'USD',
            unitText: 'per month',
          },
          availability: 'https://schema.org/InStock',
        },
        {
          '@type': 'Offer',
          '@id': 'https://budgero.app/#offer-cloud-yearly',
          name: copy('u_6fdf0566337b'),
          price: pricing.yearly.replace(/[^0-9.]/g, ''),
          priceCurrency: 'USD',
          description: copy('u_2eafa4276c5a'),
          priceSpecification: {
            '@type': 'UnitPriceSpecification',
            price: pricing.yearly.replace(/[^0-9.]/g, ''),
            priceCurrency: 'USD',
            unitText: 'per year',
          },
          availability: 'https://schema.org/InStock',
        },
      ],
    },
    {
      '@type': 'FAQPage',
      '@id': 'https://budgero.app/#faqs',
      mainEntity: homepageFaqs(copy).map((faq) => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer,
        },
      })),
    },
  ],
});

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const copy = await getTranslations({
    locale: (await params).locale,
    namespace: 'updates',
  });
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd(copy)) }}
      />
      <LandingPage />
    </>
  );
}
type CopyTranslator = (key: string, values?: Record<string, string | number>) => string;
