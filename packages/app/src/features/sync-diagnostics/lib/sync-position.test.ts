import { describe, expect, it } from 'vitest';
import { buildDiagnosticsReport, describeSyncPosition } from './sync-position';
import { decodeLogEntry } from './decode-log-entry';

describe('describeSyncPosition', () => {
  it('reports how far behind the device and the snapshot are', () => {
    expect(describeSyncPosition(40, 52, 45)).toEqual({
      status: 'behind',
      behind: 12,
      snapshotTail: 7,
    });
    expect(describeSyncPosition(52, 52, 52)).toEqual({
      status: 'synced',
      behind: 0,
      snapshotTail: 0,
    });
    expect(describeSyncPosition(60, 52, 0)).toEqual({
      status: 'ahead',
      behind: 0,
      snapshotTail: null,
    });
    expect(describeSyncPosition(undefined, 52, 50).status).toBe('unknown');
  });
});

describe('buildDiagnosticsReport', () => {
  it('lists versions and positions without budget data', () => {
    const report = buildDiagnosticsReport(
      {
        appVersion: '1.15.1',
        buildSha: 'abc123',
        serverVersion: '1.15.1',
        latestVersion: '1.15.1',
        schemaVersion: 67,
        supportedSchemaVersion: 67,
        dataFormatVersion: 2,
        spaceId: 'space-1',
        runtimeState: 'Ready',
        connected: true,
        cursor: 40,
        head: 52,
        snapshotVersion: 45,
        snapshotUpdatedAt: undefined,
        pendingCount: 3,
        lastError: null,
      },
      new Date('2026-10-02T12:00:00Z')
    );
    expect(report).toContain('Position: 40 / server 52 (behind, 12 behind)');
    expect(report).toContain('Snapshot: 45 (+7 after it), updated ?');
    expect(report).toContain('Unconfirmed local changes: 3');
  });
});

describe('decodeLogEntry', () => {
  const entry = {
    id: 'm1',
    user_id: 'u1',
    version: 9,
    base_version: 8,
    timestamp: '2026-10-02T10:00:00Z',
    encrypted_payload: 'cipher',
  };

  it('decrypts and upgrades legacy decimal money to milliunits', async () => {
    const decoded = await decodeLogEntry(entry, {
      decryptMutation: async () => ({ op: 'transactions.add', args: { inflow: 0, outflow: 12.5 } }),
    });
    expect(decoded).toMatchObject({ version: 9, op: 'transactions.add', error: null });
    expect(decoded.args?.outflow).toBe(12500);
  });

  it('keeps a failed entry visible with its error', async () => {
    const decoded = await decodeLogEntry(entry, {
      decryptMutation: async () => {
        throw new Error('bad tag');
      },
    });
    expect(decoded).toMatchObject({ op: null, error: 'bad tag' });
  });
});
