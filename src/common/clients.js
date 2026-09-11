/**
 * Central registry of apps allowed to use this SSO service.
 * Register your real apps here — each entry must define a unique clientId,
 * its own audience (used as the JWT `aud` claim), and an exact redirect URI
 * that the auth service validates on every authorize/token request.
 */
export const ssoClients = {};

/**
 * Programmatic registration helper for apps wired up at startup, e.g.:
 *   registerSsoClient({
 *     clientId: 'my-app',
 *     name: 'My App',
 *     audience: 'my-app',
 *     appBaseUrl: 'https://my-app.example.com',
 *     redirectPath: '/auth/callback',
 *     sessionCookieName: 'my_app_access_token',
 *     stateCookieName: 'my_app_oauth_state',
 *     protectedPath: '/dashboard',
 *     scopes: ['offline_access']
 *   });
 */
export function registerSsoClient({
  clientId,
  name,
  audience,
  appBaseUrl,
  redirectPath = '/auth/callback',
  sessionCookieName,
  stateCookieName,
  protectedPath = '/',
  scopes = ['offline_access']
}) {
  if (!clientId || ssoClients[clientId]) {
    throw new Error(`SSO client is missing or already registered: ${clientId}`);
  }

  ssoClients[clientId] = {
    clientId,
    name: name || clientId,
    audience: audience || clientId,
    appBaseUrl,
    redirectUri: `${appBaseUrl}${redirectPath}`,
    sessionCookieName: sessionCookieName || `${clientId.replace(/-/g, '_')}_access_token`,
    stateCookieName: stateCookieName || `${clientId.replace(/-/g, '_')}_oauth_state`,
    protectedPath,
    scopes
  };

  return ssoClients[clientId];
}

export function getSsoClient(clientId) {
  return ssoClients[clientId] || null;
}

export function listSsoClients() {
  return Object.values(ssoClients);
}
