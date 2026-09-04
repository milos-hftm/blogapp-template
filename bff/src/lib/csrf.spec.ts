import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { HttpRequest } from '@azure/functions';

process.env['ALLOWED_ORIGIN'] ??= 'https://blog.test';

const { checkCsrf } = await import('./csrf.js');

function request(headers: Record<string, string>): HttpRequest {
  return { headers: new Headers(headers) } as unknown as HttpRequest;
}

const xhrHeader = { 'X-Requested-With': 'XMLHttpRequest' };

test('request from the app passes', () => {
  assert.equal(checkCsrf(request({ ...xhrHeader, Origin: 'https://blog.test' })), null);
});

test('request without X-Requested-With fails', () => {
  const result = checkCsrf(request({ Origin: 'https://blog.test' }));

  assert.equal(result?.status, 403);
});

test('request from another origin fails', () => {
  const result = checkCsrf(request({ ...xhrHeader, Origin: 'https://evil.blog.test' }));

  assert.equal(result?.status, 403);
});

test('request without origin is allowed', () => {
  assert.equal(checkCsrf(request(xhrHeader)), null);
});
