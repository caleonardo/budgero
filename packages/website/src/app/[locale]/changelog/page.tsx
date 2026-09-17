import { ChangelogPage, changelogMetadata } from '@/components/changelog-page';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  return changelogMetadata((await params).locale);
}

export default async function Page({ params }: Props) {
  return <ChangelogPage locale={(await params).locale} />;
}
