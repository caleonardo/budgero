import { YNABRegisterRow, YNABBudgetRow } from './types.js';
import { detectDelimiter, parseCSVRecords } from './parsing.js';

import { createLogger } from '../../logger.js';

const debugLog = createLogger('services:import:csv-parser');

export class CSVParser {
  parseRegisterCSV(data: Uint8Array | string): YNABRegisterRow[] {
    return this.parseYnabCsv(data, (field) => ({
      Account: field('Account'),
      Flag: field('Flag'),
      Date: field('Date'),
      Payee: field('Payee'),
      CategoryPath: field('Category Group/Category'),
      CategoryGroup: field('Category Group'),
      Category: field('Category'),
      Memo: field('Memo'),
      Outflow: field('Outflow'),
      Inflow: field('Inflow'),
      Cleared: field('Cleared'),
    }));
  }

  parseBudgetCSV(data: Uint8Array | string): YNABBudgetRow[] {
    return this.parseYnabCsv(data, (field) => ({
      Month: field('Month'),
      CategoryPath: field('Category Group/Category'),
      CategoryGroup: field('Category Group'),
      Category: field('Category'),
      Assigned: field('Assigned'),
      Activity: field('Activity'),
      Available: field('Available'),
    }));
  }

  /**
   * Shared YNAB CSV scaffolding: decode, strip BOM, detect delimiter, build a
   * header map, then map each data row through `mapRow`'s field getter.
   */
  private parseYnabCsv<T>(
    data: Uint8Array | string,
    mapRow: (field: (fieldName: string) => string) => T
  ): T[] {
    let csvString: string;
    if (data instanceof Uint8Array) {
      const decoder = new TextDecoder('utf-8');
      csvString = decoder.decode(data);
    } else {
      csvString = data;
    }

    // Remove BOM if present
    if (
      csvString.charCodeAt(0) === 0xfeff ||
      (csvString.charCodeAt(0) === 0xef &&
        csvString.charCodeAt(1) === 0xbb &&
        csvString.charCodeAt(2) === 0xbf)
    ) {
      csvString = csvString.substring(csvString.charCodeAt(0) === 0xfeff ? 1 : 3);
      debugLog('DEBUG: Removed BOM from CSV data');
    }

    const delimiter = detectDelimiter(csvString.substring(0, Math.min(2_000, csvString.length)));
    debugLog(`DEBUG: Using ${delimiter === '\t' ? 'tab' : 'comma'} delimiter`);

    const records = parseCSVRecords(csvString, delimiter);
    if (records.length === 0) {
      throw new Error('Empty CSV file');
    }

    const headers = records[0];
    const headerMap = new Map<string, number>();
    debugLog('DEBUG: CSV headers:', headers.join(', '));

    headers.forEach((header, index) => {
      const cleanHeader = header.trim().replace(/^"|"$/g, '');
      headerMap.set(cleanHeader, index);
    });

    const rows: T[] = [];
    for (let i = 1; i < records.length; i++) {
      const fields = records[i];
      if (fields.length === 0) continue;

      rows.push(mapRow((fieldName) => this.getCSVField(fields, headerMap, fieldName)));
    }

    return rows;
  }

  private getCSVField(record: string[], headers: Map<string, number>, fieldName: string): string {
    const idx = headers.get(fieldName);
    if (idx !== undefined && idx < record.length) {
      return record[idx].trim();
    }
    return '';
  }
}
