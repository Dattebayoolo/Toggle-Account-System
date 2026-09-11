import dotenv from 'dotenv';

dotenv.config();

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const config = {
  authServicePort: Number(process.env.PORT || 4000),
  authBaseUrl: process.env.AUTH_BASE_URL || `http://localhost:${Number(process.env.PORT || 4000)}`,
  // Audience used when tokens are issued directly (e.g. POST /auth/login) outside
  // of a specific app's authorize flow.
  defaultAudience: process.env.DEFAULT_TOKEN_AUDIENCE || 'toggle',
  databaseUrl: requireEnv('DATABASE_URL'),
  jwtIssuer: requireEnv('JWT_ISSUER'),
  jwtKeyId: requireEnv('JWT_KEY_ID'),
  jwtPrivateKeyPem: requireEnv('JWT_PRIVATE_KEY_PEM'),
  jwtPublicKeyPem: requireEnv('JWT_PUBLIC_KEY_PEM'),
  ssoSessionCookieName: process.env.SSO_SESSION_COOKIE_NAME || 'toggle_sso_session',
  smtpHost: process.env.SMTP_HOST || '',
  smtpPort: Number(process.env.SMTP_PORT || 587),
  smtpSecure: process.env.SMTP_SECURE === 'true',
  smtpUser: process.env.SMTP_USER || '',
  smtpPass: process.env.SMTP_PASS || '',
  smtpFrom: process.env.SMTP_FROM || '',
  refreshTokenTtlDays: Number(process.env.REFRESH_TOKEN_TTL_DAYS || 30),
  // Optional JSON array of previous signing keys: [{"kid":"toggle-key-0","pem":"-----BEGIN PUBLIC KEY-----..."}]
  // Lets verifiers keep validating tokens issued before a key rotation.
  jwtPreviousPublicKeys: JSON.parse(process.env.JWT_PREVIOUS_PUBLIC_KEYS || '[]')
};
