import { normalizeMutationPayload } from '@budgero/runtime';
import type { MutationLogEntry } from '@shared/api/api-client';

export interface DecodedLogEntry {
  id: string;
  version: number;
  userId: string;
  timestamp: string;
  op: string | null;
  args: Record<string, unknown> | null;
  error: string | null;
}

interface MutationDecryptor {
  decryptMutation(encryptedPayload: string): Promise<{ op: string; args: Record<string, unknown> }>;
}

/** Decrypts one log entry on this device; failures are reported per entry, never thrown. */
export async function decodeLogEntry(
  entry: MutationLogEntry,
  encryption: MutationDecryptor | null
): Promise<DecodedLogEntry> {
  const base = {
    id: entry.id,
    version: entry.version,
    userId: entry.user_id,
    timestamp: entry.timestamp,
  };
  if (!entry.encrypted_payload) {
    return { ...base, op: entry.op ?? null, args: null, error: null };
  }
  if (!encryption) return { ...base, op: null, args: null, error: 'No space key loaded' };
  try {
    const decrypted = await encryption.decryptMutation(entry.encrypted_payload);
    const { op, args } = normalizeMutationPayload(decrypted);
    return { ...base, op, args, error: null };
  } catch (error) {
    return {
      ...base,
      op: null,
      args: null,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
