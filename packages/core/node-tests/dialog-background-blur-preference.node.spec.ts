import { describe, expect, it } from 'vitest';
import { DatabaseAdapter, NodeSqlJsAdapter, ServiceManager } from '../src';

describe('user_meta DialogBackgroundBlur preference', () => {
  it('defaults to on and round-trips through the service', async () => {
    const adapter = await NodeSqlJsAdapter.create();
    const serviceManager = new ServiceManager();
    await serviceManager.initialize(adapter as DatabaseAdapter);
    const { userMeta } = serviceManager.getServices();

    expect(userMeta.getDialogBackgroundBlur()).toBe(true);
    userMeta.setDialogBackgroundBlur(false);
    expect(userMeta.getDialogBackgroundBlur()).toBe(false);
    userMeta.setDialogBackgroundBlur(true);
    expect(userMeta.getDialogBackgroundBlur()).toBe(true);
  });
});
