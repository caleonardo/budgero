import { describe, expect, it } from 'vitest';
import { DatabaseAdapter, NodeSqlJsAdapter, ServiceManager } from '../src';

describe('user_meta register display preferences', () => {
  it('default to normal rows and newest-first, and round-trip through the service', async () => {
    const adapter = await NodeSqlJsAdapter.create();
    const serviceManager = new ServiceManager();
    await serviceManager.initialize(adapter as DatabaseAdapter);
    const { userMeta } = serviceManager.getServices();

    expect(userMeta.getCompactTransactionRows()).toBe(false);
    expect(userMeta.getSameDayTransactionOrder()).toBe('newest');

    userMeta.setCompactTransactionRows(true);
    userMeta.setSameDayTransactionOrder('amount');
    expect(userMeta.getCompactTransactionRows()).toBe(true);
    expect(userMeta.getSameDayTransactionOrder()).toBe('amount');
  });
});
