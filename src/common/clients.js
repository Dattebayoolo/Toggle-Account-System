import { config } from './config.js';

export const ssoClients = {
  'toggle-docs': {
    clientId: 'toggle-docs',
    name: 'Toggle Docs',
    audience: 'toggle-docs',
    appBaseUrl: config.docsBaseUrl,
    redirectUri: `${config.docsBaseUrl}/auth/callback`,
    sessionCookieName: 'toggle_docs_access_token',
    stateCookieName: 'toggle_docs_oauth_state',
    protectedPath: '/documents',
    scopes: ['documents.read', 'offline_access']
  },
  'toggle-calendar': {
    clientId: 'toggle-calendar',
    name: 'Toggle Calendar',
    audience: 'toggle-calendar',
    appBaseUrl: config.calendarBaseUrl,
    redirectUri: `${config.calendarBaseUrl}/auth/callback`,
    sessionCookieName: 'toggle_calendar_access_token',
    stateCookieName: 'toggle_calendar_oauth_state',
    protectedPath: '/events',
    scopes: ['events.read', 'offline_access']
  }
};

export function getSsoClient(clientId) {
  return ssoClients[clientId] || null;
}
