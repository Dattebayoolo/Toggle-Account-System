import crypto from 'node:crypto';

import { db } from './db.js';
import { config } from '../common/config.js';

const loginSessionTtlHours = 8;
const authorizationCodeTtlMinutes = 5;
const refreshTokenTtlDays = config.refreshTokenTtlDays;

function hashOpaqueToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function createOpaqueToken() {
  return crypto.randomBytes(32).toString('hex');
}

function expiryDate({ hours = 0, minutes = 0, days = 0 } = {}) {
  return new Date(Date.now() + hours * 3600000 + minutes * 60000 + days * 86400000);
}

/**
 * Central login sessions, persisted in PostgreSQL so they survive restarts
 * and work across multiple auth-service instances.
 */
export async function createLoginSession(user) {
  const sessionId = crypto.randomUUID();

  await db.query(
    `INSERT INTO login_sessions (session_id, user_id, expires_at)
     VALUES ($1, $2, $3)`,
    [sessionId, user.userId, expiryDate({ hours: loginSessionTtlHours })]
  );

  return sessionId;
}

export async function getLoginSession(sessionId) {
  const result = await db.query(
    `SELECT s.user_id, u.email
     FROM login_sessions s
     JOIN auth_users u ON u.user_id = s.user_id
     WHERE s.session_id = $1
       AND s.expires_at > NOW()`,
    [sessionId]
  );

  const row = result.rows[0];
  if (!row) {
    return null;
  }

  return { userId: row.user_id, email: row.email };
}

export async function deleteLoginSession(sessionId) {
  await db.query(`DELETE FROM login_sessions WHERE session_id = $1`, [sessionId]);
}

/**
 * Single-use authorization codes with optional PKCE challenge + scope.
 */
export async function createAuthorizationCode({ clientId, redirectUri, user, codeChallenge = '', codeChallengeMethod = '', scope = '' }) {
  const code = crypto.randomBytes(32).toString('base64url');

  await db.query(
    `INSERT INTO authorization_codes
       (code, client_id, redirect_uri, user_id, user_email, code_challenge, code_challenge_method, scope, expires_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
    [
      code,
      clientId,
      redirectUri,
      user.userId,
      user.email,
      codeChallenge || null,
      codeChallenge ? (codeChallengeMethod || 'S256') : null,
      scope || null,
      expiryDate({ minutes: authorizationCodeTtlMinutes })
    ]
  );

  return code;
}

/**
 * Atomically consumes a code: a code can only ever be exchanged once.
 */
export async function consumeAuthorizationCode(code) {
  const result = await db.query(
    `DELETE FROM authorization_codes
     WHERE code = $1
       AND expires_at > NOW()
       AND consumed_at IS NULL
     RETURNING client_id, redirect_uri, user_id, user_email, code_challenge, code_challenge_method, scope`,
    [code]
  );

  const row = result.rows[0];
  if (!row) {
    return null;
  }

  return {
    clientId: row.client_id,
    redirectUri: row.redirect_uri,
    user: { userId: row.user_id, email: row.user_email },
    codeChallenge: row.code_challenge || '',
    codeChallengeMethod: row.code_challenge_method || '',
    scope: row.scope || ''
  };
}
/**
 * Refresh tokens: issued hashed, rotated on every use. If a revoked token
 * is ever replayed, every refresh token for that user + client is revoked
 * (reuse detection).
 */
export async function createRefreshToken({ userId, clientId, scope = '' }) {
  const token = createOpaqueToken();

  await db.query(
    `INSERT INTO refresh_tokens (user_id, token_hash, expires_at, client_id, scope)
     VALUES ($1, $2, $3, $4, $5)`,
    [userId, hashOpaqueToken(token), expiryDate({ days: refreshTokenTtlDays }), clientId, scope || null]
  );

  return token;
}

export async function rotateRefreshToken(token) {
  const tokenHash = hashOpaqueToken(token);

  const result = await db.query(
    `SELECT refresh_token_id, user_id, client_id, scope, revoked_at, expires_at
     FROM refresh_tokens
     WHERE token_hash = $1`,
    [tokenHash]
  );

  const record = result.rows[0];
  if (!record) {
    return null;
  }

  // Replaying a revoked token is an attack signal: kill the whole family.
  if (record.revoked_at) {
    await db.query(
      `UPDATE refresh_tokens
       SET revoked_at = NOW()
       WHERE user_id = $1
         AND client_id = $2
         AND revoked_at IS NULL`,
      [record.user_id, record.client_id]
    );

    return null;
  }

  if (new Date(record.expires_at) <= new Date()) {
    return null;
  }

  const client = await db.connect();
  try {
    await client.query('BEGIN');

    await client.query(
      `UPDATE refresh_tokens
       SET revoked_at = NOW()
       WHERE refresh_token_id = $1`,
      [record.refresh_token_id]
    );

    const newToken = createOpaqueToken();
    await client.query(
      `INSERT INTO refresh_tokens (user_id, token_hash, expires_at, client_id, scope)
       VALUES ($1, $2, $3, $4, $5)`,
      [record.user_id, hashOpaqueToken(newToken), expiryDate({ days: refreshTokenTtlDays }), record.client_id, record.scope]
    );

    await client.query('COMMIT');

    return {
      token: newToken,
      userId: record.user_id,
      clientId: record.client_id,
      scope: record.scope || ''
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function revokeRefreshTokensForUser(userId) {
  await db.query(
    `UPDATE refresh_tokens
     SET revoked_at = NOW()
     WHERE user_id = $1
       AND revoked_at IS NULL`,
    [userId]
  );
}

/**
 * Remembered consent for (user, client). Consent is only asked when a scope
 * is requested and has not been granted before for that client.
 */
export async function hasGrantedConsent({ userId, clientId }) {
  const result = await db.query(
    `SELECT 1 FROM user_consents
     WHERE user_id = $1
       AND client_id = $2`,
    [userId, clientId]
  );

  return result.rowCount > 0;
}

export async function saveConsent({ userId, clientId, scope }) {
  await db.query(
    `INSERT INTO user_consents (user_id, client_id, scope)
     VALUES ($1, $2, $3)
     ON CONFLICT (user_id, client_id) DO UPDATE
       SET scope = EXCLUDED.scope,
           granted_at = NOW()`,
    [userId, clientId, scope]
  );
}