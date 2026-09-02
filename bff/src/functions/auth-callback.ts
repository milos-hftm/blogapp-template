import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { exchangeCode } from '../lib/keycloak.js';
import {
  PKCE_COOKIE,
  clearPkceCookie,
  parseCookie,
  sealSession,
  sessionCookies,
  sessionFromTokens,
  unsealPkce,
} from '../lib/session.js';

type LoginError = 'access_denied' | 'expired' | 'failed';

function backToLogin(reason: LoginError): HttpResponseInit {
  return {
    status: 302,
    headers: { Location: `/login?error=${reason}` },
    cookies: [clearPkceCookie()],
  };
}

async function authCallback(
  request: HttpRequest,
  context: InvocationContext,
): Promise<HttpResponseInit> {
  const error = request.query.get('error');

  if (error) {
    context.log(`Keycloak rejected the login: ${error}`);
    return backToLogin(error === 'access_denied' ? 'access_denied' : 'failed');
  }

  const cookieHeader = request.headers.get('cookie');
  const sealed = parseCookie(cookieHeader, PKCE_COOKIE);
  const pkce = sealed ? await unsealPkce(sealed) : null;

  if (!pkce) {
    return backToLogin('expired');
  }

  if (request.query.get('state') !== pkce.state) {
    context.error('Callback state does not match the login state.');
    return backToLogin('failed');
  }

  const code = request.query.get('code');

  if (!code) {
    return backToLogin('failed');
  }

  try {
    const tokens = await exchangeCode(code, pkce.verifier);
    const session = await sealSession(sessionFromTokens(tokens));

    return {
      status: 302,
      headers: { Location: pkce.returnUrl },
      cookies: [...sessionCookies(session, cookieHeader), clearPkceCookie()],
    };
  } catch (err) {
    context.error('Token exchange failed.', err);
    return backToLogin('failed');
  }
}

app.http('auth-callback', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'auth/callback',
  handler: authCallback,
});
