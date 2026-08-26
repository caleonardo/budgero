import { DatabaseAdapter } from '../../database/interface.js';
import { getRow, run } from '../../database/sql.js';

export type UserMetaRow = {
  ID: number;
  LastUserBackup: string | null;
  BackupReminderDays: number;
  AllowOverAssignment: boolean;
};

export class UserMetaQueries {
  constructor(private db: DatabaseAdapter) {}

  ensureRow(): void {
    run(
      this.db,
      `
      INSERT OR IGNORE INTO user_meta (ID, LastUserBackup, BackupReminderDays, AllowOverAssignment)
      VALUES (1, NULL, 7, 0)
    `
    );
  }

  getMeta(): UserMetaRow {
    this.ensureRow();
    const row = getRow<UserMetaRow>(
      this.db,
      `SELECT ID, LastUserBackup, BackupReminderDays, AllowOverAssignment FROM user_meta WHERE ID = 1`
    );
    return (
      row ?? {
        ID: 1,
        LastUserBackup: null,
        BackupReminderDays: 7,
        AllowOverAssignment: false,
      }
    );
  }

  getAllowOverAssignment(): boolean {
    this.ensureRow();
    const row = getRow<{ AllowOverAssignment: boolean | number }>(
      this.db,
      `SELECT AllowOverAssignment FROM user_meta WHERE ID = 1`
    );
    if (!row) return false;
    // SQLite returns booleans as 0/1 integers
    return row.AllowOverAssignment === true || row.AllowOverAssignment === 1;
  }

  setAllowOverAssignment(value: boolean): void {
    this.ensureRow();
    run(this.db, `UPDATE user_meta SET AllowOverAssignment = ? WHERE ID = 1`, value ? 1 : 0);
  }

  /**
   * Whether the add-transaction form pre-fills the category from the payee's
   * last transaction. Defaults to true — including for rows written before the
   * column existed, where SQLite backfills the column default.
   */
  getSuggestCategoryFromPayee(): boolean {
    this.ensureRow();
    const row = getRow<{ SuggestCategoryFromPayee: boolean | number | null }>(
      this.db,
      `SELECT SuggestCategoryFromPayee FROM user_meta WHERE ID = 1`
    );
    if (!row || row.SuggestCategoryFromPayee == null) return true;
    return row.SuggestCategoryFromPayee === true || row.SuggestCategoryFromPayee === 1;
  }

  setSuggestCategoryFromPayee(value: boolean): void {
    this.ensureRow();
    run(this.db, `UPDATE user_meta SET SuggestCategoryFromPayee = ? WHERE ID = 1`, value ? 1 : 0);
  }

  /** Show each category group's share of the month's total assigned. Off by default. */
  getShowGroupPercent(): boolean {
    this.ensureRow();
    const row = getRow<{ ShowGroupPercent: boolean | number | null }>(
      this.db,
      `SELECT ShowGroupPercent FROM user_meta WHERE ID = 1`
    );
    if (!row || row.ShowGroupPercent == null) return false;
    return row.ShowGroupPercent === true || row.ShowGroupPercent === 1;
  }

  setShowGroupPercent(value: boolean): void {
    this.ensureRow();
    run(this.db, `UPDATE user_meta SET ShowGroupPercent = ? WHERE ID = 1`, value ? 1 : 0);
  }

  /** Animate amount changes on the Planning page. Off by default. */
  getPlanningNumberAnimations(): boolean {
    this.ensureRow();
    const row = getRow<{ PlanningNumberAnimations: boolean | number | null }>(
      this.db,
      `SELECT PlanningNumberAnimations FROM user_meta WHERE ID = 1`
    );
    if (!row || row.PlanningNumberAnimations == null) return false;
    return row.PlanningNumberAnimations === true || row.PlanningNumberAnimations === 1;
  }

  setPlanningNumberAnimations(value: boolean): void {
    this.ensureRow();
    run(this.db, `UPDATE user_meta SET PlanningNumberAnimations = ? WHERE ID = 1`, value ? 1 : 0);
  }

  setLastBackup(timestamp: string): void {
    this.ensureRow();
    run(
      this.db,
      `UPDATE user_meta SET LastUserBackup = ?, BackupReminderDays = COALESCE(BackupReminderDays, 7) WHERE ID = 1`,
      timestamp
    );
  }

  setReminderDays(days: number): void {
    this.ensureRow();
    const normalized = Math.max(0, Math.floor(days));
    run(this.db, `UPDATE user_meta SET BackupReminderDays = ? WHERE ID = 1`, normalized);
  }

  /** Days of daily currency rates kept in the local cache (synced blob size). */
  getRateCacheRetentionDays(): number {
    this.ensureRow();
    const row = getRow<{ RateCacheRetentionDays: number | null }>(
      this.db,
      `SELECT RateCacheRetentionDays FROM user_meta WHERE ID = 1`
    );
    const days = row?.RateCacheRetentionDays;
    return typeof days === 'number' && days > 0 ? days : 30;
  }

  setRateCacheRetentionDays(days: number): void {
    this.ensureRow();
    const normalized = Math.max(1, Math.floor(days));
    run(this.db, `UPDATE user_meta SET RateCacheRetentionDays = ? WHERE ID = 1`, normalized);
  }

  /** Whether offline-entered rates re-resolve to official ones on reconnect. */
  getResyncRatesOnReconnect(): boolean {
    this.ensureRow();
    const row = getRow<{ ResyncRatesOnReconnect: boolean | number | null }>(
      this.db,
      `SELECT ResyncRatesOnReconnect FROM user_meta WHERE ID = 1`
    );
    if (!row || row.ResyncRatesOnReconnect == null) return true;
    return row.ResyncRatesOnReconnect === true || row.ResyncRatesOnReconnect === 1;
  }

  setResyncRatesOnReconnect(value: boolean): void {
    this.ensureRow();
    run(this.db, `UPDATE user_meta SET ResyncRatesOnReconnect = ? WHERE ID = 1`, value ? 1 : 0);
  }
}
