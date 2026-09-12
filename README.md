<p align="center">
  <img src="assets/logo.svg" width="96" alt="Toggle logo" />
</p>

<h1 align="center">Toggle Account System</h1>

<p align="center">
  <b>A single SSO &amp; account service for <i>Toggle Docs</i>, <i>Toggle Calendar</i> and any future Toggle app</b> — powered by a Google-style hosted sign-in, multi-step onboarding, and OAuth2-style authorization codes with signed JWTs.
</p>

<p align="center">
  <img alt="Express" src="https://img.shields.io/badge/Express-5.x-green" />
  <img alt="PostgreSQL" src="https://img.shields.io/badge/PostgreSQL-16-blue" />
  <img alt="JWT" src="https://img.shields.io/badge/Signed%20JWT-jose-orange" />
  <img alt="Passwords" src="https://img.shields.io/badge/Passwords-argon2id-purple" />
  <img alt="OAuth2" src="https://img.shields.io/badge/OAuth2-Auth%20Code-red" />
  <img alt="Auth UI" src="https://img.shields.io/badge/Auth%20UI-Google--grade-yellow" />
  <img alt="Status" src="https://img.shields.io/badge/Status-Development-lightgrey" />
</p>

---
## ✨ Highlights

| | |
|---|---|
| 🎨 **Google-grade hosted UI** | Dark-mode, Material-styled sign-in with floating labels, avatar chips, guest-mode hint and a language/privacy/terms footer |
| 🧭 **Multi-step sign-up wizard** | Name → birthday/gender → email (with live availability check) → strong password → review &amp; agree |
| 🔑 **Two-step sign-in** | Email first, then password — with "Not you? Use a different account" and account chip |
| 🔐 **Belt-and-suspenders security** | `argon2id` password hashing, SHA-256-throttled magic tokens, JWT signing with `jose`, login audit events |
| 🗝️ **OAuth2-style flow** | `/authorize` → code → `/token` exchanges for each connected app, signed access tokens scoped by `audience` |
| 🖥️ **Account dashboard** | `myaccount`-style page with profile details, apps and sign-out |
| 🌗 **Dark by default** | Full dark theme with a light-mode-ready variable palette |

## 🏗️ Architecture

```mermaid
flowchart LR
  subgraph S0["User / Browser"]
    U["👤 User"]
  end

  subgraph AUTH["Auth Service · :4000"]
    UI["🖥️ Hosted Login UI\n/signup · /login"]
    FLOW["🔄 Two-step sign-in\nwizard"]
    CODE["🔑 Authorization Codes"]
    SES["🍪 Central Session\nmem session store"]
    JWT["✍️ Sign JWT · jose"]
  end

  subgraph DOCS["Toggle Docs · :4100"]
    D1["📄 /documents"]
    D2["🗂️ /api/documents"]
  end

  subgraph CAL["Toggle Calendar · :4200"]
    C1["📅 /events"]
    C2["🗓️ /api/events"]
  end

  DB[("🗃️ PostgreSQL\nauth_users · tokens · audit")]

  U --> UI
  FLOW --> CODE
  FLOW --> SES
  UI --> DB
  CODE --> JWT
  D1 --> JWT
  C1 --> JWT
  D2 --> JWT
  C2 --> JWT
```

## 🔁 Browser SSO flow

```mermaid
sequenceDiagram
  autonumber
  participant U as User
  participant D as Toggle Docs
  participant A as Auth Service
  participant DB as PostgreSQL

  U->>D: Open /documents
  D-->>U: "Continue with Toggle"
  U->>D: Click continue
  D->>A: GET /authorize
  A-->>U: Redirect to /login
  U->>A: Sign in (email → password)
  A->>DB: Verify credentials
  A-->>U: Set session cookie
  A-->>U: Redirect to /auth/callback?code=...
  D->>A: POST /token (code)
  A-->>D: access_token (JWT)
  D-->>U: Redirect to /documents
```
## 🚀 Quick start

> **Requirements:** Node.js 20+, PostgreSQL 14+, and a Git client.

```bash
# 1. Install dependencies
npm install

# 2. Configure environment (copy the template, then fill in real values)
cp .env.example .env

# 3. Start PostgreSQL (see 🐘 Running PostgreSQL below) and create the database
createdb -U postgres toggle_auth
psql -U postgres -d toggle_auth -f database/schema.sql

# 4. Run the auth service
npm run start:auth        # Auth Service → http://localhost:4000
```

Open **<http://localhost:4000/signup>** to create an account, then explore the flows.

## 🐘 Running PostgreSQL

The auth service stores sessions, authorization codes, refresh tokens, consents and users in PostgreSQL — **nothing works until it's running** (`/health` reports DB status).

This project uses the **binary (zip) distribution** of PostgreSQL at `C:\Users\kazam.mahmood\pgsql` (no Windows service installed). Run everything from its `bin` folder.

**Start the server**

```powershell
C:\Users\kazam.mahmood\pgsql\bin\pg_ctl.exe start `
  -D C:\Users\kazam.mahmood\pgsql\data `
  -l C:\Users\kazam.mahmood\pgsql\postgres.log
```

**Check it's accepting connections**

```powershell
C:\Users\kazam.mahmood\pgsql\bin\pg_isready.exe
# → localhost:5432 - accepting connections
```

**Stop the server** (do this *before* closing the terminal that started it — killing the console kills Postgres ungracefully and forces crash recovery on the next start):

```powershell
C:\Users\kazam.mahmood\pgsql\bin\pg_ctl.exe stop -D C:\Users\kazam.mahmood\pgsql\data
```

**Connect with psql** (credentials match `DATABASE_URL` in `.env` — user `postgres`, password `postgres`):

```powershell
$env:PGPASSWORD = 'postgres'
C:\Users\kazam.mahmood\pgsql\bin\psql.exe -h localhost -U postgres -d toggle_auth
```

**First-time setup** (skip if the `toggle_auth` database already exists):

```powershell
# initialize a fresh data directory (only once)
C:\Users\kazam.mahmood\pgsql\bin\initdb.exe -D C:\Users\kazam.mahmood\pgsql\data -U postgres

# start, then create the project database & schema
C:\Users\kazam.mahmood\pgsql\bin\pg_ctl.exe start -D C:\Users\kazam.mahmood\pgsql\data -l C:\Users\kazam.mahmood\pgsql\postgres.log
C:\Users\kazam.mahmood\pgsql\bin\createdb.exe -h localhost -U postgres toggle_auth
C:\Users\kazam.mahmood\pgsql\bin\psql.exe -h localhost -U postgres -d toggle_auth -f database/schema.sql
```

**Optional — install as a Windows service** so it starts on boot and survives terminal closes:

```powershell
# one-time registration (run an elevated terminal)
C:\Users\kazam.mahmood\pgsql\bin\pg_ctl.exe register -N TogglePostgres -D C:\Users\kazam.mahmood\pgsql\data

net start TogglePostgres    # start
net stop TogglePostgres     # stop
```

**Troubleshooting**

- `ECONNREFUSED 127.0.0.1:5432` in the auth service logs → Postgres is not running; start it with `pg_ctl start` above.
- `another server might be running` from `pg_ctl start` → a Postgres process is already up (or a stale `postmaster.pid`); check with `pg_isready` and, if the server is truly dead, delete `C:\Users\kazam.mahmood\pgsql\data\postmaster.pid` before starting.
- Reset a forgotten password by editing `pg_hba.conf` (`trust`), restarting, and `ALTER USER postgres WITH PASSWORD 'postgres';`.


## ⚙️ Environment variables

| Variable | Example | Purpose |
|---|---|---|
| `PORT` | `4000` | Auth service port |
| `DATABASE_URL` | `postgresql://postgres:postgres@localhost:5432/toggle_auth` | PostgreSQL connection string |
| `JWT_ISSUER` | `https://auth.toggle.local` | `iss` claim in signed access tokens |
| `JWT_KEY_ID` | `toggle-key-1` | `kid` claim (key rotation path) |
| `JWT_PRIVATE_KEY_PEM` | `-----BEGIN PRIVATE KEY-----…` | RSA signing key (single-line with `\n`) |
| `JWT_PUBLIC_KEY_PEM` | `-----BEGIN PUBLIC KEY-----…` | RSA verification key (single-line with `\n`) |
| `AUTH_BASE_URL` | `http://localhost:4000` | Public base URL of the auth service |
| `TOGGLE_DOCS_PORT` / `BASE_URL` | `4100` / `http://localhost:4100` | Toggle Docs app |
| `TOGGLE_CALENDAR_PORT` / `BASE_URL` | `4200` / `http://localhost:4200` | Toggle Calendar app |
| `SSO_SESSION_COOKIE_NAME` | `toggle_sso_session` | Central session cookie |
| `REFRESH_TOKEN_TTL_DAYS` | `30` | Refresh-token lifetime before rotation expiry |
| `JWT_PREVIOUS_PUBLIC_KEYS` | `[]` | Optional JSON array of prior keys for JWKS rotation |
| `SMTP_HOST` / `SMTP_PORT` | e.g. `smtp.gmail.com` / `587` | SMTP server for real verification/reset emails |
| `SMTP_USER` / `SMTP_PASS` | — | SMTP credentials |
| `SMTP_SECURE` / `SMTP_FROM` | `false` / `Toggle <no-reply@…>` | TLS mode &amp; from-address |

> 🔐 **Never commit `.env`** — it's already ignored via `.gitignore`. Copy `.env.example` and fill in real keys locally.

Generate a local RSA key pair:

```bash
openssl genrsa -out private.pem 2048
openssl rsa -in private.pem -pubout -out public.pem
```

Then paste the PEM contents into `.env` as single-line values (replace line breaks with `\n`).
## 🧰 Scripts

| Command | Description |
|---|---|
| `npm run start:auth` | Auth service on `:4000` |
| `npm run start:docs` | Toggle Docs on `:4100` |
| `npm run start:calendar` | Toggle Calendar on `:4200` |
| `npm run check` | Syntax-check every source module |

## 🛣️ Endpoints

### Auth service · `:4000`

| Method | Path | Description |
|---|---|---|
| `GET` | `/` | Landing page |
| `GET` / `POST` | `/signup` | Multi-step account creation |
| `GET` | `/signup/check-email` | Live email availability check (JSON) |
| `GET` | `/login` | Two-step hosted sign-in |
| `POST` | `/login` | Password step / authenticate |
| `GET` | `/verify-email` | Activate account via emailed link |
| `GET` / `POST` | `/forgot-password` | Request a reset link |
| `GET` / `POST` | `/reset-password` | Set a new password |
| `GET` | `/account` | Authenticated dashboard |
| `GET` | `/authorize` | Start OIDC-style flow (requires PKCE) |
| `POST` | `/authorize/consent` | Grant / deny app access |
| `POST` | `/token` | Exchange code (or refresh) → signed JWT |
| `GET` | `/.well-known/jwks.json` | Public key set for token verification |
| `GET` | `/logout` | End central session & revoke refresh tokens |
| `POST` | `/auth/login` | API sign-in (returns JSON JWT) |
| `GET` | `/health` | Service + DB health check |

### Toggle Docs · `:4100` &bull; Toggle Calendar · `:4200`

| Method | Path | Description |
|---|---|---|
| `GET` | `/documents` / `/events` | Protected pages (require JWT cookie) |
| `GET` | `/api/documents` / `/api/events` | Protected JSON APIs |
| `GET` | `/auth/callback` | SSO callback (exchanges code) |

## 🗂️ Project structure

```text
toggle-account-system/
├── database/
│   └── schema.sql              # auth_users, tokens, audit, profile fields
├── src/
│   ├── common/                 # config, cookies, HTML shell, JWT, clients
│   ├── auth-service/
│   │   ├── server.js
│   │   ├── authenticationService.js
│   │   ├── authStore.js        # PostgreSQL sessions, codes, refresh, consent
│   │   ├── db.js
│   │   ├── routes/auth.js      # hosted UI + OAuth2/OIDC endpoints
│   │   └── mailer.js           # Nodemailer SMTP delivery (verify/reset)
│   └── apps/
│       ├── shared/             # authMiddleware.js, ssoClient.js
│       ├── toggle-docs/server.js
│       └── toggle-calendar/server.js
├── .env.example
├── .gitignore                  # secrets & local data excluded
└── package.json
```
## 🔌 Example API login (non-browser clients)

```bash
curl -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"Password123!"}'
```

Returns a signed JWT (`access_token`, `Bearer`, expires in 900s) plus `user_id` and `email`.

### Use the token on a protected API

```bash
curl http://localhost:4100/api/documents \
  -H "Authorization: Bearer YOUR_TOKEN"
```

```bash
curl http://localhost:4200/api/events \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 🎨 UI theme

A single CSS variable palette drives the look — dark by default, modeled on Google's Material dark surfaces:

<span style="display:inline-block;width:14px;height:14px;border-radius:50%;background:#131314"></span> `--bg` &nbsp;
<span style="display:inline-block;width:14px;height:14px;border-radius:50%;background:#1e1f20"></span> `--card` &nbsp;
<span style="display:inline-block;width:14px;height:14px;border-radius:50%;background:#8ab4f8"></span> `--g-blue` &nbsp;
<span style="display:inline-block;width:14px;height:14px;border-radius:50%;background:#a8c7fa"></span> primary button &nbsp;
<span style="display:inline-block;width:14px;height:14px;border-radius:50%;background:#f28b82"></span> `--g-red` &nbsp;

Every component references variables, so a light theme is just an override block (e.g. `[data-theme="light"]`).

## 🛡️ Security notes

- **Password hashing** — `argon2id` (memory-hard, designed for passwords)
- **Magic tokens** (verify / reset) — 256-bit random values, stored as SHA-256 hashes, time-boxed and single-use
- **Access tokens** — signed RSA JWTs via `jose`; `aud` scoped per app, optional `scope` claim
- **Lockout** — 5 failed attempts → 15&nbsp;min lock; every event written to `login_audit_events`
- **Age gate** — sign-up enforces a minimum age (13+) server-side
- **PKCE** — mandatory for browser flows (`S256` only); verifier must match the stored challenge
- **Refresh tokens** — issued hashed, rotated on every use; replaying a rotated token revokes the whole family
- **Consent** — users confirm app access once per app; scopes are validated against each client's allow-list

## ✅ Roadmap — implemented

Everything below is now built and verified end-to-end:

- [x] **Real transactional email** — Nodemailer SMTP for verification & password reset (falls back to dev links when unset). Configure `SMTP_*` in `.env`.
- [x] **Persistent sessions & auth codes** — moved from in-memory maps to PostgreSQL (`login_sessions`, `authorization_codes` tables), multi-instance safe
- [x] **Refresh-token rotation** — `grant_type=refresh_token` with hashed rotating tokens + family-wide reuse detection
- [x] **JWKS endpoint + key rotation** — `GET /.well-known/jwks.json`; optional previous keys via `JWT_PREVIOUS_PUBLIC_KEYS`
- [x] **OIDC authorization code flow with PKCE** — `/authorize` requires PKCE, `/token` verifies the verifier
- [x] **Consent screen & app-issued scopes** — `POST /authorize/consent`, remembered per app in `user_consents`

Remaining stretch goals for a larger rollout:

- [ ] App-issued *dynamic* registrations (auto-register new OAuth clients)
- [ ] Hosted single sign-out (OIDC `end_session_endpoint`) across apps
- [ ] WebAuthn / multi-factor second factor

## 📄 License

Released under the **MIT License**. Built on two pillars: <img alt="Express" src="https://img.shields.io/badge/Express-5.x-green" width="70" style="vertical-align:middle" /> and <img alt="PostgreSQL" src="https://img.shields.io/badge/PostgreSQL-16-blue" width="70" style="vertical-align:middle" /> — with ❤️ for clean OAuth in the browser.