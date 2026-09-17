import { getTranslations, setRequestLocale } from 'next-intl/server';
import { withLocalizedUrls } from '@/lib/localized-metadata';
import type { Metadata } from 'next';
import { YnabSupportExporter } from './ynab-support-exporter';

export const dynamic = 'force-static';
export const revalidate = false;

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
  return withLocalizedUrls(locale, '/ynab-support-export', {
    title: copy('u_c182b285bb39'),
    description: copy('u_85b243f096cb'),
    robots: { index: false, follow: false },
  });
}

export default async function YnabSupportExportPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <YnabSupportExporter />;
}
