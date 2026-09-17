import { changelogEntries } from './changelog-data';

export const CHANGELOG_PAGE_SIZE = 8;
export const changelogPageCount = Math.ceil(changelogEntries.length / CHANGELOG_PAGE_SIZE);
export const changelogPath = (page: number) =>
  page === 1 ? '/changelog' : `/changelog/page/${page}`;
export const entriesForChangelogPage = (page: number) =>
  changelogEntries.slice((page - 1) * CHANGELOG_PAGE_SIZE, page * CHANGELOG_PAGE_SIZE);

export function parseChangelogPage(value: string): number | null {
  if (!/^[1-9]\d*$/.test(value)) return null;
  const page = Number(value);
  return Number.isSafeInteger(page) && page <= changelogPageCount ? page : null;
}
