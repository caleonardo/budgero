export const dynamic = 'force-static';
export const revalidate = false;
import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import LandingPage from '@/components/landing/LandingPage';
import { FAQ_KEYS } from '@/components/landing/faq';
import { pricing } from '@/lib/pricing';

type Params = { params: Promise<{ locale: string }> };

const SITE = 'https://budgero.app';

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'home' });
  const canonical = locale === 'en' ? `${SITE}/` : `${SITE}/${locale}`;
  return {
    title: t('meta_title'),
    description: t('meta_description'),
    alternates: {
      canonical,
      languages: {
        en: `${SITE}/`,
        de: `${SITE}/de`,
        fr: `${SITE}/fr`,
        es: `${SITE}/es`,
        nl: `${SITE}/nl`,
        'x-default': `${SITE}/`,
      },
    },
    openGraph: {
      title: t('meta_title'),
      description: t('meta_description'),
      url: canonical,
      // OG image is auto-emitted by /src/app/opengraph-image.tsx (1200x630 PNG).
    },
    twitter: {
      card: 'summary_large_image',
      title: t('meta_title'),
      description: t('meta_description'),
      // Twitter image is auto-emitted by the same file convention.
    },
  };
}

export default async function Home({ params }: Params) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('home');

  const faqs = FAQ_KEYS.map((key) => ({
    question: t(`faq_${key}_q`),
    answer: t(`faq_${key}_a`, { monthly: pricing.monthly, yearly: pricing.yearly }),
  }));

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SoftwareApplication',
        image: 'https://budgero.app/logo_512.png',
        '@id': 'https://budgero.app/#software',
        name: 'Budgero',
        applicationCategory: 'FinanceApplication',
        operatingSystem: ['Web', 'Windows', 'macOS', 'Linux', 'Android', 'iOS'],
        url: 'https://budgero.app/',
        description: t('jsonld_description'),
        offers: [
          {
            '@type': 'Offer',
            '@id': 'https://budgero.app/#offer-self-host',
            name: 'Budgero Self-Host',
            price: '0',
            priceCurrency: 'USD',
            availability: 'https://schema.org/InStock',
          },
          {
            '@type': 'Offer',
            '@id': 'https://budgero.app/#offer-cloud-monthly',
            name: 'Budgero Cloud (monthly)',
            price: pricing.monthly.replace(/[^0-9.]/g, ''),
            priceCurrency: 'USD',
            description: t('offer_monthly_desc'),
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
            name: 'Budgero Cloud (yearly)',
            price: pricing.yearly.replace(/[^0-9.]/g, ''),
            priceCurrency: 'USD',
            description: t('offer_yearly_desc'),
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
        mainEntity: faqs.map((faq) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.answer,
          },
        })),
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <LandingPage />
    </>
  );
}
