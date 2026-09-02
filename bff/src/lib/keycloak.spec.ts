import assert from 'node:assert/strict';
import { test } from 'node:test';

process.env['KEYCLOAK_URL'] ??= 'https://keycloak.test/realms/test';
process.env['KEYCLOAK_CLIENT_ID'] ??= 'student-bff';
process.env['KEYCLOAK_CLIENT_SECRET'] ??= 'test-secret';
process.env['ALLOWED_ORIGIN'] ??= 'http://localhost:4200/';

const { createPkcePair, safeReturnUrl, REDIRECT_URI, buildAuthorizeUrl } =
  await import('./keycloak.js');

test('safeReturnUrl accepts only local paths', () => {
  for (const url of ['https://example.com', '//example.com', '/\\example.com', '', null]) {
    assert.equal(safeReturnUrl(url), '/');
  }

  assert.equal(safeReturnUrl('/add-blog'), '/add-blog');
});

test('createPkcePair builds an S256 challenge', async () => {
  const { createHash } = await import('node:crypto');
  const { verifier, challenge } = createPkcePair();

  assert.match(verifier, /^[A-Za-z0-9_-]{43}$/);
  assert.equal(challenge, createHash('sha256').update(verifier).digest('base64url'));
  assert.notEqual(createPkcePair().verifier, verifier);
});

test('redirect uri is built without a double slash', () => {
  assert.equal(REDIRECT_URI, 'http://localhost:4200/api/auth/callback');
});

test('authorize URL uses PKCE with S256', () => {
  const params = new URL(buildAuthorizeUrl('state-value', 'challenge-value')).searchParams;

  assert.equal(params.get('code_challenge_method'), 'S256');
  assert.equal(params.get('code_challenge'), 'challenge-value');
});
