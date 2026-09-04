import type { Metadata } from 'next';
import { YnabSupportExporter } from './ynab-support-exporter';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata: Metadata = {
  title: 'YNAB Diagnostic Export | Budgero',
  description: 'Create an anonymized YNAB diagnostic file for Budgero support.',
  robots: { index: false, follow: false },
};

export default function YnabSupportExportPage() {
  return <YnabSupportExporter />;
}

