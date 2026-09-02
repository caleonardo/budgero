import { describe, expect, it } from 'vitest';
import {
  asMilli,
  NodeSqlJsAdapter,
  ServiceManager,
  resolveTransferPayees,
  transferInvolvesOffBudgetAccount,
} from '../src/index.js';

const checking = { Name: 'Checking', OnBudget: true };
const savings = { Name: 'Savings', OnBudget: true };
const mortgage = { Name: 'Mortgage', OnBudget: false };
const brokerage = { Name: 'Brokerage', OnBudget: false };

describe('transfer payee policy', () => {
  it('clears both payees for an internal on-budget transfer', () => {
    expect(resolveTransferPayees(checking, savings, 'Stale payee')).toEqual({
      sourcePayee: null,
      destinationPayee: null,
    });
    expect(transferInvolvesOffBudgetAccount(checking, savings)).toBe(false);
  });

  it('uses the single off-budget account as the default payee on both legs', () => {
    expect(resolveTransferPayees(checking, mortgage)).toEqual({
      sourcePayee: 'Mortgage',
      destinationPayee: 'Mortgage',
    });
    expect(resolveTransferPayees(mortgage, checking)).toEqual({
      sourcePayee: 'Mortgage',
      destinationPayee: 'Mortgage',
    });
  });

  it('keeps a custom payee only when an off-budget account is involved', () => {
    expect(resolveTransferPayees(checking, mortgage, 'Mortgage Servicer')).toEqual({
      sourcePayee: 'Mortgage Servicer',
      destinationPayee: 'Mortgage Servicer',
    });
  });

  it('uses the opposite account name when both accounts are off-budget', () => {
    expect(resolveTransferPayees(mortgage, brokerage)).toEqual({
      sourcePayee: 'Brokerage',
      destinationPayee: 'Mortgage',
    });
  });

  it('enforces empty payees when two on-budget transfer legs are recorded', async () => {
    const adapter = await NodeSqlJsAdapter.create();
    const manager = new ServiceManager();
    await manager.initialize(adapter);
    const services = manager.getServices();
    const budgetId = await services.budgets.createBudget({
      name: 'Internal transfers',
      display_currency: 'USD',
      badge_icon: 'dollar',
      number_format: '123,456.78',
      create_default_categories: true,
    });
    const source = await services.accounts.createAccount(
      'Checking',
      budgetId,
      'checking',
      'USD',
      asMilli(0),
      {},
      true
    );
    const destination = await services.accounts.createAccount(
      'Savings',
      budgetId,
      'savings',
      'USD',
      asMilli(0),
      {},
      true
    );
    const category = services.categories.getCategoryByName('Transfers', budgetId);
    if (!category) throw new Error('Transfers category missing');
    const transferId = 'internal-transfer';
    const sourceId = await services.transactions.addTransaction(
      asMilli(0),
      asMilli(10_000),
      source.ID,
      category.ID,
      budgetId,
      '2026-09-02',
      'Move money',
      transferId,
      'Savings'
    );
    const destinationId = await services.transactions.addTransaction(
      asMilli(10_000),
      asMilli(0),
      destination.ID,
      category.ID,
      budgetId,
      '2026-09-02',
      'Move money',
      transferId,
      'Checking'
    );

    expect(services.transactions.getTransactionByID(sourceId).Payee).toBeFalsy();
    expect(services.transactions.getTransactionByID(destinationId).Payee).toBeFalsy();

    await services.transactions.updateTransactionColumn(sourceId, 'Payee', 'Should be ignored');
    expect(services.transactions.getTransactionByID(sourceId).Payee).toBeFalsy();
    expect(services.transactions.getTransactionByID(destinationId).Payee).toBeFalsy();
  });
});
