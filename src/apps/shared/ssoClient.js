import crypto from 'node:crypto';

import { clearCookie, parseCookies, setCookie } from '../../common/cookies.js';
import { config } from '../../common/config.js';

export function beginBrowserLogin(req, res, client) {
  const state = crypto.randomUUID();

  setCookie(res, client.stateCookieName, state, {
    httpOnly: true,
    sameSite: 'Lax',
    maxAge: 10 * 60
  });

  const authorizeUrl = new URL('/authorize', config.authBaseUrl);
  authorizeUrl.searchParams.set('client_id', client.clientId);
  authorizeUrl.searchParams.set('redirect_uri', client.redirectUri);
  authorizeUrl.searchParams.set('state', state);

  res.redirect(authorizeUrl.toString());
}

export function readStateCookie(req, client) {
  const cookies = parseCookies(req.headers.cookie);
  return cookies[client.stateCookieName] || '';
}

export function clearStateCookie(res, client) {
  clearCookie(res, client.stateCookieName, {
    httpOnly: true,
    sameSite: 'Lax'
  });
}

export function setAppSessionCookie(res, client, accessToken) {
  setCookie(res, client.sessionCookieName, accessToken, {
    httpOnly: true,
    sameSite: 'Lax',
    maxAge: 15 * 60
  });
}

export function clearAppSessionCookie(res, client) {
  clearCookie(res, client.sessionCookieName, {
    httpOnly: true,
    sameSite: 'Lax'
  });
}

export async function exchangeAuthorizationCode(client, code) {
  const response = await fetch(new URL('/token', config.authBaseUrl), {
    method: 'POST',
    headers: {
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      code,
      client_id: client.clientId,
      redirect_uri: client.redirectUri
    })
  });

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.error || 'Token exchange failed.');
  }

  return payload;
}
