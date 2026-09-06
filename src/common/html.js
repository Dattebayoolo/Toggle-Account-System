export function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export function renderToggleLogo({ size = 24 }) {
  return `<svg class="brand-logo" width="${size}" height="${size}" viewBox="0 0 48 48" aria-hidden="true">
    <defs>
      <linearGradient id="toggle-track" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#4285f4"/>
        <stop offset="100%" stop-color="#1a73e8"/>
      </linearGradient>
    </defs>
    <rect x="4" y="12" width="40" height="24" rx="12" fill="url(#toggle-track)"/>
    <circle cx="30" cy="25" r="8.5" fill="rgba(32, 33, 36, 0.18)"/>
    <circle cx="30" cy="24" r="8.5" fill="#ffffff"/>
    <circle cx="30" cy="24" r="3" fill="#4285f4"/>
  </svg>`;
}

export function renderPage({ title, eyebrow, eyebrowTone = 'neutral', heading, description, body, showFooter = true }) {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="theme-color" content="#131314" />
    <title>${escapeHtml(title)}</title>
    <link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 48 48'%3E%3Crect x='4' y='12' width='40' height='24' rx='12' fill='%231a73e8'/%3E%3Ccircle cx='30' cy='24' r='8.5' fill='white'/%3E%3Ccircle cx='30' cy='24' r='3' fill='%234285f4'/%3E%3C/svg%3E" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Google+Sans:wght@400;500;700&family=Roboto:wght@400;500&display=swap" rel="stylesheet" />
    <style>
      :root {
        color-scheme: dark;
        /* Dark theme (default), colors following Google's dark material palette */
        --g-blue: #8ab4f8;            /* links, focus, accents */
        --g-blue-hover: #a8c7fa;      /* link hover */
        --g-btn-bg: #a8c7fa;          /* primary button surface */
        --g-btn-bg-hover: #8ab4f8;
        --g-btn-text: #062e6f;        /* dark text on light-blue button */
        --g-grey-1: #e3e3e3;          /* primary text */
        --g-grey-2: #c4c7c5;          /* secondary text / labels */
        --g-grey-3: #9aa0a6;          /* tertiary text */
        --g-grey-4: #444746;          /* borders */
        --g-grey-5: #2a2c2e;          /* subtle filled surfaces */
        --g-red: #f28b82;             /* error text */
        --g-red-bg: rgba(242, 139, 130, 0.12);
        --bg: #131314;                /* page background */
        --card: #1e1f20;              /* card / field surface */
        --card-border: #3c4043;
        --field-border: #5f6368;
        --footer-text: #9aa0a6;
        font-family: Roboto, "Google Sans", "Segoe UI", Arial, sans-serif;
      }

      * {
        box-sizing: border-box;
      }

      body {
        margin: 0;
        min-height: 100vh;
        background: var(--bg);
        color: var(--g-grey-1);
        display: flex;
        flex-direction: column;
      }

      .shell {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 24px 16px;
      }

      .card {
        width: min(100%, 448px);
        background: var(--card);
        border: 1px solid var(--card-border);
        border-radius: 28px;
        padding: 48px 40px 36px;
      }

      .brand-logo {
        width: 24px;
        height: 24px;
        display: block;
        margin-bottom: 20px;
      }

      .eyebrow {
        margin-bottom: 4px;
        color: var(--g-red);
        font-size: 16px;
        font-weight: 500;
      }

      .eyebrow.neutral {
        color: var(--g-grey-2);
      }

      h1 {
        margin: 0 0 12px;
        font-family: "Google Sans", Roboto, "Segoe UI", Arial, sans-serif;
        font-size: 24px;
        line-height: 1.4;
        font-weight: 400;
      }

      p {
        margin: 0 0 28px;
        line-height: 1.5;
        color: var(--g-grey-1);
        font-size: 16px;
      }

      p strong {
        font-weight: 500;
      }

      form {
        display: block;
      }

      /* Google Material outlined text field with floating label */
      .field {
        position: relative;
        margin-bottom: 20px;
      }

      .field input {
        width: 100%;
        border: 1px solid var(--field-border);
        border-radius: 4px;
        padding: 15px 15px 3px;
        font-size: 16px;
        font-family: inherit;
        color: var(--g-grey-1);
        background: var(--card);
        height: 56px;
        transition: border-color 0.15s ease, box-shadow 0.15s ease;
      }

      .field input:hover {
        box-shadow: inset 0 0 0 1px var(--g-grey-2);
      }

      .field input:focus {
        outline: none;
        border-color: var(--g-blue);
        box-shadow: inset 0 0 0 1px var(--g-blue);
      }

      .field label {
        position: absolute;
        left: 15px;
        top: 50%;
        transform: translateY(-50%);
        max-width: calc(100% - 30px);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        color: var(--g-grey-2);
        font-size: 16px;
        pointer-events: none;
        transition: all 0.12s ease;
      }

      .field input:focus + label,
      .field input:not(:placeholder-shown) + label {
        top: 9px;
        transform: none;
        font-size: 12px;
        color: var(--g-blue);
        background: var(--card);
        padding: 0 4px;
        margin-left: -4px;
      }

      .field input:not(:focus):not(:placeholder-shown) + label {
        color: var(--g-grey-2);
      }

      /* Inline field error, like Google's red helper text with icon */
      .field-error {
        display: flex;
        gap: 8px;
        align-items: flex-start;
        margin: -12px 0 20px;
        padding: 0 2px;
        color: var(--g-red);
        font-size: 14px;
        line-height: 1.4;
      }

      .field-error svg {
        flex: none;
        margin-top: 2px;
      }

      /* Primary button */
      button,
      .button {
        display: inline-flex;
        justify-content: center;
        align-items: center;
        border: 0;
        border-radius: 100px;
        background: var(--g-btn-bg);
        color: var(--g-btn-text);
        font-family: "Google Sans", Roboto, "Segoe UI", Arial, sans-serif;
        font-size: 14px;
        font-weight: 500;
        letter-spacing: 0.25px;
        text-decoration: none;
        padding: 0 24px;
        height: 36px;
        cursor: pointer;
      }

      button:hover,
      .button:hover {
        background: var(--g-btn-bg-hover);
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.3), 0 1px 3px 1px rgba(0, 0, 0, 0.15);
        text-decoration: none;
      }

      button:focus-visible,
      .button:focus-visible {
        outline: none;
        background: var(--g-btn-bg-hover);
        box-shadow: inset 0 0 0 1px var(--bg), 0 1px 3px 1px rgba(0, 0, 0, 0.15);
      }

      .button.secondary {
        background: transparent;
        color: var(--g-blue);
        border: 1px solid var(--g-grey-4);
      }

      .button.secondary:hover {
        background: rgba(138, 180, 248, 0.12);
        color: var(--g-blue-hover);
        border-color: var(--g-grey-4);
        box-shadow: none;
      }

      .text-link {
        display: inline-block;
        color: var(--g-blue);
        font-size: 14px;
        font-weight: 500;
        letter-spacing: 0.25px;
      }

      /* "Forgot email?" row under the field */
      .field-foot {
        margin: 2px 0 0;
      }

      .field-foot a {
        display: inline-block;
        font-size: 14px;
      }

      .hint {
        margin: 2px 0 0;
        font-size: 13px;
        color: var(--g-grey-2);
        line-height: 1.4;
      }

      /* Multi-step sign-up wizard */
      .signup-step[hidden] {
        display: none;
      }

      .row-2 {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
      }

      .row-3 {
        display: grid;
        grid-template-columns: 2fr 1fr 1fr;
        gap: 16px;
      }

      @media (max-width: 420px) {
        .row-2, .row-3 {
          grid-template-columns: 1fr;
        }
      }

      .field select {
        width: 100%;
        height: 56px;
        border: 1px solid var(--field-border);
        border-radius: 4px;
        background: var(--card);
        color: var(--g-grey-1);
        font-size: 16px;
        font-family: inherit;
        padding: 0 14px;
      }

      .field select:focus {
        outline: none;
        border-color: var(--g-blue);
        box-shadow: inset 0 0 0 1px var(--g-blue);
      }

      .chip-row {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin: 0 0 16px;
      }

      .chip {
        border: 1px solid var(--field-border);
        border-radius: 999px;
        background: transparent;
        color: var(--g-blue);
        height: 32px;
        padding: 0 16px;
        font-size: 14px;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
      }

      .chip.selected {
        background: rgba(138, 180, 248, 0.15);
        border-color: var(--g-blue);
      }

      .checkbox-row {
        display: flex;
        align-items: center;
        gap: 10px;
        margin: 16px 0 0;
        font-size: 14px;
        color: var(--g-grey-2);
      }

      .checkbox-row input {
        width: 18px;
        height: 18px;
        accent-color: var(--g-blue);
        cursor: pointer;
      }

      .review-list {
        border: 1px solid var(--g-grey-4);
        border-radius: 12px;
        padding: 4px 16px;
        margin: 8px 0 0;
      }

      .review-item {
        display: flex;
        justify-content: space-between;
        gap: 16px;
        padding: 12px 0;
        border-bottom: 1px solid var(--g-grey-4);
        font-size: 14px;
      }

      .review-item:last-child {
        border-bottom: 0;
      }

      .review-item .review-label {
        color: var(--g-grey-3);
        flex: none;
      }

      .review-item .review-value {
        text-align: right;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .terms-box {
        margin: 16px 0 0;
        padding: 14px 16px;
        border: 1px solid var(--g-grey-4);
        border-radius: 12px;
        font-size: 13px;
        line-height: 1.5;
        color: var(--g-grey-2);
      }

      /* Bottom row: create account left, next right (like Google) */
      .bottom-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        flex-wrap: wrap;
        margin-top: 40px;
      }

      /* Generic action rows kept for message pages */
      .actions {
        display: flex;
        gap: 12px;
        flex-wrap: wrap;
        align-items: center;
        margin-top: 24px;
      }

      .actions.split {
        justify-content: space-between;
      }

      /* Guest mode row, plain small text like Google sign-in */
      .guest-row {
        display: flex;
        gap: 10px;
        align-items: flex-start;
        margin-top: 28px;
        color: var(--g-grey-3);
        font-size: 14px;
        line-height: 1.5;
      }

      .guest-row svg {
        flex: none;
        margin-top: 1px;
        color: var(--g-grey-3);
      }

      .guest-row a {
        font-size: 14px;
        color: var(--g-blue);
      }

      /* Info panels used by message pages */
      .panel {
        border: 1px solid var(--g-grey-4);
        border-radius: 12px;
        padding: 16px 18px;
        margin-top: 8px;
        font-size: 14px;
        background: var(--g-grey-5);
      }

      .panel strong {
        font-weight: 500;
      }

      .panel p:last-child {
        margin-bottom: 0;
      }

      .panel.error {
        display: flex;
        gap: 12px;
        align-items: flex-start;
        border: 0;
        border-radius: 8px;
        padding: 14px 16px;
        background: var(--g-red-bg);
        color: var(--g-red);
        line-height: 1.5;
      }

      .panel + .panel,
      form + .panel,
      .panel + form {
        margin-top: 16px;
      }

      code {
        display: block;
        margin-top: 10px;
        font-family: Consolas, Monaco, monospace;
        font-size: 12px;
        white-space: pre-wrap;
        word-break: break-word;
        color: var(--g-grey-2);
        background: var(--g-grey-5);
        border-radius: 8px;
        padding: 10px 12px;
      }

      /* Account chip with avatar, like the account chooser on Google */
      .account-chip {
        display: flex;
        align-items: center;
        gap: 12px;
        margin: 4px 0 28px;
        padding: 6px 12px 6px 6px;
        border: 1px solid var(--g-grey-4);
        border-radius: 999px;
        font-size: 14px;
        width: fit-content;
        max-width: 100%;
      }

      .avatar {
        width: 32px;
        height: 32px;
        border-radius: 999px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        background: #4285f4;
        color: #ffffff;
        font-size: 15px;
        font-weight: 500;
        flex: none;
      }

      .account-chip span {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .chip-actions {
        display: flex;
        gap: 12px;
        flex-wrap: wrap;
        align-items: center;
        margin: 24px 0 0;
      }

      /* Footer, like the language/help/privacy/terms footer on accounts.google.com */
      .page-footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        flex-wrap: wrap;
        padding: 16px 32px;
        font-size: 12px;
        color: var(--footer-text);
      }

      .footer-lang {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        color: var(--footer-text);
        font-weight: 500;
      }

      .footer-lang svg {
        color: var(--footer-text);
      }

      .footer-links {
        display: flex;
        gap: 32px;
        flex-wrap: wrap;
      }

      .footer-links a {
        color: var(--footer-text);
        font-weight: 500;
      }

      @media (max-width: 640px) {
        .shell {
          align-items: stretch;
          padding: 0;
        }

        .card {
          width: 100%;
          border: 0;
          border-radius: 0;
          padding: 32px 24px;
        }

        .bottom-row .button {
          flex: 1;
        }

        .page-footer {
          justify-content: center;
          padding: 16px 24px 24px;
        }
      }

    </style>
  </head>
  <body>
    <div class="shell">
      <main class="card">
        ${renderToggleLogo({ size: 28 })}
        ${eyebrow ? `<div class="eyebrow ${eyebrowTone === 'neutral' ? 'neutral' : ''}">${escapeHtml(eyebrow)}</div>` : ''}
        <h1>${escapeHtml(heading)}</h1>
        ${description ? `<p>${description}</p>` : ''}
        ${body}
      </main>
    </div>
    ${
      showFooter
        ? `<footer class="page-footer">
      <span class="footer-lang">
        <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 100 20 10 10 0 000-20zm6.93 6h-2.95a15.7 15.7 0 00-1.38-3.56A8.03 8.03 0 0118.93 8zM12 4.04c.83 1.2 1.48 2.53 1.91 3.96h-3.82c.43-1.43 1.08-2.76 1.91-3.96zM4.26 14A7.82 7.82 0 014 12c0-1.18.09-2.12.26-2h-.26zm.81 2h2.95c.32 1.25.78 2.45 1.38 3.56A7.99 7.99 0 015.07 16zm2.95-8H5.07a7.99 7.99 0 014.33-3.56A15.7 15.7 0 008.02 8zM12 19.96A15.07 15.07 0 0110.09 16h3.82A15.07 15.07 0 0112 19.96zM14.34 14H9.66a13.8 13.8 0 010-4h4.68a13.8 13.8 0 010 4zm.26 5.56c.6-1.11 1.06-2.31 1.38-3.56h2.95a7.99 7.99 0 01-4.33 3.56zM16.36 14c.16-.64.26-1.31.26-2s-.1-1.36-.26-2h2.95c.17.63.26 1.3.26 2s-.09 1.37-.26 2h-2.95z"/></svg>
        English (United States)
        <svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M7 10l5 5 5-5z"/></svg>
      </span>
      <nav class="footer-links">
        <a href="#">Help</a>
        <a href="#">Privacy</a>
        <a href="#">Terms</a>
      </nav>
    </footer>`
        : ''
    }
  </body>
</html>`;
}

export function renderFieldError(message) {
  return `<div class="field-error" role="alert">
    <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm-1 5h2v8h-2V7zm0 10h2v2h-2v-2z"/>
    </svg>
    <span>${escapeHtml(message)}</span>
  </div>`;
}

export function renderGuestRow() {
  return `<div class="guest-row">
    <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 12a4 4 0 100-8 4 4 0 000 8zm0 2c-3.31 0-8 1.66-8 5v1h16v-1c0-3.34-4.69-5-8-5z"/>
    </svg>
    <span>Not your computer? Use Guest mode to sign in privately. <a href="#">Learn more about using Guest mode</a></span>
  </div>`;
}

export function renderAccountChip({ email, note }) {
  return `<div class="account-chip">
    <span class="avatar" aria-hidden="true">${escapeHtml(email.charAt(0).toUpperCase())}</span>
    <span><strong>${escapeHtml(email)}</strong>${note ? `<br />${escapeHtml(note)}` : ''}</span>
  </div>`;
}
