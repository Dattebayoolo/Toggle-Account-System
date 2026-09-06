# Toggle Account System

Centralized SSO starter for:

- Toggle Docs
- Toggle Calendar

This repository now demonstrates two layers:

- API-based JWT authentication for backend clients
- browser-based hosted login with redirects, similar to a lightweight Google-style sign-in flow

## What Is Implemented

### Central auth service

- hosted login UI
- hosted sign-up UI
- email verification flow
- forgot-password and reset-password flow
- central browser session cookie
- `POST /auth/login` for direct API login
- `GET /authorize` for redirect-based browser sign-in
- `POST /token` for authorization code exchange
- `GET /logout` for central sign-out

### Toggle Docs and Toggle Calendar

- `Continue with Toggle` browser login buttons
- callback route at `/auth/callback`
- per-app session cookies that store the access token
- protected browser pages
- protected JSON API routes that validate the same JWT

## Browser SSO Flow

1. User opens Toggle Docs or Toggle Calendar.
2. User clicks `Continue with Toggle`.
3. The app redirects the browser to the central auth service `/authorize`.
4. If the user is not already signed in centrally, the auth service redirects to `/login` and shows the hosted sign-in page.
5. After login, the auth service creates a short-lived authorization code and redirects back to the app callback URL.
6. The app exchanges that code at `POST /token`.
7. The app stores the returned JWT in its own HTTP-only cookie.
8. Protected pages and APIs validate that JWT and extract the central `user_id`.

## Account Lifecycle Pages

The auth service now also exposes:

- `GET /signup` and `POST /signup`
- `GET /verify-email`
- `GET /forgot-password` and `POST /forgot-password`
- `GET /reset-password` and `POST /reset-password`

Because this starter does not yet send real emails, the hosted pages render local development links for email verification and password reset.

## API Login Flow

If you want non-browser login, call:

```bash
POST /auth/login
```

That returns a signed JWT directly.

## Project Structure

```text
database/schema.sql
src/common/config.js
src/common/clients.js
src/common/cookies.js
src/common/html.js
src/common/jwt.js
src/auth-service/authStore.js
src/auth-service/authenticationService.js
src/auth-service/server.js
src/auth-service/routes/auth.js
src/apps/shared/authMiddleware.js
src/apps/shared/ssoClient.js
src/apps/toggle-docs/server.js
src/apps/toggle-calendar/server.js
```

## Environment Setup

1. Copy `.env.example` to `.env`.
2. Set `DATABASE_URL`.
3. Paste a real RSA private/public key pair into:
   - `JWT_PRIVATE_KEY_PEM`
   - `JWT_PUBLIC_KEY_PEM`
4. Apply `database/schema.sql` to PostgreSQL.
5. Install dependencies with `npm install`.

For local development, keep these URLs aligned:

- `AUTH_BASE_URL=http://localhost:4000`
- `TOGGLE_DOCS_BASE_URL=http://localhost:4100`
- `TOGGLE_CALENDAR_BASE_URL=http://localhost:4200`

You can generate a local RSA key pair with OpenSSL:

```bash
openssl genrsa -out private.pem 2048
openssl rsa -in private.pem -pubout -out public.pem
```

Then convert the PEM files into single-line environment values by replacing line breaks with `\n`.

## Running Services

Run each service in its own terminal:

```bash
npm run start:auth
```

```bash
npm run start:docs
```

```bash
npm run start:calendar
```

Default URLs:

- Auth Service: `http://localhost:4000`
- Toggle Docs: `http://localhost:4100`
- Toggle Calendar: `http://localhost:4200`

## What To Open In The Browser

- Auth home: `http://localhost:4000`
- Toggle Docs: `http://localhost:4100`
- Toggle Calendar: `http://localhost:4200`

From there you can click through the hosted login flow.

## Example API Login Request

```bash
curl -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"user@example.com\",\"password\":\"Password123!\"}"
```

## Example Protected API Requests

With bearer token:

```bash
curl http://localhost:4100/api/documents \
  -H "Authorization: Bearer YOUR_TOKEN"
```

```bash
curl http://localhost:4200/api/events \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Or, after browser login, just open:

- `http://localhost:4100/documents`
- `http://localhost:4200/events`

## Important Notes

- The authorization code store and central session store are in memory for this starter implementation.
- If you restart the auth server, browser sessions and pending auth codes are lost.
- Production systems should move session and authorization code storage to Redis or another shared store.
- Production SSO should usually evolve toward OAuth 2.0 / OpenID Connect with PKCE, consent handling, refresh token rotation, and key rotation via JWKS.

## Database

The PostgreSQL schema in `database/schema.sql` includes:

- immutable `user_id` UUID
- password hash fields
- account status
- refresh token table
- login audit events
- email verification token table
- password reset token table

## Next Production Steps

- seed at least one active user in `auth_users`
- add real email delivery for verification and password reset
- store sessions and authorization codes in Redis
- add refresh token rotation
- expose a JWKS endpoint
- move browser login fully to OIDC authorization code flow with PKCE
