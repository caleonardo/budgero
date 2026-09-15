import { afterEach, describe, expect, it, vi } from 'vitest';
import { clearEnvelopeCache, decryptEnvelope, encryptEnvelope, getCachedSalt } from './envelope';

describe('envelope crypto', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    clearEnvelopeCache();
  });

  it('encrypts and decrypts payload', async () => {
    clearEnvelopeCache();
    const data = new TextEncoder().encode('secret payload');

    const encrypted = await encryptEnvelope(data, 'master-pass');
    const out = await decryptEnvelope(encrypted, 'master-pass');

    expect(Array.from(out.decrypted)).toEqual(Array.from(data));
    expect(out.iterations).toBeGreaterThan(1000);
    expect(getCachedSalt()).not.toBeNull();
  });

  it('fails on invalid envelope structure', async () => {
    await expect(decryptEnvelope(new Uint8Array([1, 2]), 'master-pass')).rejects.toThrow(
      'Invalid envelope'
    );
  });

  it('fails on missing magic and missing iterations envelope errors', async () => {
    await expect(
      decryptEnvelope(new Uint8Array([0, 0, 0, 0, 2, 1, 2, 3, 4]), 'master-pass')
    ).rejects.toThrow('missing magic');

    const magicNoIterations = new Uint8Array([0x42, 0x47, 0x45, 0x31, 2, 0, 0, 0]);
    await expect(decryptEnvelope(magicNoIterations, 'master-pass')).rejects.toThrow(
      'missing iterations'
    );
  });

  it('fails on unsupported version', async () => {
    const data = new TextEncoder().encode('abc');
    const encrypted = await encryptEnvelope(data, 'master-pass');
    encrypted[4] = 99;

    await expect(decryptEnvelope(encrypted, 'master-pass')).rejects.toThrow('Unsupported envelope');
  });

  it('clears cached salt', async () => {
    const data = new Uint8Array([9]);
    await encryptEnvelope(data, 'master-pass');
    expect(getCachedSalt()).not.toBeNull();

    clearEnvelopeCache();
    expect(getCachedSalt()).toBeNull();
  });

  it('throws clear error when global crypto is missing or subtle is invalid', async () => {
    vi.stubGlobal('crypto', undefined as unknown as Crypto);
    await expect(encryptEnvelope(new Uint8Array([1]), 'master-pass')).rejects.toThrow(
      'WebCryptoUnavailable'
    );

    vi.stubGlobal('crypto', {
      getRandomValues: (arr: Uint8Array) => arr,
      subtle: undefined,
    } as unknown as Crypto);
    await expect(encryptEnvelope(new Uint8Array([1]), 'master-pass')).rejects.toThrow(
      'WebCryptoUnavailable'
    );

    vi.stubGlobal('crypto', {
      getRandomValues: (arr: Uint8Array) => arr,
      subtle: { importKey: undefined } as unknown as SubtleCrypto,
    } as unknown as Crypto);
    await expect(encryptEnvelope(new Uint8Array([1]), 'master-pass')).rejects.toThrow(
      'WebCryptoUnavailable'
    );
  });

  it.each([
    ['same-password', 'same-password'],
    ['local-master-password', 'space-sync-passphrase'],
  ])('round-trips concurrent cold-cache encryptions (%s, %s)', async (first, second) => {
    clearEnvelopeCache();
    const inputs = [new Uint8Array([1, 2, 3]), new Uint8Array([4, 5, 6])];
    const passwords = [first, second];
    const encrypted = await Promise.all(
      inputs.map((data, index) => encryptEnvelope(data, passwords[index]))
    );
    for (let index = 0; index < inputs.length; index++) {
      clearEnvelopeCache();
      expect((await decryptEnvelope(encrypted[index], passwords[index])).decrypted).toEqual(
        inputs[index]
      );
    }
  });

  it('decrypts independent envelopes concurrently without mixing keys', async () => {
    const inputs = [new Uint8Array([11, 12]), new Uint8Array([21, 22])];
    const passwords = ['first-password', 'second-password'];
    const encrypted: Uint8Array[] = [];
    for (let index = 0; index < inputs.length; index++) {
      clearEnvelopeCache();
      encrypted.push(await encryptEnvelope(inputs[index], passwords[index]));
    }
    clearEnvelopeCache();
    const outputs = await Promise.all(
      encrypted.map((data, index) => decryptEnvelope(data, passwords[index]))
    );
    expect(outputs.map((out) => out.decrypted)).toEqual(inputs);
  });

  it('keeps encryptions valid while decrypting another password envelope', async () => {
    const original = new Uint8Array([31, 32]);
    const encrypted = await encryptEnvelope(original, 'old-password');
    clearEnvelopeCache();
    const input = new Uint8Array([41, 42]);
    const [opened, sealed] = await Promise.all([
      decryptEnvelope(encrypted, 'old-password'),
      encryptEnvelope(input, 'new-password'),
    ]);
    expect(opened.decrypted).toEqual(original);
    clearEnvelopeCache();
    expect((await decryptEnvelope(sealed, 'new-password')).decrypted).toEqual(input);
  });

  it('does not cache unauthenticated data or expose mutable cached salt', async () => {
    const input = new Uint8Array([51, 52]);
    const encrypted = await encryptEnvelope(input, 'password');
    const cachedSalt = getCachedSalt()!;
    cachedSalt.fill(0);
    expect(getCachedSalt()).not.toEqual(cachedSalt);
    const opened = await decryptEnvelope(encrypted, 'password');
    opened.salt.fill(0);
    const another = await encryptEnvelope(input, 'password');
    clearEnvelopeCache();
    expect((await decryptEnvelope(another, 'password')).decrypted).toEqual(input);

    clearEnvelopeCache();
    encrypted[encrypted.length - 1] ^= 1;
    await expect(decryptEnvelope(encrypted, 'password')).rejects.toThrow();
    expect(getCachedSalt()).toBeNull();
    await expect(decryptEnvelope(another, 'wrong-password')).rejects.toThrow();
    expect(getCachedSalt()).toBeNull();
  });

  it('keeps an in-flight encryption valid without repopulating a cleared cache', async () => {
    const realCrypto = globalThis.crypto;
    const realSubtle = realCrypto.subtle;
    let firstEncrypt = true;

    vi.stubGlobal('crypto', {
      getRandomValues: (arr: Uint8Array) => realCrypto.getRandomValues(arr),
      subtle: {
        importKey: (...args: Parameters<SubtleCrypto['importKey']>) =>
          realSubtle.importKey(...args),
        deriveKey: (...args: Parameters<SubtleCrypto['deriveKey']>) =>
          realSubtle.deriveKey(...args),
        digest: (...args: Parameters<SubtleCrypto['digest']>) => realSubtle.digest(...args),
        encrypt: async (...args: Parameters<SubtleCrypto['encrypt']>) => {
          const out = await realSubtle.encrypt(...args);
          if (firstEncrypt) {
            firstEncrypt = false;
            queueMicrotask(() => clearEnvelopeCache());
          }
          return out;
        },
        decrypt: (...args: Parameters<SubtleCrypto['decrypt']>) => realSubtle.decrypt(...args),
      } as unknown as SubtleCrypto,
    } as unknown as Crypto);

    const data = new Uint8Array([1, 2, 3]);
    const encrypted = await encryptEnvelope(data, 'master-pass');
    expect(getCachedSalt()).toBeNull();
    expect((await decryptEnvelope(encrypted, 'master-pass')).decrypted).toEqual(data);
  });
});
