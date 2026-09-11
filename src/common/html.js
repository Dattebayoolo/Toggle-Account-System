export function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export function renderToggleLogo({ size = 36 } = {}) {
  return `<svg class="brand-logo" width="${size}" height="${size}" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Toggle logo">
    <defs>
      <filter id="logo-shadow" x="18" y="10" width="28" height="28" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
        <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="rgba(0,0,0,0.25)"/>
      </filter>
    </defs>
    <!-- Modern Google-style pill track -->
    <rect x="2" y="10" width="44" height="28" rx="14" fill="#1a73e8" class="logo-track"/>
    <!-- Knob with Google's 4 iconic colors -->
    <g filter="url(#logo-shadow)">
      <circle cx="32" cy="24" r="11" fill="#FFFFFF"/>
      <!-- Top-right: Blue -->
      <path d="M32 16a8 8 0 0 1 8 8h-8V16z" fill="#4285F4"/>
      <!-- Bottom-right: Green -->
      <path d="M40 24a8 8 0 0 1-8 8v-8h8z" fill="#34A853"/>
      <!-- Bottom-left: Yellow -->
      <path d="M32 32a8 8 0 0 1-8-8h8v8z" fill="#FBBC05"/>
      <!-- Top-left: Red -->
      <path d="M24 24a8 8 0 0 1 8-8v8h-8z" fill="#EA4335"/>
      <!-- Center white circle dot -->
      <circle cx="32" cy="24" r="3.5" fill="#FFFFFF"/>
    </g>
  </svg>`;
}

export function renderPage({
  title,
  eyebrow,
  eyebrowTone = 'neutral',
  heading,
  description,
  body,
  showFooter = true,
  singleColumn = false
}) {
  return `<!DOCTYPE html>
<html lang="en" data-theme="dark">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="theme-color" content="#131314" />
    <title>${escapeHtml(title)}</title>
    <link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 48 48'%3E%3Crect x='2' y='10' width='44' height='28' rx='14' fill='%231a73e8'/%3E%3Ccircle cx='32' cy='24' r='11' fill='white'/%3E%3Cpath d='M32 16a8 8 0 0 1 8 8h-8V16z' fill='%234285F4'/%3E%3Cpath d='M40 24a8 8 0 0 1-8 8v-8h8z' fill='%2334A853'/%3E%3Cpath d='M32 32a8 8 0 0 1-8-8h8v8z' fill='%23FBBC05'/%3E%3Cpath d='M24 24a8 8 0 0 1 8-8v8h-8z' fill='%23EA4335'/%3E%3Ccircle cx='32' cy='24' r='3.5' fill='white'/%3E%3C/svg%3E" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;500;600&family=Roboto:wght@400;500;700&display=swap" rel="stylesheet" />
    <script>
      (function() {
        try {
          var savedTheme = localStorage.getItem('toggle_theme');
          var systemDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
          var theme = savedTheme || (systemDark ? 'dark' : 'light');
          document.documentElement.setAttribute('data-theme', theme);
        } catch(e) {}
      })();
    </script>
    <style>
      :root {
        --font-google: "Google Sans", "Google Sans Text", Roboto, -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif;
        --font-body: Roboto, -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif;
      }

      /* Google Dark Theme (Default) */
      [data-theme="dark"] {
        color-scheme: dark;
        --bg: #131314;
        --card-bg: #1e1f20;
        --card-border: #3c4043;
        --card-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.4), 0 4px 8px 3px rgba(0, 0, 0, 0.15);
        
        --g-primary: #a8c7fa;
        --g-primary-hover: #8ab4f8;
        --g-on-primary: #062e6f;
        --g-primary-container: rgba(168, 199, 250, 0.12);
        
        --g-text-primary: #e3e3e3;
        --g-text-secondary: #c4c7c5;
        --g-text-tertiary: #8e918f;
        
        --g-field-border: #747775;
        --g-field-border-hover: #c4c7c5;
        --g-field-bg: #1e1f20;
        
        --g-surface-subtle: #282a2c;
        --g-surface-variant: #303134;
        --g-border-subtle: #444746;
        
        --g-error: #f28b82;
        --g-error-bg: rgba(242, 139, 130, 0.12);
        --g-error-border: rgba(242, 139, 130, 0.3);
        
        --g-state-hover: rgba(227, 227, 227, 0.08);
        --g-state-active: rgba(227, 227, 227, 0.12);
        
        --footer-text: #9aa0a6;
        --footer-hover: #e3e3e3;
      }

      /* Google Light Theme */
      [data-theme="light"] {
        color-scheme: light;
        --bg: #f0f4f9;
        --card-bg: #ffffff;
        --card-border: #dadce0;
        --card-shadow: 0 1px 2px 0 rgba(60, 64, 67, 0.3), 0 1px 3px 1px rgba(60, 64, 67, 0.15);
        
        --g-primary: #0b57d0;
        --g-primary-hover: #0842a0;
        --g-on-primary: #ffffff;
        --g-primary-container: #e8f0fe;
        
        --g-text-primary: #1f1f1f;
        --g-text-secondary: #444746;
        --g-text-tertiary: #747775;
        
        --g-field-border: #747775;
        --g-field-border-hover: #1f1f1f;
        --g-field-bg: #ffffff;
        
        --g-surface-subtle: #f8fafd;
        --g-surface-variant: #e1e3e1;
        --g-border-subtle: #e0e2e0;
        
        --g-error: #b3261e;
        --g-error-bg: #f9dedc;
        --g-error-border: #f2b8b5;
        
        --g-state-hover: rgba(31, 31, 31, 0.06);
        --g-state-active: rgba(31, 31, 31, 0.1);
        
        --footer-text: #5f6368;
        --footer-hover: #202124;
      }

      * {
        box-sizing: border-box;
      }

      body {
        margin: 0;
        min-height: 100vh;
        background: var(--bg);
        color: var(--g-text-primary);
        font-family: var(--font-body);
        display: flex;
        flex-direction: column;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        transition: background-color 0.2s ease, color 0.2s ease;
      }

      .shell {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 36px 16px;
      }

      /* Google 2024 Design: Wide split card on desktop, centered stacked on mobile */
      .card {
        width: 100%;
        max-width: ${singleColumn ? '480px' : '960px'};
        min-height: ${singleColumn ? 'auto' : '440px'};
        background: var(--card-bg);
        border: 1px solid var(--card-border);
        border-radius: 28px;
        box-shadow: var(--card-shadow);
        padding: 44px 44px 40px;
        display: grid;
        grid-template-columns: ${singleColumn ? '1fr' : 'minmax(280px, 1fr) minmax(320px, 1.25fr)'};
        gap: ${singleColumn ? '24px' : '48px'};
        transition: background-color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
        position: relative;
      }

      .card-brand-col {
        display: flex;
        flex-direction: column;
      }

      .card-brand-header {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 24px;
      }

      .brand-title {
        font-family: var(--font-google);
        font-size: 20px;
        font-weight: 500;
        color: var(--g-text-primary);
        letter-spacing: -0.2px;
      }

      .eyebrow {
        margin-bottom: 8px;
        color: var(--g-error);
        font-size: 14px;
        font-weight: 500;
        letter-spacing: 0.2px;
        text-transform: uppercase;
      }

      .eyebrow.neutral {
        color: var(--g-text-secondary);
        text-transform: none;
        letter-spacing: normal;
      }

      h1, .card-heading {
        margin: 0 0 12px;
        font-family: var(--font-google);
        font-size: 32px;
        line-height: 1.25;
        font-weight: 400;
        color: var(--g-text-primary);
        letter-spacing: -0.5px;
      }

      p, .card-desc {
        margin: 0 0 24px;
        line-height: 1.5;
        color: var(--g-text-secondary);
        font-size: 16px;
      }

      p strong, .card-desc strong {
        color: var(--g-text-primary);
        font-weight: 500;
      }

      .card-form-col {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
      }

      .card-form-col form {
        display: flex;
        flex-direction: column;
        height: 100%;
      }

      .form-content {
        flex: 1;
      }

      /* Google Material Outlined Text Field with Floating Label */
      .field {
        position: relative;
        margin-bottom: 24px;
        width: 100%;
      }

      .field input {
        width: 100%;
        height: 56px;
        padding: 16px 16px 4px;
        font-family: inherit;
        font-size: 16px;
        color: var(--g-text-primary);
        background: transparent;
        border: 1px solid var(--g-field-border);
        border-radius: 4px;
        box-sizing: border-box;
        transition: border-color 0.15s ease, box-shadow 0.15s ease;
        outline: none;
      }

      .field.has-toggle input {
        padding-right: 48px;
      }

      .field input:hover {
        border-color: var(--g-field-border-hover);
      }

      .field input:focus {
        border-color: var(--g-primary);
        box-shadow: 0 0 0 1px var(--g-primary);
      }

      .field label {
        position: absolute;
        left: 14px;
        top: 18px;
        color: var(--g-text-secondary);
        font-size: 16px;
        pointer-events: none;
        transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
        background: var(--card-bg);
        padding: 0 5px;
        border-radius: 2px;
        line-height: 1;
        max-width: calc(100% - 28px);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      /* When focused or populated: float label to notch */
      .field input:focus + label,
      .field input:not(:placeholder-shown) + label,
      .field.is-filled label {
        top: -7px;
        left: 11px;
        font-size: 12px;
        font-weight: 500;
        letter-spacing: 0.15px;
        color: var(--g-primary);
      }

      .field input:not(:focus):not(:placeholder-shown) + label,
      .field.is-filled:not(:focus-within) label {
        color: var(--g-text-secondary);
      }

      /* Invalid/Error state */
      .field[aria-invalid="true"] input,
      .field input[aria-invalid="true"],
      .field.is-invalid input {
        border-color: var(--g-error) !important;
        box-shadow: 0 0 0 1px var(--g-error) !important;
      }

      .field[aria-invalid="true"] label,
      .field input[aria-invalid="true"] + label,
      .field.is-invalid label {
        color: var(--g-error) !important;
      }

      /* Password toggle eye icon inside field - fixed 10px from top, transform:none */
      button.field-pwd-toggle,
      .field-pwd-toggle {
        position: absolute !important;
        right: 10px !important;
        top: 10px !important;
        bottom: auto !important;
        left: auto !important;
        transform: none !important;
        -webkit-transform: none !important;
        width: 36px !important;
        height: 36px !important;
        min-width: 36px !important;
        max-width: 36px !important;
        border: 0 !important;
        background: transparent !important;
        color: var(--g-text-secondary) !important;
        border-radius: 50% !important;
        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;
        cursor: pointer !important;
        padding: 0 !important;
        margin: 0 !important;
        box-shadow: none !important;
        transition: none !important;
        animation: none !important;
      }

      button.field-pwd-toggle:hover,
      .field-pwd-toggle:hover {
        background: var(--g-state-hover) !important;
        color: var(--g-text-primary) !important;
        transform: none !important;
        -webkit-transform: none !important;
        box-shadow: none !important;
        transition: none !important;
      }

      button.field-pwd-toggle:active,
      .field-pwd-toggle:active {
        background: var(--g-state-active) !important;
        color: var(--g-primary) !important;
        transform: none !important;
        -webkit-transform: none !important;
        box-shadow: none !important;
        transition: none !important;
      }

      button.field-pwd-toggle:focus,
      button.field-pwd-toggle:focus-visible,
      .field-pwd-toggle:focus,
      .field-pwd-toggle:focus-visible {
        outline: none !important;
        background: var(--g-state-active) !important;
        color: var(--g-primary) !important;
        box-shadow: none !important;
        transform: none !important;
        -webkit-transform: none !important;
        transition: none !important;
      }

      .field-pwd-toggle svg {
        width: 20px !important;
        height: 20px !important;
        pointer-events: none !important;
        margin: 0 !important;
        padding: 0 !important;
        transform: none !important;
        -webkit-transform: none !important;
        transition: none !important;
      }

      .field-pwd-toggle .eye-open {
        display: block !important;
      }

      .field-pwd-toggle .eye-closed {
        display: none !important;
      }

      .field-pwd-toggle.is-showing .eye-open {
        display: none !important;
      }

      .field-pwd-toggle.is-showing .eye-closed {
        display: block !important;
      }

      /* Google Material Outlined Select dropdown */
      .field select {
        width: 100%;
        height: 56px;
        padding: 0 40px 0 16px;
        font-family: inherit;
        font-size: 16px;
        color: var(--g-text-primary);
        background-color: var(--card-bg);
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='%23747775'%3E%3Cpath d='M7 10l5 5 5-5z'/%3E%3C/svg%3E");
        background-repeat: no-repeat;
        background-position: right 12px center;
        border: 1px solid var(--g-field-border);
        border-radius: 4px;
        appearance: none;
        -webkit-appearance: none;
        cursor: pointer;
        transition: border-color 0.15s ease, box-shadow 0.15s ease;
        outline: none;
      }

      .field select:hover {
        border-color: var(--g-field-border-hover);
      }

      .field select:focus {
        border-color: var(--g-primary);
        box-shadow: 0 0 0 1px var(--g-primary);
      }

      .field.select-wrap label {
        top: -7px;
        left: 11px;
        font-size: 12px;
        font-weight: 500;
        letter-spacing: 0.15px;
        color: var(--g-text-secondary);
      }

      .field.select-wrap select:focus + label {
        color: var(--g-primary);
      }

      /* Inline error message */
      .field-error {
        display: flex;
        gap: 10px;
        align-items: flex-start;
        margin: -14px 0 20px;
        padding: 0 4px;
        color: var(--g-error);
        font-size: 13px;
        line-height: 1.4;
        animation: errorSlide 0.2s cubic-bezier(0, 0, 0.2, 1);
      }

      @keyframes errorSlide {
        from { opacity: 0; transform: translateY(-4px); }
        to { opacity: 1; transform: translateY(0); }
      }

      .field-error svg {
        flex: none;
        margin-top: 1px;
      }

      /* Google Material Buttons */
      button:not(.field-pwd-toggle):not(.theme-toggle-btn),
      .button {
        display: inline-flex;
        justify-content: center;
        align-items: center;
        border: 0;
        border-radius: 100px;
        background: var(--g-primary);
        color: var(--g-on-primary);
        font-family: var(--font-google);
        font-size: 14px;
        font-weight: 500;
        letter-spacing: 0.25px;
        text-decoration: none;
        padding: 0 24px;
        height: 40px;
        min-width: 84px;
        cursor: pointer;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.3), 0 1px 3px 1px rgba(0, 0, 0, 0.15);
        transition: background-color 0.2s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.2s cubic-bezier(0.4, 0, 0.2, 1), transform 0.1s ease;
      }

      button:not(.field-pwd-toggle):not(.theme-toggle-btn):hover,
      .button:hover {
        background: var(--g-primary-hover);
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3), 0 3px 6px 2px rgba(0, 0, 0, 0.15);
        transform: translateY(-0.5px);
        text-decoration: none;
      }

      button:not(.field-pwd-toggle):not(.theme-toggle-btn):active,
      .button:active {
        transform: translateY(0);
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
      }

      button:not(.field-pwd-toggle):not(.theme-toggle-btn):focus-visible,
      .button:focus-visible {
        outline: none;
        box-shadow: 0 0 0 2px var(--bg), 0 0 0 4px var(--g-primary);
      }

      /* Secondary / Outlined or Ghost Button */
      .button.secondary,
      button.secondary,
      button[data-back] {
        background: transparent;
        color: var(--g-primary);
        border: 1px solid var(--g-border-subtle);
        box-shadow: none;
      }

      .button.secondary:hover,
      button.secondary:hover,
      button[data-back]:hover {
        background: var(--g-state-hover);
        border-color: var(--g-field-border-hover);
        color: var(--g-primary-hover);
        box-shadow: none;
        transform: none;
      }

      /* Text link styled like Google text button */
      .text-link {
        display: inline-flex;
        align-items: center;
        color: var(--g-primary);
        font-family: var(--font-google);
        font-size: 14px;
        font-weight: 500;
        letter-spacing: 0.25px;
        text-decoration: none;
        padding: 8px 12px;
        margin: -8px -12px;
        border-radius: 100px;
        cursor: pointer;
        transition: background-color 0.15s ease;
      }

      .text-link:hover {
        background: var(--g-state-hover);
        text-decoration: none;
        color: var(--g-primary-hover);
      }

      /* "Forgot email?" row */
      .field-foot {
        margin: 4px 0 0;
      }

      .hint {
        margin: 6px 0 0;
        font-size: 13px;
        color: var(--g-text-secondary);
        line-height: 1.4;
      }

      /* Google Stepper / Progress Bar */
      .signup-progress {
        display: flex;
        align-items: center;
        gap: 8px;
        margin: 0 0 24px;
      }

      .progress-bar-track {
        flex: 1;
        height: 4px;
        background: var(--g-surface-subtle);
        border-radius: 2px;
        overflow: hidden;
      }

      .progress-bar-fill {
        height: 100%;
        background: var(--g-primary);
        border-radius: 2px;
        transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }

      .progress-step-text {
        font-size: 12px;
        font-weight: 500;
        color: var(--g-text-tertiary);
        white-space: nowrap;
      }

      /* Multi-step sign-up wizard */
      .signup-step[hidden] {
        display: none !important;
      }

      .row-2 {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
      }

      .row-3 {
        display: grid;
        grid-template-columns: 2fr 1fr 1fr;
        gap: 12px;
      }

      @media (max-width: 480px) {
        .row-2, .row-3 {
          grid-template-columns: 1fr;
        }
      }

      /* Email selection radio cards */
      .chip-row {
        display: flex;
        flex-direction: column;
        gap: 10px;
        margin: 0 0 16px;
      }

      .chip {
        border: 1px solid var(--g-field-border);
        border-radius: 8px;
        background: var(--card-bg);
        color: var(--g-text-primary);
        min-height: 48px;
        padding: 12px 16px;
        font-size: 15px;
        font-family: inherit;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: flex-start;
        text-align: left;
        box-shadow: none;
        transition: all 0.15s ease;
        position: relative;
      }

      .chip::before {
        content: '';
        width: 18px;
        height: 18px;
        border-radius: 50%;
        border: 2px solid var(--g-field-border);
        margin-right: 14px;
        flex: none;
        transition: all 0.15s ease;
        box-sizing: border-box;
      }

      .chip:hover {
        background: var(--g-state-hover);
        border-color: var(--g-field-border-hover);
        transform: none;
        box-shadow: none;
      }

      .chip.selected {
        border-color: var(--g-primary);
        background: var(--g-primary-container);
        color: var(--g-text-primary);
        font-weight: 500;
      }

      .chip.selected::before {
        border-color: var(--g-primary);
        background: radial-gradient(circle, var(--g-primary) 40%, transparent 45%);
      }

      /* Material Checkbox */
      .checkbox-row {
        display: flex;
        align-items: center;
        gap: 12px;
        margin: 18px 0 0;
        font-size: 14px;
        color: var(--g-text-secondary);
        cursor: pointer;
        user-select: none;
      }

      .checkbox-row input[type="checkbox"] {
        width: 18px;
        height: 18px;
        border-radius: 3px;
        accent-color: var(--g-primary);
        cursor: pointer;
      }

      /* Review List */
      .review-list {
        border: 1px solid var(--g-border-subtle);
        border-radius: 16px;
        padding: 8px 18px;
        margin: 12px 0 0;
        background: var(--g-surface-subtle);
      }

      .review-item {
        display: flex;
        justify-content: space-between;
        gap: 16px;
        padding: 14px 0;
        border-bottom: 1px solid var(--g-border-subtle);
        font-size: 14px;
      }

      .review-item:last-child {
        border-bottom: 0;
      }

      .review-item .review-label {
        color: var(--g-text-secondary);
        flex: none;
      }

      .review-item .review-value {
        text-align: right;
        font-weight: 500;
        color: var(--g-text-primary);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .terms-box {
        margin: 16px 0 0;
        padding: 14px 16px;
        border: 1px solid var(--g-border-subtle);
        border-radius: 12px;
        font-size: 13px;
        line-height: 1.5;
        color: var(--g-text-secondary);
        background: var(--g-surface-subtle);
      }

      .terms-box a {
        color: var(--g-primary);
        text-decoration: none;
      }

      .terms-box a:hover {
        text-decoration: underline;
      }

      /* Bottom row: Clean action buttons */
      .bottom-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        flex-wrap: wrap;
        margin-top: 36px;
        padding-top: 4px;
      }

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

      /* Guest Mode Note */
      .guest-row {
        display: flex;
        gap: 12px;
        align-items: flex-start;
        margin-top: 28px;
        color: var(--g-text-secondary);
        font-size: 14px;
        line-height: 1.45;
      }

      .guest-row svg {
        flex: none;
        margin-top: 2px;
        color: var(--g-text-tertiary);
      }

      .guest-row a {
        font-size: 14px;
        color: var(--g-primary);
        text-decoration: none;
        font-weight: 500;
      }

      .guest-row a:hover {
        text-decoration: underline;
      }

      /* Info / message panels */
      .panel {
        border: 1px solid var(--g-border-subtle);
        border-radius: 16px;
        padding: 18px 20px;
        margin-top: 12px;
        font-size: 14px;
        background: var(--g-surface-subtle);
        line-height: 1.5;
      }

      .panel strong {
        display: block;
        margin-bottom: 6px;
        font-family: var(--font-google);
        font-size: 15px;
        color: var(--g-text-primary);
      }

      .panel p:last-child {
        margin-bottom: 0;
      }

      .panel.error {
        display: flex;
        gap: 12px;
        align-items: flex-start;
        border: 1px solid var(--g-error-border);
        border-radius: 12px;
        padding: 14px 16px;
        background: var(--g-error-bg);
        color: var(--g-error);
      }

      .panel + .panel,
      form + .panel,
      .panel + form {
        margin-top: 16px;
      }

      code {
        display: block;
        margin-top: 10px;
        font-family: "Roboto Mono", Consolas, Monaco, monospace;
        font-size: 12px;
        white-space: pre-wrap;
        word-break: break-word;
        color: var(--g-text-secondary);
        background: var(--g-surface-variant);
        border-radius: 8px;
        padding: 10px 14px;
      }

      /* Account Chip (Google style user switcher pill) */
      .account-chip {
        display: inline-flex;
        align-items: center;
        gap: 10px;
        margin: 4px 0 24px;
        padding: 5px 14px 5px 5px;
        border: 1px solid var(--g-border-subtle);
        border-radius: 999px;
        font-size: 14px;
        width: fit-content;
        max-width: 100%;
        background: var(--card-bg);
        transition: background 0.15s ease, border-color 0.15s ease;
      }

      .account-chip:hover {
        background: var(--g-state-hover);
        border-color: var(--g-field-border-hover);
      }

      .avatar {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        background: #1a73e8;
        color: #ffffff;
        font-family: var(--font-google);
        font-size: 15px;
        font-weight: 500;
        flex: none;
      }

      .account-chip span {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        color: var(--g-text-primary);
      }

      .chip-actions {
        display: flex;
        gap: 12px;
        flex-wrap: wrap;
        align-items: center;
        margin: 24px 0 0;
      }

      /* App Grid on Dashboard */
      .app-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
        margin-top: 16px;
      }

      .app-card {
        border: 1px solid var(--g-border-subtle);
        border-radius: 16px;
        padding: 20px;
        background: var(--g-surface-subtle);
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        transition: transform 0.15s ease, border-color 0.15s ease;
      }

      .app-card:hover {
        border-color: var(--g-primary);
        transform: translateY(-1px);
      }

      .app-icon {
        width: 40px;
        height: 40px;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 12px;
      }

      /* Footer */
      .page-footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        flex-wrap: wrap;
        padding: 20px 48px;
        font-size: 12px;
        color: var(--footer-text);
        max-width: 1060px;
        width: 100%;
        margin: 0 auto;
      }

      .footer-left {
        display: flex;
        align-items: center;
        gap: 16px;
      }

      .footer-lang {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        color: var(--footer-text);
        font-weight: 500;
        cursor: pointer;
        padding: 4px 8px;
        border-radius: 4px;
        transition: background 0.15s ease;
      }

      .footer-lang:hover {
        background: var(--g-state-hover);
        color: var(--footer-hover);
      }

      .footer-lang svg {
        color: var(--footer-text);
      }

      .footer-links {
        display: flex;
        gap: 24px;
        flex-wrap: wrap;
      }

      .footer-links a {
        color: var(--footer-text);
        font-weight: 500;
        text-decoration: none;
        padding: 4px 8px;
        border-radius: 4px;
        transition: background 0.15s ease, color 0.15s ease;
      }

      .footer-links a:hover {
        background: var(--g-state-hover);
        color: var(--footer-hover);
      }

      /* Theme toggle button in footer */
      .theme-toggle-btn {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        background: transparent;
        border: 1px solid var(--g-border-subtle);
        border-radius: 999px;
        color: var(--footer-text);
        height: 28px;
        min-width: unset;
        padding: 0 10px;
        font-size: 11px;
        font-weight: 500;
        box-shadow: none;
        cursor: pointer;
        transition: all 0.15s ease;
      }

      .theme-toggle-btn:hover {
        background: var(--g-state-hover);
        color: var(--footer-hover);
        border-color: var(--g-field-border-hover);
        box-shadow: none;
        transform: none;
      }

      [data-theme="dark"] .theme-toggle-btn .sun-icon { display: block; }
      [data-theme="dark"] .theme-toggle-btn .moon-icon { display: none; }
      [data-theme="light"] .theme-toggle-btn .sun-icon { display: none; }
      [data-theme="light"] .theme-toggle-btn .moon-icon { display: block; }

      /* Responsive rules */
      @media (max-width: 767px) {
        .shell {
          padding: 16px 12px;
          align-items: center;
        }

        .card {
          grid-template-columns: 1fr;
          gap: 20px;
          padding: 32px 24px 28px;
          border-radius: 24px;
          max-width: 448px;
        }

        .card-brand-col {
          margin-bottom: 4px;
        }

        h1, .card-heading {
          font-size: 26px;
        }

        .bottom-row {
          margin-top: 28px;
        }

        .bottom-row .button,
        .bottom-row button {
          flex: 1;
        }

        .app-grid {
          grid-template-columns: 1fr;
        }

        .page-footer {
          justify-content: center;
          padding: 16px 20px 28px;
        }
      }

      @media (max-width: 480px) {
        .card {
          border: 0;
          border-radius: 0;
          box-shadow: none;
          background: transparent;
          padding: 20px 8px;
        }
        
        .page-footer {
          flex-direction: column;
          gap: 12px;
        }
      }
    </style>
  </head>
  <body>
    <div class="shell">
      <main class="card">
        <div class="card-brand-col">
          <div class="card-brand-header">
            ${renderToggleLogo({ size: 36 })}
            <span class="brand-title">Toggle</span>
          </div>
          ${eyebrow ? `<div class="eyebrow ${eyebrowTone === 'neutral' ? 'neutral' : ''}">${escapeHtml(eyebrow)}</div>` : ''}
          <h1 class="card-heading">${escapeHtml(heading)}</h1>
          ${description ? `<p class="card-desc">${description}</p>` : ''}
        </div>
        <div class="card-form-col">
          ${body}
        </div>
      </main>
    </div>
    ${
      showFooter
        ? `<footer class="page-footer">
      <div class="footer-left">
        <span class="footer-lang">
          <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 100 20 10 10 0 000-20zm6.93 6h-2.95a15.7 15.7 0 00-1.38-3.56A8.03 8.03 0 0118.93 8zM12 4.04c.83 1.2 1.48 2.53 1.91 3.96h-3.82c.43-1.43 1.08-2.76 1.91-3.96zM4.26 14A7.82 7.82 0 014 12c0-1.18.09-2.12.26-2h-.26zm.81 2h2.95c.32 1.25.78 2.45 1.38 3.56A7.99 7.99 0 015.07 16zm2.95-8H5.07a7.99 7.99 0 014.33-3.56A15.7 15.7 0 008.02 8zM12 19.96A15.07 15.07 0 0110.09 16h3.82A15.07 15.07 0 0112 19.96zM14.34 14H9.66a13.8 13.8 0 010-4h4.68a13.8 13.8 0 010 4zm.26 5.56c.6-1.11 1.06-2.31 1.38-3.56h2.95a7.99 7.99 0 01-4.33 3.56zM16.36 14c.16-.64.26-1.31.26-2s-.1-1.36-.26-2h2.95c.17.63.26 1.3.26 2s-.09 1.37-.26 2h-2.95z"/></svg>
          English (United States)
          <svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M7 10l5 5 5-5z"/></svg>
        </span>
        <button type="button" class="theme-toggle-btn" id="theme-toggle" title="Toggle theme">
          <svg class="sun-icon" aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58a.996.996 0 00-1.41 0 .996.996 0 000 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37a.996.996 0 00-1.41 0 .996.996 0 000 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41l-1.06-1.06zm1.06-10.96a.996.996 0 000-1.41.996.996 0 00-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.36l-1.06 1.06a.996.996 0 000 1.41c.39.39 1.03.39 1.41 0l1.06-1.06c.39-.39.39-1.03 0-1.41s-1.02-.39-1.41 0z"/></svg>
          <svg class="moon-icon" aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9c.83 0 1.5-.67 1.5-1.5 0-.39-.15-.74-.39-1.01-.23-.26-.38-.61-.38-.99 0-.83.67-1.5 1.5-1.5H16c2.76 0 5-2.24 5-5 0-4.42-4.03-8-9-8z"/></svg>
          <span class="theme-text">Theme</span>
        </button>
      </div>
      <nav class="footer-links">
        <a href="#">Help</a>
        <a href="#">Privacy</a>
        <a href="#">Terms</a>
      </nav>
    </footer>`
        : ''
    }
    <script>
      (function() {
        // Theme switcher listener
        var themeBtn = document.getElementById('theme-toggle');
        if (themeBtn) {
          themeBtn.addEventListener('click', function() {
            var current = document.documentElement.getAttribute('data-theme') || 'dark';
            var next = current === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', next);
            try { localStorage.setItem('toggle_theme', next); } catch(e) {}
          });
        }

        // Global password toggle handler
        document.addEventListener('click', function(e) {
          var btn = e.target.closest('.field-pwd-toggle');
          if (!btn) return;
          e.preventDefault();
          var field = btn.closest('.field');
          if (!field) return;
          var input = field.querySelector('input');
          if (!input) return;
          var isPwd = input.type === 'password';
          input.type = isPwd ? 'text' : 'password';
          btn.classList.toggle('is-showing', isPwd);
          btn.setAttribute('aria-label', isPwd ? 'Hide password' : 'Show password');
        });

        // Ensure labels stay floated if autofilled or filled
        function updatePopulated(inp) {
          var field = inp.closest('.field');
          if (field) {
            field.classList.toggle('is-filled', Boolean(inp.value));
          }
        }
        document.querySelectorAll('.field input').forEach(function(inp) {
          updatePopulated(inp);
          inp.addEventListener('input', function() { updatePopulated(inp); });
          inp.addEventListener('change', function() { updatePopulated(inp); });
        });
      })();
    </script>
  </body>
</html>`;
}

export function renderFieldError(message) {
  return `<div class="field-error" role="alert">
    <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
    </svg>
    <span>${escapeHtml(message)}</span>
  </div>`;
}

export function renderGuestRow() {
  return `<div class="guest-row">
    <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
    </svg>
    <span>Not your computer? Use Guest mode to sign in privately. <a href="#">Learn more</a></span>
  </div>`;
}

export function renderAccountChip({ email, note }) {
  const initial = email ? email.charAt(0).toUpperCase() : 'T';
  return `<div class="account-chip">
    <span class="avatar" aria-hidden="true">${escapeHtml(initial)}</span>
    <span><strong>${escapeHtml(email)}</strong>${note ? `<br /><span style="font-size: 12px; color: var(--g-text-secondary);">${escapeHtml(note)}</span>` : ''}</span>
  </div>`;
}

function formatHubDate(value) {
  if (!value) return 'Not set';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Not set';
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
}

function formatHubGender(value) {
  const map = {
    female: 'Female',
    male: 'Male',
    'rather-not-say': 'Rather not say',
    custom: 'Custom'
  };
  return value ? (map[value] || value) : 'Not set';
}

export function renderGoogleAccountHub({ account }) {
  const firstName = account.first_name || '';
  const displayName = firstName || account.email;
  const fullName = [account.first_name, account.last_name].filter(Boolean).join(' ') || account.email;
  const initial = (firstName || account.email).charAt(0).toUpperCase();
  const email = account.email;
  const birthday = formatHubDate(account.date_of_birth);
  const gender = formatHubGender(account.gender);
  const memberSince = formatHubDate(account.created_at);
  const lastLogin = formatHubDate(account.last_login_at);
  const pwdChanged = formatHubDate(account.password_changed_at || account.created_at);

  return `<!DOCTYPE html>
<html lang="en" data-theme="dark">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="theme-color" content="#131314" />
    <title>Toggle Account</title>
    <link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 48 48'%3E%3Crect x='2' y='10' width='44' height='28' rx='14' fill='%231a73e8'/%3E%3Ccircle cx='32' cy='24' r='11' fill='white'/%3E%3Cpath d='M32 16a8 8 0 0 1 8 8h-8V16z' fill='%234285F4'/%3E%3Cpath d='M40 24a8 8 0 0 1-8 8v-8h8z' fill='%2334A853'/%3E%3Cpath d='M32 32a8 8 0 0 1-8-8h8v8z' fill='%23FBBC05'/%3E%3Cpath d='M24 24a8 8 0 0 1 8-8v8h-8z' fill='%23EA4335'/%3E%3Ccircle cx='32' cy='24' r='3.5' fill='white'/%3E%3C/svg%3E" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;500;600&family=Roboto:wght@400;500;700&display=swap" rel="stylesheet" />
    <script>
      (function() {
        try {
          var savedTheme = localStorage.getItem('toggle_theme');
          var systemDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
          var theme = savedTheme || (systemDark ? 'dark' : 'light');
          document.documentElement.setAttribute('data-theme', theme);
        } catch(e) {}
      })();
    </script>
    <style>
      :root {
        --font-google: "Google Sans", "Google Sans Text", Roboto, -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif;
        --font-body: Roboto, -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif;
      }

      [data-theme="dark"] {
        color-scheme: dark;
        --bg: #131314;
        --card-bg: #1e1f20;
        --card-border: #3c4043;
        --card-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.4);
        --header-bg: #1e1f20;
        --sidebar-bg: #131314;
        --g-primary: #a8c7fa;
        --g-primary-hover: #8ab4f8;
        --g-on-primary: #062e6f;
        --g-primary-container: rgba(168, 199, 250, 0.16);
        --g-text-primary: #e3e3e3;
        --g-text-secondary: #c4c7c5;
        --g-text-tertiary: #8e918f;
        --g-border-subtle: #3c4043;
        --g-surface-subtle: #282a2c;
        --g-surface-hover: #303134;
        --g-state-hover: rgba(227, 227, 227, 0.08);
        --g-green: #81c995;
        --g-green-bg: rgba(129, 201, 149, 0.15);
      }

      [data-theme="light"] {
        color-scheme: light;
        --bg: #f8fafd;
        --card-bg: #ffffff;
        --card-border: #dadce0;
        --card-shadow: 0 1px 2px 0 rgba(60, 64, 67, 0.3);
        --header-bg: #ffffff;
        --sidebar-bg: #f8fafd;
        --g-primary: #0b57d0;
        --g-primary-hover: #0842a0;
        --g-on-primary: #ffffff;
        --g-primary-container: #e8f0fe;
        --g-text-primary: #1f1f1f;
        --g-text-secondary: #444746;
        --g-text-tertiary: #747775;
        --g-border-subtle: #e0e2e0;
        --g-surface-subtle: #f0f4f9;
        --g-surface-hover: #e1e3e1;
        --g-state-hover: rgba(31, 31, 31, 0.06);
        --g-green: #188038;
        --g-green-bg: #e6f4ea;
      }

      * { box-sizing: border-box; }
      body {
        margin: 0;
        min-height: 100vh;
        background: var(--bg);
        color: var(--g-text-primary);
        font-family: var(--font-body);
        -webkit-font-smoothing: antialiased;
      }

      /* ===================== TOP HEADER ===================== */
      .hub-header {
        position: sticky;
        top: 0;
        z-index: 100;
        background: var(--header-bg);
        border-bottom: 1px solid var(--g-border-subtle);
        height: 64px;
        padding: 0 16px 0 8px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
      }

      .hub-header-left {
        display: flex;
        align-items: center;
        gap: 4px;
        flex: none;
      }

      /* Hamburger button in header */
      .hamburger-btn {
        width: 48px;
        height: 48px;
        border-radius: 50%;
        border: 0;
        background: transparent;
        color: var(--g-text-secondary);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        flex-shrink: 0;
        transition: background-color 0.15s;
      }
      .hamburger-btn:hover {
        background: var(--g-state-hover);
        color: var(--g-text-primary);
      }

      .hub-brand {
        display: flex;
        align-items: center;
        gap: 10px;
        text-decoration: none;
        color: inherit;
        flex: none;
        padding: 0 8px;
      }

      .hub-brand-title {
        font-family: var(--font-google);
        font-size: 20px;
        font-weight: 500;
        color: var(--g-text-primary);
        display: flex;
        align-items: center;
        gap: 6px;
        white-space: nowrap;
      }

      .hub-brand-sub {
        font-size: 18px;
        font-weight: 400;
        color: var(--g-text-secondary);
      }

      .hub-search-wrap {
        flex: 1;
        max-width: 600px;
        position: relative;
      }

      .hub-search {
        width: 100%;
        height: 44px;
        background: var(--g-surface-subtle);
        border: 1px solid transparent;
        border-radius: 24px;
        padding: 0 20px 0 46px;
        font-family: inherit;
        font-size: 15px;
        color: var(--g-text-primary);
        outline: none;
        transition: background-color 0.15s, border-color 0.15s, box-shadow 0.15s;
      }

      .hub-search:focus {
        background: var(--card-bg);
        border-color: var(--g-primary);
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
      }

      .hub-search-icon {
        position: absolute;
        left: 16px;
        top: 50%;
        transform: translateY(-50%);
        color: var(--g-text-tertiary);
        pointer-events: none;
      }

      .hub-header-actions {
        display: flex;
        align-items: center;
        gap: 4px;
        flex: none;
      }

      .icon-btn {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        border: 0;
        background: transparent;
        color: var(--g-text-secondary);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: background-color 0.15s;
        position: relative;
      }

      .icon-btn:hover {
        background: var(--g-state-hover);
        color: var(--g-text-primary);
      }

      .hub-avatar-btn {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        background: #1a73e8;
        color: #fff;
        font-family: var(--font-google);
        font-size: 16px;
        font-weight: 500;
        border: 0;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        transition: box-shadow 0.15s;
      }

      .hub-avatar-btn:hover {
        box-shadow: 0 0 0 3px var(--g-primary-container);
      }

      /* ===================== APP LAUNCHER ===================== */
      .apps-menu {
        position: absolute;
        top: 56px;
        right: 48px;
        width: 320px;
        background: var(--card-bg);
        border: 1px solid var(--g-border-subtle);
        border-radius: 20px;
        box-shadow: 0 8px 24px rgba(0,0,0,0.3);
        padding: 16px;
        display: none;
        z-index: 200;
      }

      .apps-menu.open { display: block; }

      .apps-menu-title {
        font-size: 13px;
        font-weight: 500;
        color: var(--g-text-secondary);
        margin: 0 0 12px 8px;
      }

      .apps-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
      }

      .app-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 14px 8px;
        border-radius: 12px;
        text-decoration: none;
        color: var(--g-text-primary);
        transition: background 0.15s;
      }

      .app-item:hover { background: var(--g-state-hover); }

      .app-item-icon {
        width: 44px;
        height: 44px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 8px;
      }

      .app-item-name { font-size: 13px; font-weight: 500; }

      /* ===================== PROFILE POPUP ===================== */
      .profile-menu {
        position: absolute;
        top: 56px;
        right: 16px;
        width: 300px;
        background: var(--card-bg);
        border: 1px solid var(--g-border-subtle);
        border-radius: 20px;
        box-shadow: 0 8px 24px rgba(0,0,0,0.3);
        padding: 24px 20px;
        display: none;
        z-index: 200;
        text-align: center;
      }

      .profile-menu.open { display: block; }

      .profile-menu-avatar {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background: #1a73e8;
        color: #fff;
        font-family: var(--font-google);
        font-size: 24px;
        font-weight: 500;
        margin: 0 auto 12px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .profile-menu-name { font-size: 16px; font-weight: 500; margin-bottom: 4px; }
      .profile-menu-email { font-size: 13px; color: var(--g-text-secondary); margin-bottom: 16px; word-break: break-all; }

      /* ===================== LAYOUT ===================== */
      .hub-layout {
        display: flex;
        min-height: calc(100vh - 64px);
      }

      /* ===================== SIDEBAR / NAV DRAWER ===================== */
      .hub-sidebar {
        width: 280px;
        flex: none;
        position: sticky;
        top: 64px;
        height: calc(100vh - 64px);
        overflow-y: auto;
        overflow-x: hidden;
        background: var(--sidebar-bg);
        border-right: 1px solid var(--g-border-subtle);
        padding: 8px 0 24px;
        display: flex;
        flex-direction: column;
        transition: width 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        scrollbar-width: thin;
        scrollbar-color: var(--g-border-subtle) transparent;
      }

      /* Collapsed sidebar — icon-only rail */
      .hub-sidebar.collapsed {
        width: 72px;
      }

      /* Nav section grouping */
      .nav-section {
        display: flex;
        flex-direction: column;
        padding: 2px 0;
      }

      /* Section label */
      .nav-section-label {
        font-family: var(--font-google);
        font-size: 11px;
        font-weight: 600;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: var(--g-text-tertiary);
        padding: 10px 28px 2px;
        white-space: nowrap;
        overflow: hidden;
        max-height: 32px;
        transition: max-height 0.2s, opacity 0.2s, padding 0.2s;
        opacity: 1;
      }

      .hub-sidebar.collapsed .nav-section-label {
        max-height: 0;
        opacity: 0;
        padding-top: 0;
        padding-bottom: 0;
        pointer-events: none;
      }

      /* Thin divider line */
      .nav-section-divider {
        height: 1px;
        background: var(--g-border-subtle);
        margin: 6px 16px 6px 28px;
        transition: margin 0.25s;
      }

      .hub-sidebar.collapsed .nav-section-divider {
        margin: 6px 12px;
      }

      /* ---- Individual nav item ---- */
      .nav-link {
        position: relative;
        display: flex;
        align-items: center;
        gap: 16px;
        height: 48px;
        padding: 0 16px;
        margin: 1px 8px 1px 0;
        border-radius: 0 24px 24px 0;
        color: var(--g-text-secondary);
        text-decoration: none;
        font-family: var(--font-google);
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: background 0.15s, color 0.15s;
        border: 0;
        background: transparent;
        width: calc(100% - 8px);
        text-align: left;
        white-space: nowrap;
        overflow: hidden;
      }

      /* Collapsed nav-link: centered 56×56 icon-pill */
      .hub-sidebar.collapsed .nav-link {
        width: 56px;
        height: 56px;
        margin: 2px auto;
        border-radius: 16px;
        padding: 0;
        justify-content: center;
        gap: 0;
        overflow: visible;
      }

      .nav-link:hover {
        background: var(--g-state-hover);
        color: var(--g-text-primary);
      }

      .nav-link.active {
        background: var(--g-primary-container);
        color: var(--g-primary);
        font-weight: 600;
      }

      /* Expanded: left-edge active pill indicator */
      .nav-link.active::before {
        content: '';
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
        width: 4px;
        height: 28px;
        border-radius: 0 4px 4px 0;
        background: var(--g-primary);
      }

      /* Collapsed: no left bar — the rounded background is the indicator */
      .hub-sidebar.collapsed .nav-link.active::before {
        display: none;
      }

      .nav-link svg { flex: none; }

      /* Nav label text */
      .nav-label {
        flex: 1;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        transition: opacity 0.15s, max-width 0.25s;
        max-width: 200px;
        opacity: 1;
      }

      .hub-sidebar.collapsed .nav-label {
        max-width: 0;
        opacity: 0;
        pointer-events: none;
        overflow: hidden;
      }

      /* Tooltip for collapsed mode */
      .hub-sidebar.collapsed .nav-link[title]:hover::after {
        content: attr(title);
        position: fixed;
        left: 80px;
        background: var(--card-bg);
        border: 1px solid var(--g-border-subtle);
        color: var(--g-text-primary);
        font-size: 12px;
        font-weight: 500;
        padding: 5px 10px;
        border-radius: 6px;
        white-space: nowrap;
        box-shadow: 0 4px 12px rgba(0,0,0,0.25);
        z-index: 9999;
        pointer-events: none;
        transform: translateY(-50%);
        margin-top: 28px;
      }

      .tab-pane { display: none; }
      .tab-pane.active { display: block; animation: fadeIn 0.2s ease; }

      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(4px); }
        to { opacity: 1; transform: translateY(0); }
      }

      /* Hero Welcome Banner */
      .hero-banner {
        text-align: center;
        padding: 12px 0 32px;
      }

      .hero-avatar-wrap {
        position: relative;
        width: 76px;
        height: 76px;
        margin: 0 auto 16px;
      }

      .hero-avatar {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        background: #1a73e8;
        color: #fff;
        font-family: var(--font-google);
        font-size: 32px;
        font-weight: 500;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
      }

      .hero-camera-badge {
        position: absolute;
        bottom: -2px;
        right: -2px;
        width: 26px;
        height: 26px;
        border-radius: 50%;
        background: var(--card-bg);
        border: 1px solid var(--g-border-subtle);
        color: var(--g-text-secondary);
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .hero-title {
        font-family: var(--font-google);
        font-size: 28px;
        font-weight: 400;
        margin: 0 0 8px;
        color: var(--g-text-primary);
        letter-spacing: -0.5px;
      }

      .hero-desc {
        font-size: 15px;
        color: var(--g-text-secondary);
        margin: 0 auto;
        max-width: 520px;
        line-height: 1.5;
      }

      /* Security Banner Card */
      .status-banner {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        padding: 16px 20px;
        background: var(--card-bg);
        border: 1px solid var(--g-border-subtle);
        border-radius: 16px;
        margin-bottom: 24px;
      }

      .status-left {
        display: flex;
        align-items: center;
        gap: 14px;
      }

      .status-icon {
        color: var(--g-green);
        flex: none;
      }

      .status-title {
        font-family: var(--font-google);
        font-size: 15px;
        font-weight: 500;
        color: var(--g-text-primary);
      }

      .status-desc {
        font-size: 13px;
        color: var(--g-text-secondary);
      }

      /* Grid for Home Cards */
      .hub-cards-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 20px;
      }

      /* Material Card */
      .hub-card {
        background: var(--card-bg);
        border: 1px solid var(--g-border-subtle);
        border-radius: 20px;
        padding: 24px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        transition: border-color 0.15s, box-shadow 0.15s;
        margin-bottom: 20px;
      }

      .hub-card:hover {
        border-color: var(--g-primary);
        box-shadow: 0 2px 8px rgba(0,0,0,0.12);
      }

      .hub-card-header {
        margin-bottom: 16px;
      }

      .hub-card-title {
        font-family: var(--font-google);
        font-size: 18px;
        font-weight: 500;
        margin: 0 0 6px;
        color: var(--g-text-primary);
      }

      .hub-card-desc {
        font-size: 13px;
        color: var(--g-text-secondary);
        line-height: 1.45;
        margin: 0;
      }

      /* Tabular list items inside cards */
      .hub-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 16px 0;
        border-top: 1px solid var(--g-border-subtle);
        text-decoration: none;
        color: inherit;
        transition: background-color 0.15s;
      }

      .hub-row:first-of-type { border-top: 1px solid var(--g-border-subtle); }

      .hub-row-label {
        font-size: 13px;
        color: var(--g-text-secondary);
        width: 140px;
        flex: none;
      }

      .hub-row-value {
        font-size: 14px;
        font-weight: 500;
        color: var(--g-text-primary);
        flex: 1;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .hub-row-action {
        color: var(--g-text-tertiary);
        flex: none;
        margin-left: 12px;
      }

      .hub-badge {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 4px 10px;
        border-radius: 999px;
        font-size: 12px;
        font-weight: 500;
      }

      .hub-badge.success {
        background: var(--g-green-bg);
        color: var(--g-green);
      }

      /* Pill Action Button */
      .hub-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border: 0;
        border-radius: 100px;
        background: var(--g-primary);
        color: var(--g-on-primary);
        font-family: var(--font-google);
        font-size: 14px;
        font-weight: 500;
        height: 38px;
        padding: 0 20px;
        text-decoration: none;
        cursor: pointer;
        transition: background-color 0.15s;
      }

      .hub-btn:hover { background: var(--g-primary-hover); }

      .hub-btn.secondary {
        background: transparent;
        border: 1px solid var(--g-border-subtle);
        color: var(--g-primary);
      }

      .hub-btn.secondary:hover {
        background: var(--g-state-hover);
        border-color: var(--g-primary);
      }

      .hub-btn.text-btn {
        background: transparent;
        color: var(--g-primary);
        height: 36px;
        padding: 0 14px;
      }

      .hub-btn.text-btn:hover { background: var(--g-state-hover); }

      /* Storage Meter */
      .storage-meter-wrap {
        margin: 16px 0 8px;
      }
      .storage-bar {
        height: 8px;
        background: var(--g-surface-subtle);
        border-radius: 4px;
        overflow: hidden;
        display: flex;
        gap: 2px;
      }
      .storage-bar-segment {
        height: 100%;
        border-radius: 2px;
      }
      .storage-legend {
        display: flex;
        flex-wrap: wrap;
        gap: 16px;
        margin-top: 12px;
        font-size: 12px;
        color: var(--g-text-secondary);
      }
      .storage-item {
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .storage-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        display: inline-block;
      }
      .storage-free {
        margin-left: auto;
        font-weight: 500;
        color: var(--g-text-primary);
      }

      /* Material Toggle Switch */
      .material-switch {
        position: relative;
        display: inline-block;
        width: 44px;
        height: 24px;
        flex: none;
      }
      .material-switch input {
        opacity: 0;
        width: 0;
        height: 0;
      }
      .switch-slider {
        position: absolute;
        cursor: pointer;
        top: 0; left: 0; right: 0; bottom: 0;
        background-color: var(--g-surface-hover);
        border: 2px solid var(--g-border-subtle);
        transition: .2s;
        border-radius: 24px;
      }
      .switch-slider:before {
        position: absolute;
        content: "";
        height: 14px;
        width: 14px;
        left: 3px;
        bottom: 3px;
        background-color: var(--g-text-tertiary);
        transition: .2s;
        border-radius: 50%;
      }
      .material-switch input:checked + .switch-slider {
        background-color: var(--g-primary);
        border-color: var(--g-primary);
      }
      .material-switch input:checked + .switch-slider:before {
        transform: translateX(20px);
        background-color: var(--g-on-primary);
      }

      /* Danger Button & Card */
      .hub-btn.danger {
        background: transparent;
        border: 1px solid #ea4335;
        color: #ea4335;
      }
      .hub-btn.danger:hover {
        background: rgba(234, 67, 53, 0.1);
      }

      /* Modal Dialog */
      .hub-modal-backdrop {
        position: fixed;
        top: 0; left: 0; right: 0; bottom: 0;
        background: rgba(0, 0, 0, 0.6);
        display: none;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        backdrop-filter: blur(4px);
      }
      .hub-modal-backdrop.open { display: flex; }
      .hub-modal {
        background: var(--card-bg);
        border: 1px solid var(--g-border-subtle);
        border-radius: 24px;
        padding: 32px;
        max-width: 500px;
        width: 90%;
        box-shadow: 0 16px 32px rgba(0,0,0,0.4);
        animation: fadeIn 0.2s ease;
      }

      /* Main Content */
      .hub-main {
        flex: 1;
        padding: 32px 40px 64px;
        min-width: 0;
        max-width: 900px;
        transition: padding 0.25s;
      }

      /* Responsive rules */
      @media (max-width: 960px) {
        .hub-layout { flex-direction: column; }
        .hub-sidebar {
          width: 100% !important;
          height: auto;
          position: static;
          flex-direction: row;
          flex-wrap: nowrap;
          overflow-x: auto;
          overflow-y: hidden;
          padding: 6px 8px;
          border-right: none;
          border-bottom: 1px solid var(--g-border-subtle);
        }
        .hub-sidebar.collapsed { width: 100% !important; }
        .nav-section { flex-direction: row; padding: 2px 0; }
        .nav-section-label, .nav-section-divider { display: none; }
        /* Always show full pill+label on mobile regardless of collapsed state */
        .hub-sidebar .nav-link,
        .hub-sidebar.collapsed .nav-link {
          width: auto !important;
          height: 40px !important;
          margin: 0 !important;
          border-radius: 24px !important;
          padding: 0 14px !important;
          gap: 8px !important;
          flex: none;
          overflow: hidden;
          justify-content: flex-start !important;
        }
        .hub-sidebar .nav-label,
        .hub-sidebar.collapsed .nav-label {
          max-width: 120px !important;
          opacity: 1 !important;
          pointer-events: auto !important;
          overflow: hidden !important;
        }
        .nav-link.active::before { display: none; }
        .hub-sidebar.collapsed .nav-link[title]:hover::after { display: none; }
        .hub-main { padding: 24px 16px 48px; }
        .hub-cards-grid { grid-template-columns: 1fr; }
        .hub-search-wrap { display: none; }
        .hamburger-btn { display: none; }
      }
    </style>
  </head>
  <body>
    <!-- Google Account Top App Bar -->
    <header class="hub-header">
      <div class="hub-header-left">
        <!-- Hamburger / drawer toggle -->
        <button type="button" class="hamburger-btn" id="sidebar-toggle-btn" title="Main menu" aria-label="Toggle navigation menu" aria-expanded="true" aria-controls="hub-sidebar">
          <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/></svg>
        </button>
        <a href="/account" class="hub-brand">
          ${renderToggleLogo({ size: 30 })}
          <span class="hub-brand-title">Toggle <span class="hub-brand-sub">Account</span></span>
        </a>
      </div>

      <div class="hub-search-wrap">
        <svg class="hub-search-icon" aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
        <input type="search" class="hub-search" id="hub-search" placeholder="Search Toggle Account (e.g. password, privacy, email, storage)..." />
      </div>

      <div class="hub-header-actions">
        <!-- Theme Switcher -->
        <button type="button" class="icon-btn" id="theme-btn" title="Toggle theme">
          <svg class="sun-icon" aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58a.996.996 0 00-1.41 0 .996.996 0 000 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37a.996.996 0 00-1.41 0 .996.996 0 000 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41l-1.06-1.06zm1.06-10.96a.996.996 0 000-1.41.996.996 0 00-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.36l-1.06 1.06a.996.996 0 000 1.41c.39.39 1.03.39 1.41 0l1.06-1.06c.39-.39.39-1.03 0-1.41s-1.02-.39-1.41 0z"/></svg>
        </button>

        <!-- Google 9-dot App Launcher -->
        <button type="button" class="icon-btn" id="apps-launcher-btn" title="Toggle apps">
          <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M6 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm12 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-6 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM6 4c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm12 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-6 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 12c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm6 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-12 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg>
        </button>

        <!-- App Launcher Dropdown -->
        <div class="apps-menu" id="apps-menu">
          <div class="apps-menu-title">Toggle Workspace Apps</div>
          <div class="apps-grid">
            <!-- Registered SSO apps render here. Add entries for your real apps,
                 e.g. <a class="app-item" href="/authorize?client_id=YOUR_APP&redirect_uri=...">. -->
          </div>
        </div>

        <!-- User Profile Avatar -->
        <button type="button" class="hub-avatar-btn" id="profile-btn" title="Toggle Account: ${escapeHtml(fullName)}">
          ${escapeHtml(initial)}
        </button>

        <!-- Profile Dropdown -->
        <div class="profile-menu" id="profile-menu">
          <div class="profile-menu-avatar">${escapeHtml(initial)}</div>
          <div class="profile-menu-name">${escapeHtml(fullName)}</div>
          <div class="profile-menu-email">${escapeHtml(email)}</div>
          <a class="hub-btn secondary" style="width: 100%; margin-bottom: 8px;" href="/forgot-password">Security settings</a>
          <a class="hub-btn" style="width: 100%;" href="/logout">Sign out</a>
        </div>
      </div>
    </header>

    <div class="hub-layout">
      <!-- Google Material 3 Navigation Drawer -->
      <nav class="hub-sidebar" id="hub-sidebar" aria-label="Account navigation">

        <!-- SECTION: Account -->
        <div class="nav-section">
          <button type="button" class="nav-link active" data-tab="tab-home" title="Home">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
            <span class="nav-label">Home</span>
          </button>
        </div>

        <div class="nav-section-divider"></div>

        <!-- SECTION: Manage -->
        <div class="nav-section">
          <div class="nav-section-label">Manage</div>
          <button type="button" class="nav-link" data-tab="tab-personal" title="Personal info">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
            <span class="nav-label">Personal info</span>
          </button>
          <button type="button" class="nav-link" data-tab="tab-data" title="Data &amp; privacy">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/></svg>
            <span class="nav-label">Data &amp; privacy</span>
          </button>
          <button type="button" class="nav-link" data-tab="tab-security" title="Security">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/></svg>
            <span class="nav-label">Security</span>
          </button>
          <button type="button" class="nav-link" data-tab="tab-people" title="People &amp; sharing">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>
            <span class="nav-label">People &amp; sharing</span>
          </button>
          <button type="button" class="nav-link" data-tab="tab-payments" title="Payments &amp; subscriptions">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/></svg>
            <span class="nav-label">Payments &amp; subscriptions</span>
          </button>
        </div>

        <div class="nav-section-divider"></div>

        <!-- SECTION: More options -->
        <div class="nav-section">
          <div class="nav-section-label">More options</div>
          <a class="nav-link" href="/forgot-password" title="Change password">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/></svg>
            <span class="nav-label">Change password</span>
          </a>
          <a class="nav-link" href="/logout" title="Sign out">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/></svg>
            <span class="nav-label">Sign out</span>
          </a>
        </div>

      </nav>

      <!-- Main Canvas -->
      <main class="hub-main">
        <!-- TAB 1: HOME -->
        <div class="tab-pane active" id="tab-home">
          <div class="hero-banner">
            <div class="hero-avatar-wrap">
              <div class="hero-avatar">${escapeHtml(initial)}</div>
              <div class="hero-camera-badge" title="Profile picture">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12m-3.2 0a3.2 3.2 0 1 0 6.4 0 3.2 3.2 0 1 0-6.4 0M9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"/></svg>
              </div>
            </div>
            <h1 class="hero-title">Welcome, ${escapeHtml(displayName)}</h1>
            <p class="hero-desc">Manage your info, privacy, and security settings to make Toggle services work better for you.</p>
          </div>

          <!-- Security Status Shield Card -->
          <div class="status-banner">
            <div class="status-left">
              <svg class="status-icon" width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/></svg>
              <div>
                <div class="status-title">Security Checkup: Your account is protected</div>
                <div class="status-desc">No security recommendations right now. Your central credentials are up to date.</div>
              </div>
            </div>
            <button type="button" class="hub-btn secondary" style="flex: none;" onclick="switchTab('tab-security')">See details</button>
          </div>

          <!-- Account Storage Bar Card (Google One Style) -->
          <div class="hub-card">
            <div class="hub-card-header">
              <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                <div>
                  <h2 class="hub-card-title">Account storage</h2>
                  <p class="hub-card-desc">Your storage is shared across your central account services.</p>
                </div>
                <button type="button" class="hub-btn secondary" style="height: 32px; font-size: 13px;" onclick="switchTab('tab-payments')">Manage storage</button>
              </div>
            </div>
            <div class="storage-meter-wrap">
              <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 6px;">
                <span><strong>0.4 GB</strong> of 15 GB used (2%)</span>
                <span style="color: var(--g-text-secondary);">Included Free Tier</span>
              </div>
              <div class="storage-bar">
                <div class="storage-bar-segment" style="width: 0.8%; background: #FBBC05;" title="Identity & Profile (100 MB)"></div>
              </div>
              <div class="storage-legend">
                <span class="storage-item"><span class="storage-dot" style="background: #FBBC05;"></span>Profile (100 MB)</span>
                <span class="storage-free">14.9 GB available</span>
              </div>
            </div>
          </div>

          <!-- Privacy Suggestions Banner -->
          <div class="status-banner" style="background: var(--card-bg);">
            <div class="status-left">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="#4285F4" style="flex: none;"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
              <div>
                <div class="status-title">Privacy Checkup: Suggestions available</div>
                <div class="status-desc">Take a guided review of your data sharing and workspace activity settings.</div>
              </div>
            </div>
            <button type="button" class="hub-btn secondary" style="flex: none;" onclick="switchTab('tab-data')">Review suggestions</button>
          </div>

          <!-- 2x2 Google Cards Grid -->
          <div class="hub-cards-grid">
            <!-- Card 1: Privacy & personalization -->
            <div class="hub-card">
              <div class="hub-card-header">
                <div style="color: #4285F4; margin-bottom: 12px;">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/></svg>
                </div>
                <h2 class="hub-card-title">Privacy &amp; personalization</h2>
                <p class="hub-card-desc">See the data in your Toggle Account and choose what activity is saved to personalize your experience.</p>
              </div>
              <button type="button" class="hub-btn text-btn" onclick="switchTab('tab-data')">Manage your data &amp; privacy &rarr;</button>
            </div>

            <!-- Card 2: Security recommendations -->
            <div class="hub-card">
              <div class="hub-card-header">
                <div style="color: #34A853; margin-bottom: 12px;">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/></svg>
                </div>
                <h2 class="hub-card-title">Security recommendations</h2>
                <p class="hub-card-desc">Keep your sign-in methods, sessions, and recovery settings protected with central SSO security.</p>
              </div>
              <button type="button" class="hub-btn text-btn" onclick="switchTab('tab-security')">Manage security &rarr;</button>
            </div>

            <!-- Card 3: Personal info -->
            <div class="hub-card">
              <div class="hub-card-header">
                <div style="color: #FBBC05; margin-bottom: 12px;">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                </div>
                <h2 class="hub-card-title">Personal info</h2>
                <p class="hub-card-desc">Your basic profile info, contact details, and preferences saved across all Toggle applications.</p>
              </div>
              <button type="button" class="hub-btn text-btn" onclick="switchTab('tab-personal')">View personal info &rarr;</button>
            </div>

            <!-- Card 4: Payments & Storage -->
            <div class="hub-card">
              <div class="hub-card-header">
                <div style="color: #EA4335; margin-bottom: 12px;">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor"><path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/></svg>
                </div>
                <h2 class="hub-card-title">Account subscriptions</h2>
                <p class="hub-card-desc">Manage connected services and apps that use your central account.</p>
              </div>
              <button type="button" class="hub-btn text-btn" onclick="switchTab('tab-payments')">View subscriptions &rarr;</button>
            </div>
          </div>

          <!-- Recent Security Activity Card on Home -->
          <div class="hub-card" style="margin-top: 20px;">
            <div class="hub-card-header">
              <h2 class="hub-card-title">Recent security activity</h2>
              <p class="hub-card-desc">Activities and security events from the last 28 days.</p>
            </div>
            <div class="hub-row">
              <div style="display: flex; align-items: center; gap: 14px;">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" style="color: var(--g-green);"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/></svg>
                <div>
                  <div style="font-weight: 500;">New sign-in on Windows device</div>
                  <div style="font-size: 12px; color: var(--g-text-secondary);">${escapeHtml(lastLogin)} &bull; Current web browser session</div>
                </div>
              </div>
              <span class="hub-row-action" style="cursor: pointer;" onclick="switchTab('tab-security')">&rarr;</span>
            </div>
          </div>
        </div>

        <!-- TAB 2: PERSONAL INFO -->
        <div class="tab-pane" id="tab-personal">
          <div style="margin-bottom: 24px;">
            <h1 class="hero-title" style="text-align: left;">Personal info</h1>
            <p class="hero-desc" style="margin: 0; text-align: left;">Info about you and your preferences across Toggle services.</p>
          </div>

          <!-- Basic Info Card -->
          <div class="hub-card">
            <div class="hub-card-header">
              <h2 class="hub-card-title">Basic info</h2>
              <p class="hub-card-desc">Some info may be visible to other people using Toggle services.</p>
            </div>
            <div>
              <div class="hub-row">
                <span class="hub-row-label">Profile picture</span>
                <div class="hub-row-value">
                  <div style="width: 36px; height: 36px; border-radius: 50%; background: #1a73e8; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 500;">${escapeHtml(initial)}</div>
                </div>
                <span class="hub-row-action">&rarr;</span>
              </div>
              <div class="hub-row">
                <span class="hub-row-label">Name</span>
                <span class="hub-row-value">${escapeHtml(fullName)}</span>
                <span class="hub-row-action">&rarr;</span>
              </div>
              <div class="hub-row">
                <span class="hub-row-label">Birthday</span>
                <div class="hub-row-value" style="display: flex; align-items: center; gap: 8px;">
                  <span>${escapeHtml(birthday)}</span>
                  <span class="hub-badge" style="background: var(--g-surface-subtle); color: var(--g-text-secondary); font-size: 11px;">Only you</span>
                </div>
                <span class="hub-row-action">&rarr;</span>
              </div>
              <div class="hub-row">
                <span class="hub-row-label">Gender</span>
                <div class="hub-row-value" style="display: flex; align-items: center; gap: 8px;">
                  <span>${escapeHtml(gender)}</span>
                  <span class="hub-badge" style="background: var(--g-surface-subtle); color: var(--g-text-secondary); font-size: 11px;">Only you</span>
                </div>
                <span class="hub-row-action">&rarr;</span>
              </div>
            </div>
          </div>

          <!-- Contact Info Card -->
          <div class="hub-card">
            <div class="hub-card-header">
              <h2 class="hub-card-title">Contact info</h2>
              <p class="hub-card-desc">Ways to reach you and keep your account verified.</p>
            </div>
            <div>
              <div class="hub-row">
                <span class="hub-row-label">Email</span>
                <div class="hub-row-value" style="display: flex; align-items: center; gap: 10px;">
                  <span>${escapeHtml(email)}</span>
                  <span class="hub-badge success">Primary &bull; Verified</span>
                </div>
                <span class="hub-row-action">&rarr;</span>
              </div>
              <div class="hub-row">
                <span class="hub-row-label">Recovery email</span>
                <span class="hub-row-value" style="color: var(--g-text-tertiary);">Add a recovery email to help secure your account</span>
                <span class="hub-row-action">&rarr;</span>
              </div>
              <div class="hub-row">
                <span class="hub-row-label">Phone</span>
                <span class="hub-row-value" style="color: var(--g-text-tertiary);">Add a phone number for recovery</span>
                <span class="hub-row-action">&rarr;</span>
              </div>
            </div>
          </div>

          <!-- Addresses Card -->
          <div class="hub-card">
            <div class="hub-card-header">
              <h2 class="hub-card-title">Addresses</h2>
              <p class="hub-card-desc">Your home and work addresses used across Toggle Workspace and Calendar.</p>
            </div>
            <div>
              <div class="hub-row">
                <span class="hub-row-label">Home</span>
                <span class="hub-row-value" style="color: var(--g-text-tertiary);">Not set &bull; Add your home address</span>
                <span class="hub-row-action">&rarr;</span>
              </div>
              <div class="hub-row">
                <span class="hub-row-label">Work</span>
                <span class="hub-row-value" style="color: var(--g-text-tertiary);">Not set &bull; Add your work address</span>
                <span class="hub-row-action">&rarr;</span>
              </div>
              <div class="hub-row">
                <span class="hub-row-label">Other addresses</span>
                <span class="hub-row-value" style="color: var(--g-text-secondary);">None</span>
                <span class="hub-row-action">&rarr;</span>
              </div>
            </div>
          </div>

          <!-- General Preferences for the Web -->
          <div class="hub-card">
            <div class="hub-card-header">
              <h2 class="hub-card-title">General preferences for the web</h2>
              <p class="hub-card-desc">Manage settings for Google/Toggle services on the web.</p>
            </div>
            <div>
              <div class="hub-row">
                <span class="hub-row-label">Language</span>
                <span class="hub-row-value">English (United States)</span>
                <span class="hub-row-action">&rarr;</span>
              </div>
              <div class="hub-row">
                <span class="hub-row-label">Input Tools</span>
                <span class="hub-row-value">English &bull; Standard QWERTY</span>
                <span class="hub-row-action">&rarr;</span>
              </div>
              <div class="hub-row">
                <span class="hub-row-label">Accessibility</span>
                <span class="hub-row-value">High-contrast colors (Off) &bull; Screen reader optimized</span>
                <span class="hub-row-action">&rarr;</span>
              </div>
              <div class="hub-row">
                <span class="hub-row-label">Search settings</span>
                <span class="hub-row-value">SafeSearch (Filter explicit results active)</span>
                <span class="hub-row-action">&rarr;</span>
              </div>
            </div>
          </div>

          <!-- Membership & System Info Card -->
          <div class="hub-card">
            <div class="hub-card-header">
              <h2 class="hub-card-title">Membership &amp; Account ID</h2>
              <p class="hub-card-desc">Central SSO account metadata and registration timestamps.</p>
            </div>
            <div>
              <div class="hub-row">
                <span class="hub-row-label">Member since</span>
                <span class="hub-row-value">${escapeHtml(memberSince)}</span>
              </div>
              <div class="hub-row">
                <span class="hub-row-label">Account status</span>
                <div class="hub-row-value">
                  <span class="hub-badge success">${escapeHtml(account.status === 'active' ? 'Active' : account.status)}</span>
                </div>
              </div>
              <div class="hub-row">
                <span class="hub-row-label">User ID</span>
                <span class="hub-row-value" style="font-family: monospace; font-size: 12px;">${escapeHtml(account.user_id || 'Primary User')}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- TAB 3: DATA & PRIVACY -->
        <div class="tab-pane" id="tab-data">
          <div style="margin-bottom: 24px;">
            <h1 class="hero-title" style="text-align: left;">Data &amp; privacy</h1>
            <p class="hero-desc" style="margin: 0; text-align: left;">Key privacy options, permissions, and downloaded account data.</p>
          </div>

          <!-- Privacy Suggestions -->
          <div class="hub-card">
            <div class="hub-card-header">
              <h2 class="hub-card-title">Privacy suggestions available</h2>
              <p class="hub-card-desc">Review key privacy settings and choose what activity is saved to customize your experience.</p>
            </div>
            <div class="hub-row">
              <div style="display: flex; align-items: center; gap: 12px;">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="#4285F4"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
                <div>
                  <div style="font-weight: 500;">Take the Privacy Checkup</div>
                  <div style="font-size: 12px; color: var(--g-text-secondary);">2 settings recommended for review</div>
                </div>
              </div>
              <button type="button" class="hub-btn secondary" style="height: 32px; font-size: 13px;" onclick="alert('Privacy Checkup: All connected apps are strictly using isolated OAuth 2.0 scopes.')">Start Checkup</button>
            </div>
          </div>

          <div class="hub-card">
            <div class="hub-card-header">
              <h2 class="hub-card-title">History settings</h2>
              <p class="hub-card-desc">Toggle features that save your search and workspace activity.</p>
            </div>
            <div>
              <div class="hub-row">
                <span class="hub-row-label">Web &amp; App Activity</span>
                <span class="hub-row-value" style="color: var(--g-green); font-weight: 500;">On</span>
                <span class="hub-row-action">&rarr;</span>
              </div>
              <div class="hub-row">
                <span class="hub-row-label">Location History</span>
                <span class="hub-row-value" style="color: var(--g-text-secondary);">Paused</span>
                <span class="hub-row-action">&rarr;</span>
              </div>
              <div class="hub-row">
                <span class="hub-row-label">Search history</span>
                <span class="hub-row-value">Auto-delete: 18 months</span>
                <span class="hub-row-action">&rarr;</span>
              </div>
            </div>
          </div>

          <div class="hub-card">
            <div class="hub-card-header">
              <h2 class="hub-card-title">Third-party apps with account access</h2>
              <p class="hub-card-desc">Applications authorized to use your central Toggle Single Sign-On credentials.</p>
            </div>
            <div>
              <!-- Authorized third-party app rows render here. Add rows for your
                   real apps, e.g. <div class="hub-row">...<span class="hub-badge success">Authorized</span></div>. -->
            </div>
          </div>

          <!-- Data from apps and services you use -->
          <div class="hub-card">
            <div class="hub-card-header">
              <h2 class="hub-card-title">Data from apps and services you use</h2>
              <p class="hub-card-desc">Summary of your services and data saved in your account.</p>
            </div>
            <div>
              <div class="hub-row">
                <span class="hub-row-label">Toggle Workspace</span>
                <span class="hub-row-value">No apps active</span>
                <span class="hub-row-action">&rarr;</span>
              </div>
              <div class="hub-row">
                <span class="hub-row-label">SSO Sessions</span>
                <span class="hub-row-value">1 active central session</span>
                <span class="hub-row-action">&rarr;</span>
              </div>
            </div>
          </div>

          <!-- Download or delete your data -->
          <div class="hub-card">
            <div class="hub-card-header">
              <h2 class="hub-card-title">Download or delete your data</h2>
              <p class="hub-card-desc">Google Takeout-style data portability and account management.</p>
            </div>
            <div>
              <div class="hub-row">
                <div>
                  <div style="font-weight: 500;">Download your data (Toggle Takeout)</div>
                  <div style="font-size: 12px; color: var(--g-text-secondary);">Make a copy of your personal data and activity to back it up</div>
                </div>
                <button type="button" class="hub-btn secondary" style="height: 32px; font-size: 13px;" onclick="openTakeoutModal()">Export</button>
              </div>
              <div class="hub-row">
                <div>
                  <div style="font-weight: 500;">Delete a Toggle service</div>
                  <div style="font-size: 12px; color: var(--g-text-secondary);">Delete a specific service from your account (like Docs or Calendar)</div>
                </div>
                <button type="button" class="hub-btn secondary" style="height: 32px; font-size: 13px;" onclick="alert('Service deletion: All services currently managed through Workspace admin.')">Manage</button>
              </div>
              <div class="hub-row">
                <div>
                  <div style="font-weight: 500; color: #ea4335;">Delete your Toggle Account</div>
                  <div style="font-size: 12px; color: var(--g-text-secondary);">Permanently delete your entire account and all data</div>
                </div>
                <button type="button" class="hub-btn danger" style="height: 32px; font-size: 13px;" onclick="openDeleteModal()">Delete Account</button>
              </div>
            </div>
          </div>
        </div>

        <!-- TAB 4: SECURITY -->
        <div class="tab-pane" id="tab-security">
          <div style="margin-bottom: 24px;">
            <h1 class="hero-title" style="text-align: left;">Security</h1>
            <p class="hero-desc" style="margin: 0; text-align: left;">Settings and recommendations to keep your account safe.</p>
          </div>

          <!-- Security status banner -->
          <div class="status-banner">
            <div class="status-left">
              <svg class="status-icon" width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/></svg>
              <div>
                <div class="status-title">Your account is protected</div>
                <div class="status-desc">Argon2id password hashing is active. No security breaches or unusual sign-ins detected.</div>
              </div>
            </div>
          </div>

          <!-- Recent security activity -->
          <div class="hub-card">
            <div class="hub-card-header">
              <h2 class="hub-card-title">Recent security activity</h2>
              <p class="hub-card-desc">Sign-ins, credential changes, and security events.</p>
            </div>
            <div>
              <div class="hub-row">
                <div style="display: flex; align-items: center; gap: 12px;">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" style="color: var(--g-green);"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/></svg>
                  <div>
                    <div style="font-weight: 500;">Sign-in on Windows PC</div>
                    <div style="font-size: 12px; color: var(--g-text-secondary);">${escapeHtml(lastLogin)} &bull; Current web browser session</div>
                  </div>
                </div>
                <span class="hub-badge success">Active</span>
              </div>
              <div class="hub-row">
                <div style="display: flex; align-items: center; gap: 12px;">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" style="color: var(--g-primary);"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/></svg>
                  <div>
                    <div style="font-weight: 500;">Password secured with Argon2id</div>
                    <div style="font-size: 12px; color: var(--g-text-secondary);">Last updated: ${escapeHtml(pwdChanged)}</div>
                  </div>
                </div>
                <span class="hub-row-action">&rarr;</span>
              </div>
            </div>
          </div>

          <!-- How you sign in to Toggle -->
          <div class="hub-card">
            <div class="hub-card-header">
              <h2 class="hub-card-title">How you sign in to Toggle</h2>
              <p class="hub-card-desc">Manage your password and sign-in verification options.</p>
            </div>
            <div>
              <div class="hub-row">
                <span class="hub-row-label">Password</span>
                <span class="hub-row-value">Last changed &bull; ${escapeHtml(pwdChanged)}</span>
                <a class="hub-btn secondary" style="height: 32px; font-size: 13px;" href="/forgot-password">Change</a>
              </div>
              <div class="hub-row">
                <span class="hub-row-label">2-Step Verification</span>
                <span class="hub-row-value" style="color: var(--g-text-secondary);">Off &bull; Add extra protection</span>
                <span class="hub-row-action">&rarr;</span>
              </div>
              <div class="hub-row">
                <span class="hub-row-label">Passkeys</span>
                <span class="hub-row-value" style="color: var(--g-text-secondary);">Use biometric device screen lock</span>
                <span class="hub-row-action">&rarr;</span>
              </div>
              <div class="hub-row">
                <span class="hub-row-label">Security keys</span>
                <span class="hub-row-value" style="color: var(--g-text-secondary);">FIDO2 / WebAuthn physical hardware keys</span>
                <span class="hub-row-action">&rarr;</span>
              </div>
            </div>
          </div>

          <!-- Ways we can verify it's you -->
          <div class="hub-card">
            <div class="hub-card-header">
              <h2 class="hub-card-title">Ways we can verify it's you</h2>
              <p class="hub-card-desc">These can be used to make sure it's really you signing in or to help reach you if there's suspicious activity.</p>
            </div>
            <div>
              <div class="hub-row">
                <span class="hub-row-label">Recovery phone</span>
                <span class="hub-row-value" style="color: var(--g-text-tertiary);">Add a phone number</span>
                <span class="hub-row-action">&rarr;</span>
              </div>
              <div class="hub-row">
                <span class="hub-row-label">Recovery email</span>
                <span class="hub-row-value">${escapeHtml(email)}</span>
                <span class="hub-row-action">&rarr;</span>
              </div>
            </div>
          </div>

          <!-- Enhanced Safe Browsing -->
          <div class="hub-card">
            <div class="hub-card-header">
              <h2 class="hub-card-title">Enhanced Safe Browsing for your account</h2>
              <p class="hub-card-desc">Provides faster, proactive protection against dangerous sites, downloads, and extensions.</p>
            </div>
            <div class="hub-row">
              <div>
                <div style="font-weight: 500;" id="safe-browsing-status">Enhanced Safe Browsing is On</div>
                <div style="font-size: 12px; color: var(--g-text-secondary);">Real-time security checks across all connected Toggle apps</div>
              </div>
              <label class="material-switch">
                <input type="checkbox" id="safe-browsing-switch" checked />
                <span class="switch-slider"></span>
              </label>
            </div>
          </div>

          <!-- Your devices -->
          <div class="hub-card">
            <div class="hub-card-header">
              <h2 class="hub-card-title">Your devices</h2>
              <p class="hub-card-desc">Where you're currently signed in to your Toggle Account.</p>
            </div>
            <div>
              <div class="hub-row">
                <div style="display: flex; align-items: center; gap: 12px;">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" style="color: var(--g-text-secondary);"><path d="M20 18c1.1 0 1.99-.9 1.99-2L22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2H0v2h24v-2h-4zM4 6h16v10H4V6z"/></svg>
                  <div>
                    <div style="font-weight: 500;">Windows PC &bull; Central Web Session</div>
                    <div style="font-size: 12px; color: var(--g-green); display: flex; align-items: center; gap: 6px;">
                      <span style="width: 8px; height: 8px; border-radius: 50%; background: var(--g-green); display: inline-block;"></span>
                      This device &bull; Active now
                    </div>
                  </div>
                </div>
                <span class="hub-row-action">&rarr;</span>
              </div>
              <div class="hub-row">
                <span class="hub-row-label">Last sign-in</span>
                <span class="hub-row-value">${escapeHtml(lastLogin)}</span>
              </div>
              <div class="hub-row">
                <span class="hub-row-label">Find a lost device</span>
                <span class="hub-row-value" style="color: var(--g-primary); cursor: pointer;" onclick="alert('Find device: Connected devices are mapped via central SSO tokens.')">Locate device &rarr;</span>
              </div>
            </div>
          </div>

          <!-- Sign Out Action -->
          <div style="margin-top: 16px; display: flex; justify-content: flex-end;">
            <a class="hub-btn secondary" href="/logout">Sign out of all sessions</a>
          </div>
        </div>

        <!-- TAB 5: PEOPLE & SHARING -->
        <div class="tab-pane" id="tab-people">
          <div style="margin-bottom: 24px;">
            <h1 class="hero-title" style="text-align: left;">People &amp; sharing</h1>
            <p class="hero-desc" style="margin: 0; text-align: left;">Your contacts and what profile information you share with others.</p>
          </div>

          <div class="hub-card">
            <div class="hub-card-header">
              <h2 class="hub-card-title">Contacts</h2>
              <p class="hub-card-desc">Organize your contacts so you can collaborate easily across your apps.</p>
            </div>
            <div>
              <div class="hub-row">
                <span class="hub-row-label">Contact info saved from interactions</span>
                <span class="hub-row-value" style="color: var(--g-green); font-weight: 500;">On</span>
                <span class="hub-row-action">&rarr;</span>
              </div>
              <div class="hub-row">
                <span class="hub-row-label">Synced contacts</span>
                <span class="hub-row-value">0 contacts</span>
                <span class="hub-row-action">&rarr;</span>
              </div>
              <div class="hub-row">
                <span class="hub-row-label">Other contacts</span>
                <span class="hub-row-value">0 contacts</span>
                <span class="hub-row-action">&rarr;</span>
              </div>
            </div>
          </div>

          <div class="hub-card">
            <div class="hub-card-header">
              <h2 class="hub-card-title">Choose what others see</h2>
              <p class="hub-card-desc">Decide what personal info is visible to other people using Toggle Workspace apps.</p>
            </div>
            <div>
              <div class="hub-row">
                <span class="hub-row-label">About me</span>
                <span class="hub-row-value">${escapeHtml(fullName)} &bull; ${escapeHtml(email)}</span>
                <span class="hub-row-action">&rarr;</span>
              </div>
              <div class="hub-row">
                <span class="hub-row-label">Profile privacy</span>
                <span class="hub-row-value">Only people in your workspace</span>
                <span class="hub-row-action">&rarr;</span>
              </div>
            </div>
          </div>

          <div class="hub-card">
            <div class="hub-card-header">
              <h2 class="hub-card-title">Location sharing &amp; Blocked accounts</h2>
              <p class="hub-card-desc">Manage who can see your real-time updates and view blocked accounts.</p>
            </div>
            <div>
              <div class="hub-row">
                <span class="hub-row-label">Location sharing</span>
                <span class="hub-row-value" style="color: var(--g-text-secondary);">Not sharing with anyone</span>
                <span class="hub-row-action">&rarr;</span>
              </div>
              <div class="hub-row">
                <span class="hub-row-label">Blocked accounts</span>
                <span class="hub-row-value">0 blocked accounts</span>
                <span class="hub-row-action">&rarr;</span>
              </div>
            </div>
          </div>
        </div>

        <!-- TAB 6: PAYMENTS & SUBSCRIPTIONS -->
        <div class="tab-pane" id="tab-payments">
          <div style="margin-bottom: 24px;">
            <h1 class="hero-title" style="text-align: left;">Payments &amp; subscriptions</h1>
            <p class="hero-desc" style="margin: 0; text-align: left;">Your payment methods, subscriptions, and Toggle Workspace storage.</p>
          </div>

          <!-- Storage Breakdown -->
          <div class="hub-card">
            <div class="hub-card-header">
              <h2 class="hub-card-title">Toggle Storage &amp; Plan</h2>
              <p class="hub-card-desc">Your central account quota across all connected services.</p>
            </div>
            <div>
              <div class="hub-row">
                <span class="hub-row-label">Current plan</span>
                <span class="hub-row-value">Toggle Free Tier &bull; Unlimited Central Single Sign-On</span>
                <span class="hub-badge success">Active</span>
              </div>
              <div class="storage-meter-wrap" style="padding: 12px 0;">
                <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 6px;">
                  <span><strong>0.4 GB</strong> of 15 GB used (2%)</span>
                  <button type="button" class="hub-btn secondary" style="height: 28px; font-size: 12px;" onclick="alert('Toggle One storage plans: Upgrade to 100 GB or 2 TB.')">Get more storage</button>
                </div>
                <div class="storage-bar">
                  <div class="storage-bar-segment" style="width: 0.8%; background: #FBBC05;" title="Identity & Profile (100 MB)"></div>
                </div>
                <div class="storage-legend">
                  <span class="storage-item"><span class="storage-dot" style="background: #FBBC05;"></span>Profile (100 MB)</span>
                  <span class="storage-free">14.9 GB free</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Payment Methods (Google Pay / Toggle Pay) -->
          <div class="hub-card">
            <div class="hub-card-header">
              <h2 class="hub-card-title">Payment methods</h2>
              <p class="hub-card-desc">When you buy things or subscribe to Toggle services, your payment info is saved here.</p>
            </div>
            <div>
              <div class="hub-row">
                <div style="display: flex; align-items: center; gap: 12px;">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" style="color: var(--g-text-secondary);"><path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/></svg>
                  <span>No payment methods saved</span>
                </div>
                <button type="button" class="hub-btn secondary" style="height: 32px; font-size: 13px;" onclick="alert('Toggle Pay: Payment integration is ready for credit card, debit, and GPay.')">+ Add payment method</button>
              </div>
            </div>
          </div>

          <!-- Purchases & Reservations -->
          <div class="hub-card">
            <div class="hub-card-header">
              <h2 class="hub-card-title">Purchases &amp; reservations</h2>
              <p class="hub-card-desc">Orders placed through Toggle Workspace and connected services.</p>
            </div>
            <div class="hub-row">
              <span class="hub-row-label">Transactions</span>
              <span class="hub-row-value" style="color: var(--g-text-secondary);">No orders or purchases found</span>
              <span class="hub-row-action">&rarr;</span>
            </div>
          </div>

          <!-- Active Workspace Subscriptions -->
          <div class="hub-card">
            <div class="hub-card-header">
              <h2 class="hub-card-title">Active Workspace Subscriptions</h2>
              <p class="hub-card-desc">Included services active with your central identity.</p>
            </div>
            <div>
              <div class="hub-row">
                <span class="hub-row-label">Central Identity SSO</span>
                <span class="hub-row-value">OAuth 2.0 PKCE &bull; Single Sign-On</span>
                <span class="hub-badge success">Included</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>

    <!-- Takeout Export Modal -->
    <div class="hub-modal-backdrop" id="takeout-modal">
      <div class="hub-modal">
        <h2 style="font-family: var(--font-google); font-size: 20px; margin: 0 0 8px;">Download your data archive</h2>
        <p style="font-size: 14px; color: var(--g-text-secondary); line-height: 1.5; margin: 0 0 20px;">
          Create an export of your Toggle Account data including profile metadata, security log, and linked OAuth apps.
        </p>
        <div style="background: var(--g-surface-subtle); border-radius: 12px; padding: 14px 16px; margin-bottom: 20px; font-size: 13px;">
          <div style="margin-bottom: 6px;">&bull; <strong>Profile &amp; Identity:</strong> Name, Email, Birthday, Gender</div>
          <div style="margin-bottom: 6px;">&bull; <strong>Security Telemetry:</strong> Session history, Argon2id audit events</div>
          <div>&bull; <strong>Workspace Scopes:</strong> Access grants for apps connected to your account</div>
        </div>
        <div style="display: flex; justify-content: flex-end; gap: 12px;">
          <button type="button" class="hub-btn secondary" onclick="closeTakeoutModal()">Cancel</button>
          <button type="button" class="hub-btn" onclick="executeTakeoutExport()">Download JSON</button>
        </div>
      </div>
    </div>

    <!-- Delete Account Confirmation Modal -->
    <div class="hub-modal-backdrop" id="delete-modal">
      <div class="hub-modal">
        <h2 style="font-family: var(--font-google); font-size: 20px; color: #ea4335; margin: 0 0 8px;">Delete your Toggle Account?</h2>
        <p style="font-size: 14px; color: var(--g-text-secondary); line-height: 1.5; margin: 0 0 20px;">
          You are about to permanently delete your central Toggle Account for <strong>${escapeHtml(email)}</strong>. All your account data, app access grants, and credentials will be removed.
        </p>
        <div style="display: flex; justify-content: flex-end; gap: 12px;">
          <button type="button" class="hub-btn secondary" onclick="closeDeleteModal()">Cancel</button>
          <button type="button" class="hub-btn danger" onclick="alert('Account deletion requires administrative multi-factor verification.')">Permanently Delete</button>
        </div>
      </div>
    </div>

    <!-- Client-side Interactive Navigation & Popups Script -->
    <script>
      function switchTab(tabId) {
        document.querySelectorAll('.tab-pane').forEach(function(pane) {
          pane.classList.remove('active');
        });
        document.querySelectorAll('.nav-link').forEach(function(link) {
          link.classList.remove('active');
          if (link.getAttribute('data-tab') === tabId) {
            link.classList.add('active');
          }
        });
        var activePane = document.getElementById(tabId);
        if (activePane) {
          activePane.classList.add('active');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        try { history.replaceState(null, '', '#' + tabId.replace('tab-', '')); } catch(e) {}
      }

      function openTakeoutModal() {
        var modal = document.getElementById('takeout-modal');
        if (modal) modal.classList.add('open');
      }

      function closeTakeoutModal() {
        var modal = document.getElementById('takeout-modal');
        if (modal) modal.classList.remove('open');
      }

      function executeTakeoutExport() {
        var data = {
          export_date: new Date().toISOString(),
          account: {
            user_id: '${escapeHtml(account.user_id || '')}',
            email: '${escapeHtml(email)}',
            full_name: '${escapeHtml(fullName)}',
            birthday: '${escapeHtml(birthday)}',
            gender: '${escapeHtml(gender)}',
            status: '${escapeHtml(account.status || 'active')}',
            member_since: '${escapeHtml(memberSince)}'
          },
          security: {
            argon2id_active: true,
            last_password_change: '${escapeHtml(pwdChanged)}',
            last_login: '${escapeHtml(lastLogin)}'
          },
          connected_apps: []
        };
        var blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = 'toggle-account-takeout-' + '${escapeHtml(email)}'.replace(/[^a-zA-Z0-9]/g, '_') + '.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        closeTakeoutModal();
      }

      function openDeleteModal() {
        var modal = document.getElementById('delete-modal');
        if (modal) modal.classList.add('open');
      }

      function closeDeleteModal() {
        var modal = document.getElementById('delete-modal');
        if (modal) modal.classList.remove('open');
      }

      (function() {
        // Sidebar hamburger toggle
        var sidebarToggleBtn = document.getElementById('sidebar-toggle-btn');
        var hubSidebar = document.getElementById('hub-sidebar');
        if (sidebarToggleBtn && hubSidebar) {
          // Restore persisted state
          try {
            if (localStorage.getItem('nav_collapsed') === '1') {
              hubSidebar.classList.add('collapsed');
              sidebarToggleBtn.setAttribute('aria-expanded', 'false');
            }
          } catch(e) {}

          sidebarToggleBtn.addEventListener('click', function() {
            var isCollapsed = hubSidebar.classList.toggle('collapsed');
            sidebarToggleBtn.setAttribute('aria-expanded', isCollapsed ? 'false' : 'true');
            try { localStorage.setItem('nav_collapsed', isCollapsed ? '1' : '0'); } catch(e) {}
          });
        }

        // Tab switching
        document.querySelectorAll('.nav-link').forEach(function(btn) {
          btn.addEventListener('click', function() {
            var target = btn.getAttribute('data-tab');
            if (target) switchTab(target);
          });
        });

        // Handle initial URL hash
        var hash = window.location.hash.replace('#', '');
        if (hash) {
          var targetTab = 'tab-' + hash;
          if (document.getElementById(targetTab)) {
            switchTab(targetTab);
          }
        }

        // Theme toggle button
        var themeBtn = document.getElementById('theme-btn');
        if (themeBtn) {
          themeBtn.addEventListener('click', function() {
            var cur = document.documentElement.getAttribute('data-theme') || 'dark';
            var next = cur === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', next);
            try { localStorage.setItem('toggle_theme', next); } catch(e) {}
          });
        }

        // Safe browsing toggle
        var safeSwitch = document.getElementById('safe-browsing-switch');
        var safeStatus = document.getElementById('safe-browsing-status');
        if (safeSwitch && safeStatus) {
          safeSwitch.addEventListener('change', function() {
            safeStatus.textContent = safeSwitch.checked ? 'Enhanced Safe Browsing is On' : 'Enhanced Safe Browsing is Off';
          });
        }

        // Apps Launcher popup
        var appsBtn = document.getElementById('apps-launcher-btn');
        var appsMenu = document.getElementById('apps-menu');
        var profileBtn = document.getElementById('profile-btn');
        var profileMenu = document.getElementById('profile-menu');

        if (appsBtn && appsMenu) {
          appsBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            if (profileMenu) profileMenu.classList.remove('open');
            appsMenu.classList.toggle('open');
          });
        }

        if (profileBtn && profileMenu) {
          profileBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            if (appsMenu) appsMenu.classList.remove('open');
            profileMenu.classList.toggle('open');
          });
        }

        document.addEventListener('click', function(e) {
          if (appsMenu && !appsMenu.contains(e.target) && e.target !== appsBtn) {
            appsMenu.classList.remove('open');
          }
          if (profileMenu && !profileMenu.contains(e.target) && e.target !== profileBtn) {
            profileMenu.classList.remove('open');
          }
        });

        // Search bar filtering
        var searchInput = document.getElementById('hub-search');
        if (searchInput) {
          searchInput.addEventListener('input', function() {
            var q = (searchInput.value || '').toLowerCase().trim();
            if (!q) {
              document.querySelectorAll('.hub-card, .status-banner').forEach(function(el) {
                el.style.opacity = '1';
                el.style.display = '';
                el.style.borderColor = '';
              });
              return;
            }

            var firstMatchedTab = null;
            document.querySelectorAll('.tab-pane').forEach(function(pane) {
              var paneHasMatch = false;
              pane.querySelectorAll('.hub-card, .status-banner').forEach(function(card) {
                var text = (card.textContent || '').toLowerCase();
                if (text.indexOf(q) !== -1) {
                  card.style.display = '';
                  card.style.borderColor = 'var(--g-primary)';
                  paneHasMatch = true;
                } else {
                  card.style.display = 'none';
                  card.style.borderColor = '';
                }
              });
              if (paneHasMatch && !firstMatchedTab) {
                firstMatchedTab = pane.id;
              }
            });

            if (firstMatchedTab && !document.getElementById(firstMatchedTab).classList.contains('active')) {
              switchTab(firstMatchedTab);
            }
          });
        }
      })();
    </script>
  </body>
</html>`;
}

