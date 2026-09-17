import { notFound, permanentRedirect } from 'next/navigation';
import { ChangelogPage, changelogMetadata } from '@/components/changelog-page';
import { changelogPageCount, parseChangelogPage } from '@/lib/changelog-pagination';
import { localizedPath } from '@/lib/content-routing';

type Props = { params: Promise<{ locale: string; page: string }> };

export function generateStaticParams() {
  return Array.from({ length: changelogPageCount - 1 }, (_, index) => ({
    page: String(index + 2),
  }));
}

async function resolvePage(params: Props['params']) {
  const { locale, page: value } = await params;
  const page = parseChangelogPage(value);
  if (page === null) notFound();
  if (page === 1) permanentRedirect(localizedPath(locale, '/changelog'));
  return { locale, page };
}

export async function generateMetadata({ params }: Props) {
  const { locale, page } = await resolvePage(params);
  return changelogMetadata(locale, page);
}

export default async function Page({ params }: Props) {
  return <ChangelogPage {...await resolvePage(params)} />;
}
