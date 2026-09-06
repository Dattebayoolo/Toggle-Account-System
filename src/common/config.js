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
  docsPort: Number(process.env.TOGGLE_DOCS_PORT || 4100),
  calendarPort: Number(process.env.TOGGLE_CALENDAR_PORT || 4200),
  authBaseUrl: process.env.AUTH_BASE_URL || `http://localhost:${Number(process.env.PORT || 4000)}`,
  docsBaseUrl: process.env.TOGGLE_DOCS_BASE_URL || `http://localhost:${Number(process.env.TOGGLE_DOCS_PORT || 4100)}`,
  calendarBaseUrl: process.env.TOGGLE_CALENDAR_BASE_URL || `http://localhost:${Number(process.env.TOGGLE_CALENDAR_PORT || 4200)}`,
  databaseUrl: requireEnv('DATABASE_URL'),
  jwtIssuer: requireEnv('JWT_ISSUER'),
  jwtKeyId: requireEnv('JWT_KEY_ID'),
  jwtPrivateKeyPem: requireEnv('JWT_PRIVATE_KEY_PEM'),
  jwtPublicKeyPem: requireEnv('JWT_PUBLIC_KEY_PEM'),
  ssoSessionCookieName: process.env.SSO_SESSION_COOKIE_NAME || 'toggle_sso_session'
};
