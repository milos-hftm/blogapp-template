import { app, Cookie, HttpRequest, HttpResponseInit } from '@azure/functions';
import { decodeJwt } from 'jose';
import { corsHeaders, handlePreflight } from '../lib/cors.js';
import { refreshTokens } from '../lib/keycloak.js';
import {
  clearSessionCookies,
  isSessionExpired,
  parseSessionCookie,
  sealSession,
  sessionCookies,
  sessionFromTokens,
  unsealSession,
} from '../lib/session.js';

function userFromToken(accessToken: string) {
  const claims = decodeJwt(accessToken) as Record<string, unknown>;
  const realmAccess = claims['realm_access'] as { roles: string[] } | undefined;

  return {
    preferred_username: claims['preferred_username'],
    email: claims['email'],
    name: claims['name'],
    roles: realmAccess?.roles ?? [],
  };
}

async function authMe(request: HttpRequest): Promise<HttpResponseInit> {
  const preflight = handlePreflight(request);

  if (preflight) {
    return preflight;
  }

  const cookieHeader = request.headers.get('cookie');
  const sealed = parseSessionCookie(cookieHeader);

  if (!sealed) {
    return {
      status: 200,
      jsonBody: { isAuthenticated: false, user: null },
      headers: corsHeaders,
    };
  }

  let session = await unsealSession(sealed);

  if (!session) {
    return {
      status: 200,
      jsonBody: { isAuthenticated: false, user: null },
      headers: corsHeaders,
      cookies: clearSessionCookies(cookieHeader),
    };
  }

  const extraCookies: Cookie[] = [];

  if (isSessionExpired(session)) {
    try {
      const tokens = await refreshTokens(session.refreshToken);
      session = sessionFromTokens(tokens);
      extraCookies.push(...sessionCookies(await sealSession(session), cookieHeader));
    } catch {
      return {
        status: 200,
        jsonBody: { isAuthenticated: false, user: null },
        headers: corsHeaders,
        cookies: clearSessionCookies(cookieHeader),
      };
    }
  }

  return {
    status: 200,
    jsonBody: { isAuthenticated: true, user: userFromToken(session.accessToken) },
    headers: corsHeaders,
    cookies: extraCookies.length > 0 ? extraCookies : undefined,
  };
}

app.http('auth-me', {
  methods: ['GET', 'OPTIONS'],
  authLevel: 'anonymous',
  route: 'auth/me',
  handler: authMe,
});
