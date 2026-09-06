import crypto from 'crypto';
import argon2 from 'argon2';

import { config } from '../common/config.js';
import { db } from './db.js';

const maxFailedAttempts = 5;
const lockDurationMinutes = 15;
const emailVerificationTtlHours = 24;
const passwordResetTtlHours = 1;
const minPasswordLength = 8;

function hashOpaqueToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function createOpaqueToken() {
  return crypto.randomBytes(32).toString('hex');
}

function buildAuthUrl(path, token) {
  const url = new URL(path, config.authBaseUrl);
  url.searchParams.set('token', token);
  return url.toString();
}

function createExpiryDate(hours) {
  return new Date(Date.now() + hours * 60 * 60 * 1000);
}

export function validatePassword(password) {
  if (!password || password.length < minPasswordLength) {
    return `Password must be at least ${minPasswordLength} characters long.`;
  }

  return '';
}

const allowedGenders = new Set(['', 'female', 'male', 'rather-not-say', 'custom']);
const minSignupAgeYears = 13;

export function validateProfile({ firstName, lastName, dateOfBirth, gender }) {
  const trimmedFirst = String(firstName || '').trim();
  const trimmedLast = String(lastName || '').trim();

  if (!trimmedFirst || trimmedFirst.length > 80) {
    return { ok: false, error: 'Enter a first name (max 80 characters).' };
  }

  if (trimmedLast.length > 80) {
    return { ok: false, error: 'Last name must be 80 characters or fewer.' };
  }

  if (!dateOfBirth) {
    return { ok: false, error: 'Enter your birthday.' };
  }

  const dob = new Date(dateOfBirth);
  if (Number.isNaN(dob.getTime())) {
    return { ok: false, error: 'Enter a valid birthday.' };
  }

  const now = new Date();
  if (dob > now) {
    return { ok: false, error: 'Your birthday cannot be in the future.' };
  }

  if (dob.getUTCFullYear() < 1905) {
    return { ok: false, error: 'Enter a valid year.' };
  }

  let age = now.getUTCFullYear() - dob.getUTCFullYear();
  const beforeBirthday =
    now.getUTCMonth() < dob.getUTCMonth() ||
    (now.getUTCMonth() === dob.getUTCMonth() && now.getUTCDate() < dob.getUTCDate());
  if (beforeBirthday) {
    age -= 1;
  }

  if (age < minSignupAgeYears) {
    return { ok: false, error: `You must be at least ${minSignupAgeYears} years old to create a Toggle Account.` };
  }

  const trimmedGender = String(gender || '').trim().toLowerCase();
  if (!allowedGenders.has(trimmedGender)) {
    return { ok: false, error: 'Select a valid gender option.' };
  }

  return { ok: true, firstName: trimmedFirst, lastName: trimmedLast, dateOfBirth: dob, gender: trimmedGender };
}

export function isValidEmailFormat(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || '').trim());
}

export async function isEmailAvailable({ email }) {
  if (!isValidEmailFormat(email)) {
    return { ok: false, available: false, error: 'Enter a valid email address.' };
  }

  const result = await db.query(
    `SELECT 1 FROM auth_users WHERE email = $1`,
    [String(email).trim()]
  );

  return { ok: true, available: result.rowCount === 0 };
}

export async function recordAuditEvent({ userId, email, eventType, req }) {
  await db.query(
    `INSERT INTO login_audit_events (user_id, email, event_type, ip_address, user_agent)
     VALUES ($1, $2, $3, $4, $5)`,
    [
      userId || null,
      email,
      eventType,
      req.ip || null,
      req.get('user-agent') || null
    ]
  );
}

async function replaceEmailVerificationToken(userId) {
  await db.query(
    `DELETE FROM email_verification_tokens
     WHERE user_id = $1
       AND consumed_at IS NULL`,
    [userId]
  );

  const token = createOpaqueToken();
  await db.query(
    `INSERT INTO email_verification_tokens (user_id, token_hash, expires_at)
     VALUES ($1, $2, $3)`,
    [
      userId,
      hashOpaqueToken(token),
      createExpiryDate(emailVerificationTtlHours)
    ]
  );

  return {
    token,
    verificationUrl: buildAuthUrl('/verify-email', token)
  };
}

async function replacePasswordResetToken(userId) {
  await db.query(
    `DELETE FROM password_reset_tokens
     WHERE user_id = $1
       AND consumed_at IS NULL`,
    [userId]
  );

  const token = createOpaqueToken();
  await db.query(
    `INSERT INTO password_reset_tokens (user_id, token_hash, expires_at)
     VALUES ($1, $2, $3)`,
    [
      userId,
      hashOpaqueToken(token),
      createExpiryDate(passwordResetTtlHours)
    ]
  );

  return {
    token,
    resetUrl: buildAuthUrl('/reset-password', token)
  };
}

export async function authenticateCredentials({ email, password, req }) {
  const result = await db.query(
    `SELECT user_id, email, password_hash, status, failed_login_attempts, locked_until
     FROM auth_users
     WHERE email = $1`,
    [email]
  );

  const user = result.rows[0];
  if (!user) {
    await recordAuditEvent({
      userId: null,
      email,
      eventType: 'login_failed_unknown_user',
      req
    });
    return { ok: false, status: 401, error: 'Invalid credentials.' };
  }

  if (user.locked_until && new Date(user.locked_until) > new Date()) {
    await recordAuditEvent({
      userId: user.user_id,
      email: user.email,
      eventType: 'login_blocked_locked',
      req
    });
    return { ok: false, status: 423, error: 'Account temporarily locked.' };
  }

  if (user.status !== 'active') {
    await recordAuditEvent({
      userId: user.user_id,
      email: user.email,
      eventType: `login_blocked_${user.status}`,
      req
    });
    return { ok: false, status: 403, error: `Account is ${user.status}.` };
  }

  const isValidPassword = await argon2.verify(user.password_hash, password);
  if (!isValidPassword) {
    const nextFailedAttempts = user.failed_login_attempts + 1;
    const shouldLock = nextFailedAttempts >= maxFailedAttempts;

    await db.query(
      `UPDATE auth_users
       SET failed_login_attempts = $2,
           locked_until = CASE
             WHEN $3 THEN NOW() + ($4 || ' minutes')::INTERVAL
             ELSE NULL
           END
       WHERE user_id = $1`,
      [
        user.user_id,
        nextFailedAttempts,
        shouldLock,
        String(lockDurationMinutes)
      ]
    );

    await recordAuditEvent({
      userId: user.user_id,
      email: user.email,
      eventType: shouldLock ? 'login_failed_locked' : 'login_failed_bad_password',
      req
    });

    return { ok: false, status: 401, error: 'Invalid credentials.' };
  }

  await db.query(
    `UPDATE auth_users
     SET failed_login_attempts = 0,
         locked_until = NULL,
         last_login_at = NOW()
     WHERE user_id = $1`,
    [user.user_id]
  );

  await recordAuditEvent({
    userId: user.user_id,
    email: user.email,
    eventType: 'login_succeeded',
    req
  });

  return {
    ok: true,
    user: {
      userId: user.user_id,
      email: user.email
    }
  };
}

export async function registerUser({ email, password, firstName = '', lastName = '', dateOfBirth = null, gender = '', req }) {
  const passwordError = validatePassword(password);
  if (passwordError) {
    return { ok: false, status: 400, error: passwordError };
  }

  const profile = validateProfile({ firstName, lastName, dateOfBirth, gender });
  if (!profile.ok) {
    return { ok: false, status: 400, error: profile.error };
  }

  const existingResult = await db.query(
    `SELECT user_id, email, status
     FROM auth_users
     WHERE email = $1`,
    [email]
  );

  const existingUser = existingResult.rows[0];
  if (existingUser) {
    if (existingUser.status === 'pending_verification') {
      const verification = await replaceEmailVerificationToken(existingUser.user_id);
      await recordAuditEvent({
        userId: existingUser.user_id,
        email: existingUser.email,
        eventType: 'signup_verification_resent',
        req
      });

      return {
        ok: true,
        email: existingUser.email,
        verificationUrl: verification.verificationUrl,
        created: false
      };
    }

    return {
      ok: false,
      status: 409,
      error: 'An account with this email already exists.'
    };
  }

  const passwordHash = await argon2.hash(password, { type: argon2.argon2id });
  const insertResult = await db.query(
    `INSERT INTO auth_users (email, password_hash, status, first_name, last_name, date_of_birth, gender)
     VALUES ($1, $2, 'pending_verification', $3, $4, $5, $6)
     RETURNING user_id, email, first_name, last_name`,
    [
      email,
      passwordHash,
      profile.firstName,
      profile.lastName,
      profile.dateOfBirth,
      profile.gender || null
    ]
  );

  const user = insertResult.rows[0];
  const verification = await replaceEmailVerificationToken(user.user_id);

  await recordAuditEvent({
    userId: user.user_id,
    email: user.email,
    eventType: 'signup_registered',
    req
  });

  return {
    ok: true,
    email: user.email,
    verificationUrl: verification.verificationUrl,
    created: true
  };
}

export async function verifyEmailToken({ token, req }) {
  const result = await db.query(
    `SELECT evt.verification_token_id, u.user_id, u.email, u.status
     FROM email_verification_tokens evt
     JOIN auth_users u ON u.user_id = evt.user_id
     WHERE evt.token_hash = $1
       AND evt.consumed_at IS NULL
       AND evt.expires_at > NOW()`,
    [hashOpaqueToken(token)]
  );

  const record = result.rows[0];
  if (!record) {
    return {
      ok: false,
      status: 400,
      error: 'That verification link is invalid or has expired.'
    };
  }

  const client = await db.connect();
  try {
    await client.query('BEGIN');
    await client.query(
      `UPDATE email_verification_tokens
       SET consumed_at = NOW()
       WHERE verification_token_id = $1`,
      [record.verification_token_id]
    );

    await client.query(
      `UPDATE auth_users
       SET status = 'active'
       WHERE user_id = $1
         AND status = 'pending_verification'`,
      [record.user_id]
    );

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }

  await recordAuditEvent({
    userId: record.user_id,
    email: record.email,
    eventType: 'email_verified',
    req
  });

  return {
    ok: true,
    userId: record.user_id,
    email: record.email
  };
}

export async function getAccountSummary({ userId }) {
  const result = await db.query(
    `SELECT user_id, email, first_name, last_name, date_of_birth, gender, created_at, last_login_at, status, password_changed_at
     FROM auth_users
     WHERE user_id = $1`,
    [userId]
  );

  const account = result.rows[0];
  if (!account) {
    return { ok: false, error: 'Account not found.' };
  }

  return { ok: true, account };
}

export async function requestPasswordReset({ email, req }) {
  const result = await db.query(
    `SELECT user_id, email, status
     FROM auth_users
     WHERE email = $1`,
    [email]
  );

  const user = result.rows[0];
  if (!user) {
    await recordAuditEvent({
      userId: null,
      email,
      eventType: 'password_reset_requested_unknown_user',
      req
    });

    return { ok: true, email, resetUrl: '' };
  }

  if (user.status === 'pending_verification' || user.status === 'disabled') {
    await recordAuditEvent({
      userId: user.user_id,
      email: user.email,
      eventType: `password_reset_blocked_${user.status}`,
      req
    });

    return { ok: true, email: user.email, resetUrl: '' };
  }

  const reset = await replacePasswordResetToken(user.user_id);

  await recordAuditEvent({
    userId: user.user_id,
    email: user.email,
    eventType: 'password_reset_requested',
    req
  });

  return {
    ok: true,
    email: user.email,
    resetUrl: reset.resetUrl
  };
}

export async function getPasswordResetTokenStatus(token) {
  const result = await db.query(
    `SELECT u.email, u.status
     FROM password_reset_tokens prt
     JOIN auth_users u ON u.user_id = prt.user_id
     WHERE prt.token_hash = $1
       AND prt.consumed_at IS NULL
       AND prt.expires_at > NOW()`,
    [hashOpaqueToken(token)]
  );

  const record = result.rows[0];
  if (!record) {
    return {
      ok: false,
      error: 'That password reset link is invalid or has expired.'
    };
  }

  return {
    ok: true,
    email: record.email,
    status: record.status
  };
}

export async function resetPasswordWithToken({ token, password, req }) {
  const passwordError = validatePassword(password);
  if (passwordError) {
    return { ok: false, status: 400, error: passwordError };
  }

  const result = await db.query(
    `SELECT prt.password_reset_token_id, u.user_id, u.email, u.status
     FROM password_reset_tokens prt
     JOIN auth_users u ON u.user_id = prt.user_id
     WHERE prt.token_hash = $1
       AND prt.consumed_at IS NULL
       AND prt.expires_at > NOW()`,
    [hashOpaqueToken(token)]
  );

  const record = result.rows[0];
  if (!record) {
    return {
      ok: false,
      status: 400,
      error: 'That password reset link is invalid or has expired.'
    };
  }

  if (record.status === 'pending_verification') {
    return {
      ok: false,
      status: 403,
      error: 'Verify your email before resetting your password.'
    };
  }

  if (record.status === 'disabled') {
    return {
      ok: false,
      status: 403,
      error: 'This account is disabled.'
    };
  }

  const passwordHash = await argon2.hash(password, { type: argon2.argon2id });

  const client = await db.connect();
  try {
    await client.query('BEGIN');
    await client.query(
      `UPDATE password_reset_tokens
       SET consumed_at = NOW()
       WHERE password_reset_token_id = $1`,
      [record.password_reset_token_id]
    );

    await client.query(
      `UPDATE auth_users
       SET password_hash = $2,
           password_changed_at = NOW(),
           failed_login_attempts = 0,
           locked_until = NULL
       WHERE user_id = $1`,
      [record.user_id, passwordHash]
    );

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }

  await recordAuditEvent({
    userId: record.user_id,
    email: record.email,
    eventType: 'password_reset_succeeded',
    req
  });

  return {
    ok: true,
    email: record.email
  };
}
