import crypto from 'node:crypto';

import { clearCookie, parseCookies, setCookie } from '../../common/cookies.js';
import { config } from '../../common/config.js';

function base64url(buffer) {
  return buffer.toString('base64url');
}

function createPkcePair() {
  const codeVerifier = base64url(crypto.randomBytes(48));
  const codeChallenge = base64url(crypto.createHash('sha256').update(codeVerifier).digest());
  return { codeVerifier, codeChallenge };
}

export function beginBrowserLogin(req, res, client) {
  const state = crypto.randomUUID();
  const { codeVerifier, codeChallenge } = createPkcePair();

  // State + PKCE verifier travel together in a signed-in-place cookie so the
  // callback can prove the response matches this browser's request.
  setCookie(
    res,
    client.stateCookieName,
    Buffer.from(JSON.stringify({ state, codeVerifier })).toString('base64url'),
    {
      httpOnly: true,
      sameSite: 'Lax',
      maxAge: 10 * 60
    }
  );

  const authorizeUrl = new URL('/authorize', config.authBaseUrl);
  authorizeUrl.searchParams.set('client_id', client.clientId);
  authorizeUrl.searchParams.set('redirect_uri', client.redirectUri);
  authorizeUrl.searchParams.set('state', state);
  authorizeUrl.searchParams.set('scope', client.scopes.join(' '));
  authorizeUrl.searchParams.set('code_challenge', codeChallenge);
  authorizeUrl.searchParams.set('code_challenge_method', 'S256');

  res.redirect(authorizeUrl.toString());
}

export function readStateCookie(req, client) {
  const cookies = parseCookies(req.headers.cookie);
  const raw = cookies[client.stateCookieName] || '';

  if (!raw) {
    return { state: '', codeVerifier: '' };
  }

  try {
    const parsed = JSON.parse(Buffer.from(raw, 'base64url').toString('utf8'));
    return {
      state: String(parsed.state || ''),
      codeVerifier: String(parsed.codeVerifier || '')
    };
  } catch (_error) {
    return { state: raw, codeVerifier: '' };
  }
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

export async function exchangeAuthorizationCode(client, code, codeVerifier) {
  const response = await fetch(new URL('/token', config.authBaseUrl), {
    method: 'POST',
    headers: {
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      grant_type: 'authorization_code',
      code,
      client_id: client.clientId,
      redirect_uri: client.redirectUri,
      code_verifier: codeVerifier
    })
  });

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.error || 'Token exchange failed.');
  }

  return payload;
}
