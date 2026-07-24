import type { MigrationDatabase } from './migrations.js';

/**
 * One workspace = one database file, so every row belongs to the workspace the
 * file was opened for. Stamps the authoritative (server-issued) space id onto
 * rows still carrying legacy client-minted ids (migration 013 randomblob) —
 * those never matched the runtime's space id and made budgets invisible once
 * a correctly-stamped budget existed alongside them.
 */
export function reconcileSpaceScope(db: MigrationDatabase, spaceId: string): void {
  const sid = spaceId.replace(/'/g, "''");
  db.exec(`UPDATE budgets SET SpaceID = '${sid}' WHERE SpaceID IS NULL OR SpaceID <> '${sid}'`);
  db.exec(
    `UPDATE mutation_history SET SpaceID = '${sid}' WHERE SpaceID IS NULL OR SpaceID <> '${sid}'`
  );
}
