import crypto from 'node:crypto';

const loginSessions = new Map();
const authorizationCodes = new Map();

const loginSessionTtlMs = 8 * 60 * 60 * 1000;
const authorizationCodeTtlMs = 5 * 60 * 1000;

function pruneExpiredEntries(store) {
  const now = Date.now();

  for (const [key, value] of store.entries()) {
    if (value.expiresAt <= now) {
      store.delete(key);
    }
  }
}

export function createLoginSession(user) {
  pruneExpiredEntries(loginSessions);

  const sessionId = crypto.randomUUID();
  loginSessions.set(sessionId, {
    ...user,
    expiresAt: Date.now() + loginSessionTtlMs
  });

  return sessionId;
}

export function getLoginSession(sessionId) {
  pruneExpiredEntries(loginSessions);
  return loginSessions.get(sessionId) || null;
}

export function deleteLoginSession(sessionId) {
  loginSessions.delete(sessionId);
}

export function createAuthorizationCode({ clientId, redirectUri, user }) {
  pruneExpiredEntries(authorizationCodes);

  const code = crypto.randomUUID();
  authorizationCodes.set(code, {
    clientId,
    redirectUri,
    user,
    expiresAt: Date.now() + authorizationCodeTtlMs
  });

  return code;
}

export function consumeAuthorizationCode(code) {
  pruneExpiredEntries(authorizationCodes);

  const record = authorizationCodes.get(code) || null;
  if (record) {
    authorizationCodes.delete(code);
  }

  return record;
}
