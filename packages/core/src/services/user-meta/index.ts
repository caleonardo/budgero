import { DatabaseAdapter } from '../../database/interface.js';
import { UserMetaQueries, type UserMetaRow } from './queries.js';

export class UserMetaService {
  private queries: UserMetaQueries;

  constructor(private db: DatabaseAdapter) {
    this.queries = new UserMetaQueries(db);
  }

  getMeta(): UserMetaRow {
    return this.queries.getMeta();
  }

  setLastUserBackup(timestamp: string): void {
    this.queries.setLastBackup(timestamp);
  }

  setBackupReminderDays(days: number): void {
    this.queries.setReminderDays(days);
  }

  getAllowOverAssignment(): boolean {
    return this.queries.getAllowOverAssignment();
  }

  setAllowOverAssignment(value: boolean): void {
    this.queries.setAllowOverAssignment(value);
  }

  getSuggestCategoryFromPayee(): boolean {
    return this.queries.getSuggestCategoryFromPayee();
  }

  setSuggestCategoryFromPayee(value: boolean): void {
    this.queries.setSuggestCategoryFromPayee(value);
  }

  getShowGroupPercent(): boolean {
    return this.queries.getShowGroupPercent();
  }

  setShowGroupPercent(value: boolean): void {
    this.queries.setShowGroupPercent(value);
  }

  getPlanningNumberAnimations(): boolean {
    return this.queries.getPlanningNumberAnimations();
  }

  setPlanningNumberAnimations(value: boolean): void {
    this.queries.setPlanningNumberAnimations(value);
  }

  getDialogBackgroundBlur(): boolean {
    return this.queries.getDialogBackgroundBlur();
  }

  setDialogBackgroundBlur(value: boolean): void {
    this.queries.setDialogBackgroundBlur(value);
  }

  getRateCacheRetentionDays(): number {
    return this.queries.getRateCacheRetentionDays();
  }

  setRateCacheRetentionDays(days: number): void {
    this.queries.setRateCacheRetentionDays(days);
  }

  getResyncRatesOnReconnect(): boolean {
    return this.queries.getResyncRatesOnReconnect();
  }

  setResyncRatesOnReconnect(value: boolean): void {
    this.queries.setResyncRatesOnReconnect(value);
  }
}
