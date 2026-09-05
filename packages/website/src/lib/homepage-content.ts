import { pricing } from './pricing';

// Keep the visible answers and FAQ structured data in sync.
export const homepageFaqs = [
  {
    question: 'What happens after the 35-day trial?',
    answer: `Choose ${pricing.monthly}/month or ${pricing.yearly}/year to keep using Budgero Cloud. Tax is included. You do not enter a credit card to start the trial, so you will not be charged automatically when it ends.`,
  },
  {
    question: 'Do I need to connect my bank?',
    answer:
      'No. Budgero never asks for your bank login. Add transactions yourself or import a CSV from your bank, then review and categorize them in your budget.',
  },
  {
    question: 'Can I bring my budget from YNAB?',
    answer:
      'Yes. Connect to YNAB or upload a YNAB export to bring your accounts, categories, and transaction history. Review the import and reconcile your account balances before continuing with your budget.',
  },
  {
    question: 'Who can see my financial data?',
    answer:
      'Your budget is encrypted on your device before it syncs. Budgero cannot read its contents. Only you and the people you choose to share your workspace with can decrypt it. Keep your master password safe: it protects access to your budget.',
  },
  {
    question: 'Can I budget with my partner and use my phone?',
    answer:
      'Yes. A Cloud workspace includes up to five people. Use Budgero in your browser on a phone, tablet, or computer, with encrypted sync across your devices.',
  },
  {
    question: 'Can I export my data or self-host later?',
    answer:
      'Yes. Download a full SQLite backup or a CSV bundle from Data Management. Budgero is open source under AGPL-3.0 and free to self-host. With self-hosting, you manage the server, updates, and backups yourself.',
  },
];
