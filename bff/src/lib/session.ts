import * as Iron from '@hapi/iron';
import type { Cookie } from '@azure/functions';
import type { TokenResponse } from './keycloak.js';

const SESSION_SECRET = process.env.SESSION_SECRET!;

const SESSION_COOKIE = '__session';
const SESSION_MAX_AGE = 86400;

export const PKCE_COOKIE = '__pkce';
const PKCE_MAX_AGE = 600;
const CHUNK_SIZE = 3500;
const SECURE_COOKIE = !process.env.ALLOWED_ORIGIN?.startsWith('http://');

export interface SessionData {
  accessToken: string;
  refreshToken: string;
  idToken: string;
  expiresAt: number;
}

export interface PkceData {
  verifier: string;
  state: string;
  returnUrl: string;
}

async function seal(data: unknown): Promise<string> {
  return Iron.seal(data, SESSION_SECRET, Iron.defaults);
}

async function unseal<T>(sealed: string): Promise<T | null> {
  try {
    return (await Iron.unseal(sealed, SESSION_SECRET, Iron.defaults)) as T;
  } catch {
    return null;
  }
}

export async function sealSession(data: SessionData): Promise<string> {
  return seal(data);
}

export async function unsealSession(sealed: string): Promise<SessionData | null> {
  return unseal<SessionData>(sealed);
}

export async function sealPkce(data: PkceData): Promise<string> {
  return seal(data);
}

export async function unsealPkce(sealed: string): Promise<PkceData | null> {
  return unseal<PkceData>(sealed);
}

export function sessionFromTokens(tokens: TokenResponse): SessionData {
  return {
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token,
    idToken: tokens.id_token,
    expiresAt: Date.now() + tokens.expires_in * 1000,
  };
}

export function parseCookie(cookieHeader: string | null, name = SESSION_COOKIE): string | null {
  if (!cookieHeader) {
    return null;
  }

  const match = cookieHeader
    .split(';')
    .map((cookieValue) => cookieValue.trim())
    .find((cookieValue) => cookieValue.startsWith(`${name}=`));

  if (!match) {
    return null;
  }

  const rawValue = match.substring(name.length + 1);

  try {
    return decodeURIComponent(rawValue);
  } catch {
    return rawValue;
  }
}

function cookie(name: string, value: string, maxAge: number): Cookie {
  return {
    name,
    value,
    httpOnly: true,
    secure: SECURE_COOKIE,
    sameSite: 'Lax',
    path: '/',
    maxAge,
  };
}

export function sessionCookies(sealed: string, cookieHeader: string | null = null): Cookie[] {
  const cookies: Cookie[] = [];
  let index = 0;

  for (; index * CHUNK_SIZE < sealed.length; index++) {
    cookies.push(
      cookie(
        `${SESSION_COOKIE}.${index}`,
        sealed.substring(index * CHUNK_SIZE, (index + 1) * CHUNK_SIZE),
        SESSION_MAX_AGE,
      ),
    );
  }

  for (; parseCookie(cookieHeader, `${SESSION_COOKIE}.${index}`) !== null; index++) {
    cookies.push(cookie(`${SESSION_COOKIE}.${index}`, '', 0));
  }

  return cookies;
}

export function parseSessionCookie(cookieHeader: string | null): string | null {
  const parts: string[] = [];

  for (let index = 0; ; index++) {
    const part = parseCookie(cookieHeader, `${SESSION_COOKIE}.${index}`);

    if (part === null) {
      break;
    }

    parts.push(part);
  }

  return parts.length > 0 ? parts.join('') : null;
}

export function clearSessionCookies(cookieHeader: string | null): Cookie[] {
  const cookies: Cookie[] = [];

  for (let index = 0; parseCookie(cookieHeader, `${SESSION_COOKIE}.${index}`) !== null; index++) {
    cookies.push(cookie(`${SESSION_COOKIE}.${index}`, '', 0));
  }

  return cookies.length > 0 ? cookies : [cookie(`${SESSION_COOKIE}.0`, '', 0)];
}

export function pkceCookie(sealed: string): Cookie {
  return cookie(PKCE_COOKIE, sealed, PKCE_MAX_AGE);
}

export function clearPkceCookie(): Cookie {
  return cookie(PKCE_COOKIE, '', 0);
}

export function isSessionExpired(session: SessionData): boolean {
  return Date.now() >= session.expiresAt;
}
