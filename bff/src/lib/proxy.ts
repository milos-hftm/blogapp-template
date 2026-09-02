import { Cookie, HttpRequest } from '@azure/functions';
import {
  SessionData,
  clearSessionCookies,
  isSessionExpired,
  parseSessionCookie,
  sealSession,
  sessionCookies,
  sessionFromTokens,
  unsealSession,
} from './session.js';
import { refreshTokens } from './keycloak.js';

const BLOG_BACKEND_URL = process.env.BLOG_BACKEND_URL!;

interface ProxyResult {
  status: number;
  body: unknown;
  headers: Record<string, string>;
  cookies: Cookie[];
}

export async function proxyToBackend(
  request: HttpRequest,
  path: string,
  method: string,
): Promise<ProxyResult> {
  const cookieHeader = request.headers.get('cookie');
  const sealed = parseSessionCookie(cookieHeader);
  const responseCookies: Cookie[] = [];

  let session: SessionData | null = null;

  if (sealed) {
    session = await unsealSession(sealed);
  }

  if (!session && method !== 'GET') {
    return {
      status: 401,
      body: { error: 'Authentication required' },
      headers: {},
      cookies: [],
    };
  }

  let accessToken: string | undefined;

  if (session) {
    if (isSessionExpired(session)) {
      try {
        const tokens = await refreshTokens(session.refreshToken);
        session = sessionFromTokens(tokens);
        responseCookies.push(...sessionCookies(await sealSession(session), cookieHeader));
      } catch {
        return {
          status: 401,
          body: { error: 'Session expired' },
          headers: {},
          cookies: clearSessionCookies(cookieHeader),
        };
      }
    }

    accessToken = session.accessToken;
  }

  const backendHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (accessToken) {
    backendHeaders['Authorization'] = `Bearer ${accessToken}`;
  }

  const fetchOptions: RequestInit = {
    method,
    headers: backendHeaders,
  };

  if (method === 'POST' || method === 'PUT' || method === 'PATCH') {
    const body = await request.text();

    if (body) {
      fetchOptions.body = body;
    }
  }

  const queryString = request.query.toString();
  const url = queryString
    ? `${BLOG_BACKEND_URL}${path}?${queryString}`
    : `${BLOG_BACKEND_URL}${path}`;
  const backendResponse = await fetch(url, fetchOptions);
  const responseBody = await backendResponse.json().catch(() => null);

  return {
    status: backendResponse.status,
    body: responseBody,
    headers: {},
    cookies: responseCookies,
  };
}
