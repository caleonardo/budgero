import assert from 'node:assert/strict';
import { afterEach, beforeEach, mock, test } from 'node:test';
import { track, flushUmamiEvents } from './analytics.ts';
import { posthog } from './posthog.ts';

const originalWindow = Object.getOwnPropertyDescriptor(globalThis, 'window');
const originalCapture = Object.getOwnPropertyDescriptor(posthog, 'capture');
let browser: { location: { hostname: string }; umami?: { track: ReturnType<typeof mock.fn> } };

beforeEach(() => {
  browser = { location: { hostname: 'budgero.app' }, umami: { track: mock.fn() } };
  Object.defineProperty(globalThis, 'window', { configurable: true, value: browser });
  flushUmamiEvents();
  browser.umami!.track.mock.resetCalls();
  Object.defineProperty(posthog, 'capture', {
    configurable: true,
    writable: true,
    value: mock.fn(),
  });
});

afterEach(() => {
  mock.restoreAll();
  if (originalCapture) Object.defineProperty(posthog, 'capture', originalCapture);
  else Reflect.deleteProperty(posthog, 'capture');
  if (originalWindow) Object.defineProperty(globalThis, 'window', originalWindow);
  else Reflect.deleteProperty(globalThis, 'window');
});

test('a homepage view before tracker readiness is delivered exactly once after readiness', () => {
  const send = mock.fn();
  delete browser.umami;
  track('Homepage Viewed', { variant: 'trial-focused-v1' });
  flushUmamiEvents();
  browser.umami = { track: send };
  flushUmamiEvents();
  flushUmamiEvents();
  assert.deepEqual(
    send.mock.calls.map((call) => call.arguments),
    [['Homepage Viewed', { variant: 'trial-focused-v1' }]]
  );
});

test('blocked trackers cannot accumulate an unbounded queue', () => {
  delete browser.umami;
  for (let i = 0; i < 30; i++) track('CTA Clicked - Cloud', { placement: 'hero' });
  const send = mock.fn();
  browser.umami = { track: send };
  flushUmamiEvents();
  assert.equal(send.mock.callCount(), 20);
});

test('local and preview visits neither send nor queue production events', () => {
  const send = browser.umami!.track;
  for (const hostname of ['localhost', '127.0.0.1', 'preview.budgero.app']) {
    browser.location.hostname = hostname;
    track('Homepage Viewed');
  }
  assert.equal(send.mock.callCount(), 0);
  browser.location.hostname = 'budgero.app';
  flushUmamiEvents();
  assert.equal(send.mock.callCount(), 0);
});

test('provider errors do not interrupt a click or the other provider', () => {
  mock.method(posthog, 'capture', () => {
    throw new Error('blocked');
  });
  const send = browser.umami!.track;
  assert.doesNotThrow(() => track('CTA Clicked - Cloud'));
  assert.equal(send.mock.callCount(), 1);
  browser.umami = {
    track: mock.fn(() => {
      throw new Error('blocked');
    }),
  };
  assert.doesNotThrow(() => track('CTA Clicked - Cloud'));
});
