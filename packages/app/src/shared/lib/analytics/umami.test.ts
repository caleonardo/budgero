import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { sendSignupViewedToUmami, sendTrialStartedToUmami } from './umami';

vi.mock('@shared/lib/env', () => ({ IS_SELF_HOSTABLE_BUILD: false }));

const fetchMock = vi.fn().mockResolvedValue({ ok: true });

beforeEach(() => {
  vi.stubEnv('VITE_SELF_HOSTABLE', 'false');
  vi.stubGlobal('window', {
    location: { hostname: 'my.budgero.app' },
    screen: { width: 1440, height: 900 },
  });
  vi.stubGlobal('fetch', fetchMock);
  fetchMock.mockClear();
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

function sentPayload() {
  return JSON.parse(fetchMock.mock.calls[0][1].body).payload;
}

describe('anonymous signup funnel', () => {
  it('retains the public homepage placement while excluding credentials and arbitrary campaign text', () => {
    sendSignupViewedToUmami(
      '?mode=signup&utm_source=website&utm_medium=cta&utm_campaign=home&utm_content=hero&landing_variant=trial-focused-v1&code=private-oauth-code&next=/join/secret&email=private@example.com&utm_term=private'
    );
    expect(sentPayload().url).toBe(
      '/auth?mode=signup&utm_source=website&utm_medium=cta&utm_campaign=home&utm_content=hero&landing_variant=trial-focused-v1'
    );
    expect(sentPayload()).not.toHaveProperty('data');
    expect(sentPayload()).not.toHaveProperty('id');
    expect(sentPayload()).not.toHaveProperty('referrer');
  });

  it('rejects unrecognized campaign values instead of forwarding user-controlled strings', () => {
    sendSignupViewedToUmami(
      '?utm_source=website&utm_medium=cta&utm_campaign=home&utm_content=private@example.com&landing_variant=private'
    );
    expect(sentPayload().url).toBe('/auth?mode=signup');
  });

  it.each([
    'localhost',
    '127.0.0.1',
    'preview.budgero.app',
    'notbudgero.app',
    'my.budgero.app.example.com',
  ])('does not send development or other-host events from %s', (hostname) => {
    vi.stubGlobal('window', { location: { hostname } });
    sendTrialStartedToUmami();
    sendSignupViewedToUmami('');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('does not send self-host events', () => {
    vi.stubEnv('VITE_SELF_HOSTABLE', 'true');
    sendTrialStartedToUmami();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('keeps the existing trial name, proxy, and virtual path without reading the current URL', () => {
    sendTrialStartedToUmami();
    expect(fetchMock.mock.calls[0][0]).toBe('https://budgero.app/stats/api/send');
    expect(sentPayload()).toMatchObject({
      name: 'Trial Started',
      url: '/trial-started',
      hostname: 'my.budgero.app',
      website: '76a1a09b-2dbc-4291-9c0b-d3f4e9eb2caa',
    });
  });

  it('does not throw if fetch fails synchronously or rejects', async () => {
    fetchMock.mockImplementationOnce(() => {
      throw new Error('unavailable');
    });
    expect(() => sendTrialStartedToUmami()).not.toThrow();
    fetchMock.mockRejectedValueOnce(new Error('offline'));
    expect(() => sendTrialStartedToUmami()).not.toThrow();
    await Promise.resolve();
  });
});
