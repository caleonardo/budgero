import { describe, it, expect } from 'vitest';
import { NodeSqlJsAdapter, ServiceManager, DatabaseAdapter } from '../src';

describe('user_meta ShowGroupPercent preference', () => {
  it('defaults to off and round-trips through the service', async () => {
    const adapter = await NodeSqlJsAdapter.create();
    const sm = new ServiceManager();
    await sm.initialize(adapter as DatabaseAdapter);
    const { userMeta } = sm.getServices();

    expect(userMeta.getShowGroupPercent()).toBe(false);
    userMeta.setShowGroupPercent(true);
    expect(userMeta.getShowGroupPercent()).toBe(true);
    userMeta.setShowGroupPercent(false);
    expect(userMeta.getShowGroupPercent()).toBe(false);
  });
});
