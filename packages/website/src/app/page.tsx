export const dynamic = 'force-static';
export const revalidate = false;
import type { Metadata } from 'next';
import LandingPage from '@/components/landing/LandingPage';
import { pricing } from '@/lib/pricing';
import { homepageFaqs } from '@/lib/homepage-content';

export const metadata: Metadata = {
  title: 'Budgero: Private Budgeting Without Bank Connections',
  description: `Know what you can spend with private, multi-currency budgeting. Try Budgero Cloud free for 35 days. No credit card required. Then ${pricing.monthly}/month or ${pricing.yearly}/year.`,
  alternates: { canonical: 'https://budgero.app/' },
  openGraph: {
    title: 'Budgero: Private Budgeting Without Bank Connections',
    description: `Know what you can spend with private, multi-currency budgeting. Try Budgero Cloud free for 35 days. No credit card required. Then ${pricing.monthly}/month or ${pricing.yearly}/year.`,
    url: 'https://budgero.app/',
    // OG image is auto-emitted by /src/app/opengraph-image.tsx (1200x630 PNG).
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Budgero: Private Budgeting Without Bank Connections',
    description: `Know what you can spend with private, multi-currency budgeting. Try Budgero Cloud free for 35 days. No credit card required. Then ${pricing.monthly}/month or ${pricing.yearly}/year.`,
    // Twitter image is auto-emitted by the same file convention.
  },
};

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
      description:
        'Plan your spending, manage accounts across currencies, and budget together with zero-knowledge encryption. Try managed Cloud or self-host for free.',
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
          description: 'Monthly Cloud plan with encrypted sync',
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
          description: 'Yearly Cloud plan with encrypted sync',
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
      mainEntity: homepageFaqs.map((faq) => ({
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

export default function Home() {
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
