import type {
  BankLinkInput,
  BankReviewInput,
  BankReviewStatus,
  BankSyncRecordInput,
} from '@budgero/core/browser';
import { S, type OpCodeEntry } from '../shared';

const BANK_SYNC_KEYS = [['bankSync', '*']];

export const bankSyncOps = {
  'bankSync.saveConnection': {
    execute: async (args) =>
      S().bankSync.saveConnection(args.budgetId as number, args.accessUrl as string),
    invalidates: BANK_SYNC_KEYS,
  },
  'bankSync.deleteConnection': {
    execute: async (args) => {
      S().bankSync.deleteConnection(args.budgetId as number);
    },
    invalidates: BANK_SYNC_KEYS,
  },
  'bankSync.saveLink': {
    execute: async (args) => {
      S().bankSync.saveLink(args.input as BankLinkInput);
    },
    invalidates: BANK_SYNC_KEYS,
  },
  'bankSync.deleteLink': {
    execute: async (args) => {
      S().bankSync.deleteLink(args.accountId as number);
    },
    invalidates: BANK_SYNC_KEYS,
  },
  'bankSync.recordSync': {
    execute: async (args) => {
      S().bankSync.recordSync(args.input as BankSyncRecordInput);
    },
    invalidates: BANK_SYNC_KEYS,
  },
  'bankSync.addReviews': {
    execute: async (args) => {
      S().bankSync.addReviews(args.reviews as BankReviewInput[]);
    },
    invalidates: BANK_SYNC_KEYS,
  },
  'bankSync.setReviewStatus': {
    execute: async (args) => {
      S().bankSync.setReviewStatus(args.id as number, args.status as BankReviewStatus);
    },
    invalidates: BANK_SYNC_KEYS,
  },
} satisfies Record<string, OpCodeEntry>;
