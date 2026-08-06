import type { Migration, MigrationDatabase } from '../migrations.js';
import { createLogger } from '../../logger.js';

const debugLog = createLogger('database:migrations');

/**
 * Daily rate keying: currency_rates.Month (YYYY-MM) becomes RateDate
 * (YYYY-MM-DD); existing monthly rows are preserved as first-of-month dates.
 * Adds the rate-cache retention setting (days of daily rates kept in the
 * synced DB blob) and the reconnect-resync opt-in to user_meta.
 */
export const migration046: Migration = {
  version: 46,
  description: 'Daily currency rates keying and rate cache settings',
  up: (db: MigrationDatabase) => {
    const safeExec = (sql: string) => {
      try {
        db.exec(sql);
      } catch (error) {
        debugLog('[Migration 46] statement failed (may already exist)', { sql, error });
      }
    };

    db.exec(`ALTER TABLE currency_rates RENAME COLUMN Month TO RateDate`);
    db.exec(`UPDATE currency_rates SET RateDate = RateDate || '-01' WHERE length(RateDate) = 7`);

    safeExec(`ALTER TABLE user_meta ADD COLUMN RateCacheRetentionDays INTEGER NOT NULL DEFAULT 30`);
    safeExec(`ALTER TABLE user_meta ADD COLUMN ResyncRatesOnReconnect BOOLEAN NOT NULL DEFAULT 1`);
  },
  verify: (db: MigrationDatabase) => {
    try {
      const rateCols = db.exec(`PRAGMA table_info(currency_rates)`);
      const rateNames = rateCols?.[0]?.values?.map((row: unknown[]) => row[1]) ?? [];
      if (!rateNames.includes('RateDate') || rateNames.includes('Month')) return false;

      const metaCols = db.exec(`PRAGMA table_info(user_meta)`);
      const metaNames = metaCols?.[0]?.values?.map((row: unknown[]) => row[1]) ?? [];
      return (
        metaNames.includes('RateCacheRetentionDays') && metaNames.includes('ResyncRatesOnReconnect')
      );
    } catch (error) {
      debugLog('[Migration 46] verification failed', { error });
      return false;
    }
  },
};
