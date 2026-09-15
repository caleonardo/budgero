/**
 * Envelope encryption for database blobs.
 *
 * Uses a fast envelope format (BGE1) that caches the DEK to avoid
 * expensive PBKDF2 key derivation on every operation.
 *
 * Format:
 * [4 bytes magic 'BGE1'][1 byte version]
 * [4 bytes pbkdf2Iterations]
 * [2 bytes saltLen][salt]
 * [1 byte kekIvLen][kekIv]
 * [2 bytes encDekLen][encDek]
 * [1 byte dataIvLen][dataIv]
 * [ciphertext]
 */

import { getGlobalCrypto, getSubtleCrypto } from './subtle';

const ENVELOPE_MAGIC = new Uint8Array([0x42, 0x47, 0x45, 0x31]); // 'BGE1'
const ENVELOPE_VERSION = 2;
const ENVELOPE_KEK_ITERATIONS = 600_000;

// Publish and capture the key and its wrapping header as one matching entry.
interface EnvelopeCacheEntry {
  dekKey: CryptoKey;
  header: {
    salt: Uint8Array;
    kekIv: Uint8Array;
    encDek: Uint8Array;
    iterations: number;
  };
  passwordFingerprint: string;
}

let cachedEnvelope: EnvelopeCacheEntry | null = null;
// A reset must also prevent older in-flight work from repopulating the cache.
let cacheGeneration = 0;

async function importAesGcmKey(raw: Uint8Array): Promise<CryptoKey> {
  const subtle = getSubtleCrypto();
  return subtle.importKey('raw', raw, { name: 'AES-GCM' }, false, ['encrypt', 'decrypt']);
}

async function deriveKekFromPassword(
  password: string,
  salt: Uint8Array,
  iterations: number
): Promise<CryptoKey> {
  const subtle = getSubtleCrypto();
  const enc = new TextEncoder();
  const baseKey = await subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, [
    'deriveKey',
  ]);
  return subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations,
      hash: 'SHA-256',
    },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

async function fingerprintPassword(password: string): Promise<string> {
  const subtle = getSubtleCrypto();
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

function concatBytes(parts: Uint8Array[]): Uint8Array {
  const total = parts.reduce((s, p) => s + p.length, 0);
  const out = new Uint8Array(total);
  let o = 0;
  for (const p of parts) {
    out.set(p, o);
    o += p.length;
  }
  return out;
}

function u16(n: number): Uint8Array {
  return new Uint8Array([(n >> 8) & 0xff, n & 0xff]);
}

function u32(n: number): Uint8Array {
  return new Uint8Array([(n >>> 24) & 0xff, (n >>> 16) & 0xff, (n >>> 8) & 0xff, n & 0xff]);
}

function readU16(view: Uint8Array, offset: number): number {
  return (view[offset] << 8) | view[offset + 1];
}

function readU32(view: Uint8Array, offset: number): number {
  return (
    (((view[offset] << 24) >>> 0) |
      (view[offset + 1] << 16) |
      (view[offset + 2] << 8) |
      view[offset + 3]) >>>
    0
  );
}

async function ensureEnvelopeHeader(
  masterPassword: string,
  iterations: number
): Promise<EnvelopeCacheEntry> {
  const generation = cacheGeneration;
  const cryptoObj = getGlobalCrypto();
  const subtle = getSubtleCrypto();
  const fp = await fingerprintPassword(masterPassword);
  const cached = cachedEnvelope;
  if (cached && cached.passwordFingerprint === fp && cached.header.iterations === iterations) {
    return cached;
  }
  // Keep initialization local: another encryption or decryption may finish
  // while PBKDF2 or key wrapping is pending.
  const dekRaw = cryptoObj.getRandomValues(new Uint8Array(32));
  const dekKey = await importAesGcmKey(dekRaw);
  const salt = cryptoObj.getRandomValues(new Uint8Array(16));
  const kek = await deriveKekFromPassword(masterPassword, salt, iterations);
  const kekIv = cryptoObj.getRandomValues(new Uint8Array(12));
  const encDekBuf = await subtle.encrypt({ name: 'AES-GCM', iv: kekIv }, kek, dekRaw);
  const entry: EnvelopeCacheEntry = {
    dekKey,
    header: { salt, kekIv, encDek: new Uint8Array(encDekBuf), iterations },
    passwordFingerprint: fp,
  };
  if (generation === cacheGeneration) cachedEnvelope = entry;
  return entry;
}

/**
 * Encrypt data using the envelope format.
 */
export async function encryptEnvelope(
  data: Uint8Array,
  masterPassword: string
): Promise<Uint8Array> {
  const { dekKey, header: envelopeHeader } = await ensureEnvelopeHeader(
    masterPassword,
    ENVELOPE_KEK_ITERATIONS
  );

  const cryptoObj = getGlobalCrypto();
  const subtle = getSubtleCrypto();
  const dataIv = cryptoObj.getRandomValues(new Uint8Array(12));
  const ctBuf = await subtle.encrypt({ name: 'AES-GCM', iv: dataIv }, dekKey, data);
  const ct = new Uint8Array(ctBuf);

  const header = concatBytes([
    ENVELOPE_MAGIC,
    new Uint8Array([ENVELOPE_VERSION]),
    u32(envelopeHeader.iterations),
    u16(envelopeHeader.salt.length),
    envelopeHeader.salt,
    new Uint8Array([envelopeHeader.kekIv.length]),
    envelopeHeader.kekIv,
    u16(envelopeHeader.encDek.length),
    envelopeHeader.encDek,
    new Uint8Array([dataIv.length]),
    dataIv,
  ]);
  return concatBytes([header, ct]);
}

export interface DecryptEnvelopeResult {
  decrypted: Uint8Array;
  salt: Uint8Array;
  iterations: number;
}

/**
 * Decrypt data using the envelope format.
 * Throws if the data is not in envelope format or decryption fails.
 */
export async function decryptEnvelope(
  encryptedData: Uint8Array,
  masterPassword: string
): Promise<DecryptEnvelopeResult> {
  const generation = cacheGeneration;
  // Check magic
  if (encryptedData.length < 4) {
    throw new Error('Invalid envelope: data too short');
  }
  if (!ENVELOPE_MAGIC.every((b, i) => encryptedData[i] === b)) {
    throw new Error('Invalid envelope: missing magic header');
  }

  let offset = 4;
  const version = encryptedData[offset++];

  if (version !== ENVELOPE_VERSION) {
    throw new Error(`Unsupported envelope version: ${version}`);
  }

  if (encryptedData.length < offset + 4) {
    throw new Error('Invalid envelope: missing iterations');
  }
  const iterations = readU32(encryptedData, offset);
  offset += 4;

  const saltLen = readU16(encryptedData, offset);
  offset += 2;
  const salt = encryptedData.slice(offset, offset + saltLen);
  offset += saltLen;

  const kekIvLen = encryptedData[offset++];
  const kekIv = encryptedData.slice(offset, offset + kekIvLen);
  offset += kekIvLen;

  const encDekLen = readU16(encryptedData, offset);
  offset += 2;
  const encDek = encryptedData.slice(offset, offset + encDekLen);
  offset += encDekLen;

  const dataIvLen = encryptedData[offset++];
  const dataIv = encryptedData.slice(offset, offset + dataIvLen);
  offset += dataIvLen;

  const ct = encryptedData.slice(offset);

  // Derive KEK and unwrap DEK
  const kek = await deriveKekFromPassword(masterPassword, salt, iterations);
  const subtle = getSubtleCrypto();
  const dekRawBuf = await subtle.decrypt({ name: 'AES-GCM', iv: kekIv }, kek, encDek);
  const dekRaw = new Uint8Array(dekRawBuf);

  const dekKey = await importAesGcmKey(dekRaw);
  const passwordFingerprint = await fingerprintPassword(masterPassword);
  const ptBuf = await subtle.decrypt({ name: 'AES-GCM', iv: dataIv }, dekKey, ct);
  // Only authenticated payloads may seed the cache. Always decrypt using the
  // local key, even if a concurrent operation replaces or clears the cache.
  if (generation === cacheGeneration) {
    cachedEnvelope = {
      dekKey,
      header: { salt, kekIv, encDek, iterations },
      passwordFingerprint,
    };
  }
  return { decrypted: new Uint8Array(ptBuf), salt: salt.slice(), iterations };
}

/**
 * Clear the cached DEK (useful for testing or password changes).
 */
export function clearEnvelopeCache(): void {
  cacheGeneration += 1;
  cachedEnvelope = null;
}

/**
 * Get the salt from the cached envelope header (if available).
 * Used to ensure consistent salt across encryption operations.
 */
export function getCachedSalt(): Uint8Array | null {
  return cachedEnvelope?.header.salt.slice() ?? null;
}
