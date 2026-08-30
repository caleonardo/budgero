import { asMilli, type GetTransactionsByAccountRow, type Transaction } from '@budgero/core/browser';
import { recurringInitialValuesFromTransaction } from './useRecurringEditorFromTransaction';

const sourceLeg = {
  ID: 10,
  TransferID: 'transfer-1',
  AccountID: 1,
  CategoryID: 4,
  Date: '2026-08-29',
  Memo: 'Move savings',
  Payee: 'Savings transfer',
  InflowConverted: asMilli(0),
  OutflowConverted: asMilli(9_000),
  InflowNative: asMilli(0),
  OutflowNative: asMilli(10_000),
} as Transaction;

const destinationLeg = {
  ID: 11,
  TransferID: 'transfer-1',
  AccountID: 2,
  CategoryID: 4,
  Date: '2026-08-30',
  Memo: 'Received savings',
  Payee: 'Incoming transfer',
  InflowConverted: asMilli(9_000),
  OutflowConverted: asMilli(0),
  InflowNative: asMilli(117_000),
  OutflowNative: asMilli(0),
} as Transaction;

describe('recurringInitialValuesFromTransaction', () => {
  it.each([
    ['source', sourceLeg],
    ['destination', destinationLeg],
  ])('reconstructs the same recurring transfer from the %s leg', (_name, selectedLeg) => {
    const values = recurringInitialValuesFromTransaction(
      selectedLeg as GetTransactionsByAccountRow,
      selectedLeg.AccountID,
      [sourceLeg, destinationLeg]
    );

    expect(values).toMatchObject({
      direction: 'outflow',
      accountId: 1,
      toAccountId: 2,
      amount: asMilli(10_000),
      memo: 'Move savings',
      name: 'Savings transfer',
      schedule: { startDate: '2026-08-29' },
    });
  });

  it('does not flatten malformed or split transfer groups', () => {
    expect(
      recurringInitialValuesFromTransaction(destinationLeg as GetTransactionsByAccountRow, 2, [
        destinationLeg,
      ])
    ).toBeNull();
  });

  it('keeps ordinary transactions as inflow or outflow templates', () => {
    const values = recurringInitialValuesFromTransaction(
      {
        ...destinationLeg,
        TransferID: undefined,
        Payee: 'Employer',
      } as GetTransactionsByAccountRow,
      2
    );

    expect(values).toMatchObject({
      direction: 'inflow',
      accountId: 2,
      amount: asMilli(117_000),
      name: 'Employer',
    });
    expect(values?.toAccountId).toBeUndefined();
  });
});
