import assert from 'node:assert/strict';
import { test } from 'node:test';
import { clearSessionCookies, parseSessionCookie, sessionCookies } from './session.js';

function asHeader(cookies: { name: string; value: string }[]): string {
  return cookies.map((cookie) => `${cookie.name}=${encodeURIComponent(cookie.value)}`).join('; ');
}

test('large session values are split and restored', () => {
  const sealed = 'Fe26.2**' + 'x'.repeat(4849);
  const cookies = sessionCookies(sealed);

  assert.ok(cookies.length > 1);
  assert.equal(parseSessionCookie(asHeader(cookies)), sealed);
});

test('shorter sessions clear leftover chunks', () => {
  const previous = asHeader(sessionCookies('o'.repeat(8000)));
  const cookies = sessionCookies('n'.repeat(100), previous);

  assert.deepEqual(
    cookies.map((cookie) => [cookie.name, cookie.maxAge]),
    [
      ['__session.0', 86400],
      ['__session.1', 0],
      ['__session.2', 0],
    ],
  );
});

test('clearSessionCookies clears every existing chunk', () => {
  const cookies = clearSessionCookies(asHeader(sessionCookies('x'.repeat(8000))));

  assert.equal(cookies.length, 3);
  assert.ok(cookies.every((cookie) => cookie.maxAge === 0));
});
