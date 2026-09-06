import express from 'express';

import { config } from '../../common/config.js';
import { getSsoClient } from '../../common/clients.js';
import { renderPage } from '../../common/html.js';
import {
  createApiAuthMiddleware,
  createOptionalAuthMiddleware,
  createPageAuthMiddleware
} from '../shared/authMiddleware.js';
import {
  beginBrowserLogin,
  clearAppSessionCookie,
  clearStateCookie,
  exchangeAuthorizationCode,
  readStateCookie,
  setAppSessionCookie
} from '../shared/ssoClient.js';

const app = express();
const client = getSsoClient('toggle-docs');

app.use(express.json());

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', service: 'toggle-docs' });
});

app.get('/login', (req, res) => {
  beginBrowserLogin(req, res, client);
});

app.get('/auth/callback', async (req, res, next) => {
  try {
    const code = String(req.query.code || '');
    const returnedState = String(req.query.state || '');
    const { state: expectedState, codeVerifier } = readStateCookie(req, client);

    clearStateCookie(res, client);

    if (!code || !returnedState || returnedState !== expectedState || !codeVerifier) {
      return res.status(400).type('html').send(renderPage({
        title: 'Toggle Docs Sign-in Error',
        eyebrow: 'Toggle Docs',
        heading: 'Sign-in could not be completed',
        description: 'The callback from the central auth service was missing required values or did not pass state validation.',
        body: `<div class="actions"><a class="button" href="/login">Try again</a><a class="button secondary" href="/">Back home</a></div>`
      }));
    }

    const tokenResponse = await exchangeAuthorizationCode(client, code, codeVerifier);
    setAppSessionCookie(res, client, tokenResponse.access_token);

    return res.redirect(client.protectedPath);
  } catch (error) {
    return next(error);
  }
});

app.get('/logout', (_req, res) => {
  clearAppSessionCookie(res, client);
  clearStateCookie(res, client);
  res.redirect('/');
});

app.get(
  '/',
  createOptionalAuthMiddleware(client.audience, {
    cookieName: client.sessionCookieName
  }),
  (req, res) => {
    const body = req.user
      ? `<div class="panel">
           <strong>Signed in</strong>
           <div>${req.user.email}</div>
           <div><code>${req.user.userId}</code></div>
         </div>
         <div class="actions">
           <a class="button" href="/documents">Open documents</a>
           <a class="button secondary" href="${config.authBaseUrl}">Auth center</a>
           <a class="button secondary" href="/logout">Sign out</a>
         </div>`
      : `<p>Use the central Toggle login page, then return here with a signed app session.</p>
         <div class="actions">
           <a class="button" href="/login">Continue with Toggle</a>
           <a class="button secondary" href="${config.authBaseUrl}">Auth center</a>
         </div>`;

    res.type('html').send(renderPage({
      title: 'Toggle Docs',
      eyebrow: 'App Client',
      heading: 'Toggle Docs',
      description: 'This app redirects users to the central auth UI and stores its own app session after the authorization code exchange.',
      body
    }));
  }
);

app.get(
  '/documents',
  createPageAuthMiddleware(client.audience, {
    cookieName: client.sessionCookieName,
    redirectTo: '/login'
  }),
  (req, res) => {
    res.type('html').send(renderPage({
      title: 'Toggle Docs Workspace',
      eyebrow: 'Protected',
      heading: 'Your documents',
      description: 'This page is protected by the same JWT validation used by the API layer.',
      body: `<div class="panel">
               <strong>User</strong>
               <div>${req.user.email}</div>
               <div><code>${req.user.userId}</code></div>
             </div>
             <div class="actions">
               <a class="button" href="/api/documents">View JSON API response</a>
               <a class="button secondary" href="/logout">Sign out</a>
             </div>`
    }));
  }
);

app.use(
  '/api',
  createApiAuthMiddleware(client.audience, {
    cookieName: client.sessionCookieName
  })
);

app.get('/api/documents', (req, res) => {
  res.status(200).json({
    service: 'Toggle Docs',
    userId: req.user.userId,
    email: req.user.email,
    documents: []
  });
});

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).type('html').send(renderPage({
    title: 'Toggle Docs Error',
    eyebrow: 'App Client',
    heading: 'Something went wrong',
    description: 'The app could not complete the request.',
    body: `<div class="panel error">${error.message}</div>`
  }));
});

app.listen(config.docsPort, () => {
  console.log(`Toggle Docs listening on port ${config.docsPort}`);
});
