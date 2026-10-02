export type SyncPositionStatus = 'synced' | 'behind' | 'ahead' | 'unknown';

export interface SyncPosition {
  status: SyncPositionStatus;
  /** Log entries this device has not applied yet. */
  behind: number;
  /** Log entries newer than the server snapshot; a fresh restore replays these. */
  snapshotTail: number | null;
}

export function describeSyncPosition(
  cursor: number | undefined,
  head: number | undefined,
  snapshot: number | undefined
): SyncPosition {
  const snapshotTail = head !== undefined && snapshot ? Math.max(0, head - snapshot) : null;
  if (cursor === undefined || head === undefined) {
    return { status: 'unknown', behind: 0, snapshotTail };
  }
  if (cursor > head) return { status: 'ahead', behind: 0, snapshotTail };
  return { status: cursor === head ? 'synced' : 'behind', behind: head - cursor, snapshotTail };
}

export interface DiagnosticsReportInput {
  appVersion: string;
  buildSha: string;
  serverVersion: string | undefined;
  latestVersion: string | undefined;
  schemaVersion: number | undefined;
  supportedSchemaVersion: number;
  dataFormatVersion: number;
  spaceId: string | undefined;
  runtimeState: string;
  connected: boolean | undefined;
  cursor: number | undefined;
  head: number | undefined;
  snapshotVersion: number | undefined;
  snapshotUpdatedAt: string | undefined;
  pendingCount: number | undefined;
  lastError: string | null;
}

/** Plain-text support report. Versions and counts only, never budget data. */
export function buildDiagnosticsReport(input: DiagnosticsReportInput, now = new Date()): string {
  const position = describeSyncPosition(input.cursor, input.head, input.snapshotVersion);
  const value = (v: unknown) => (v === undefined || v === null || v === '' ? '?' : String(v));
  return [
    `Budgero sync diagnostics (${now.toISOString()})`,
    `App: ${input.appVersion} (${input.buildSha || 'unknown build'})`,
    `Server: ${value(input.serverVersion)} (latest release ${value(input.latestVersion)})`,
    `Schema: ${value(input.schemaVersion)} / supports ${input.supportedSchemaVersion}`,
    `Data format: v${input.dataFormatVersion}`,
    `Space: ${value(input.spaceId)}`,
    `Runtime: ${input.runtimeState}, socket ${input.connected ? 'connected' : 'disconnected'}`,
    `Position: ${value(input.cursor)} / server ${value(input.head)} (${position.status}, ${position.behind} behind)`,
    `Snapshot: ${value(input.snapshotVersion)} (+${value(position.snapshotTail)} after it), updated ${value(input.snapshotUpdatedAt)}`,
    `Unconfirmed local changes: ${value(input.pendingCount)}`,
    `Last sync error: ${input.lastError ?? 'none'}`,
  ].join('\n');
}
