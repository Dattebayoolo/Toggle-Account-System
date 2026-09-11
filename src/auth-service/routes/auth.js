import express from 'express';

import {
  authenticateCredentials,
  getAccountSummary,
  getPasswordResetTokenStatus,
  isEmailAvailable,
  isValidEmailFormat,
  registerUser,
  requestPasswordReset,
  resetPasswordWithToken,
  validateProfile,
  verifyEmailToken
} from '../authenticationService.js';
import { getSsoClient } from '../../common/clients.js';
import { config } from '../../common/config.js';
import crypto from 'node:crypto';

import {
  consumeAuthorizationCode,
  createAuthorizationCode,
  createLoginSession,
  createRefreshToken,
  deleteLoginSession,
  getLoginSession,
  hasGrantedConsent,
  revokeRefreshTokensForUser,
  rotateRefreshToken,
  saveConsent
} from '../authStore.js';
import { clearCookie, parseCookies, setCookie } from '../../common/cookies.js';
import { escapeHtml, renderAccountChip, renderFieldError, renderGuestRow, renderGoogleAccountHub, renderPage } from '../../common/html.js';
import { getJwks, signAccessToken } from '../../common/jwt.js';
import { sendAccountEmail } from '../../common/mailer.js';

const router = express.Router();

async function readAuthSession(req) {
  const cookies = parseCookies(req.headers.cookie);
  const sessionId = cookies[config.ssoSessionCookieName];
  if (!sessionId) {
    return null;
  }

  return getLoginSession(sessionId);
}

function validateClientRequest(clientId, redirectUri) {
  const client = getSsoClient(clientId);
  if (!client) {
    return { error: 'Unknown client application.' };
  }

  if (redirectUri !== client.redirectUri) {
    return { error: 'Invalid redirect URI.' };
  }

  return { client };
}

function pickAuthFlowQuery(source = {}) {
  return {
    client_id: source.client_id || '',
    redirect_uri: source.redirect_uri || '',
    state: source.state || '',
    scope: source.scope || '',
    code_challenge: source.code_challenge || '',
    code_challenge_method: source.code_challenge_method || 'S256'
  };
}

function buildAuthPath(path, query = {}) {
  const params = new URLSearchParams();

  for (const [name, value] of Object.entries(query)) {
    if (value) {
      params.set(name, String(value));
    }
  }

  const queryString = params.toString();
  return queryString ? `${path}?${queryString}` : path;
}

function renderDeveloperLinkPanel({ url }) {
  if (!url) {
    return '';
  }

  return `<div class="panel">
    <strong>Local development link</strong>
    <p>There is no email delivery configured yet, so use this link directly while testing:</p>
    <code>${escapeHtml(url)}</code>
    <div class="actions">
      <a class="button secondary" href="${escapeHtml(url)}">Open link</a>
    </div>
  </div>`;
}

function renderFloatingField({ type = 'text', name, id = '', label, value = '', placeholder = ' ', autocomplete = '', required = true, invalid = false }) {
  const fieldId = id || name;
  const autocompleteAttr = autocomplete ? ` autocomplete="${autocomplete}"` : '';
  const ariaInvalid = invalid ? ' aria-invalid="true"' : '';
  const requiredAttr = required ? ' required' : '';
  const isPassword = type === 'password';
  const hasToggleClass = isPassword ? ' has-toggle' : '';

  const pwdToggleBtn = isPassword ? `<button type="button" class="field-pwd-toggle" aria-label="Show password" tabindex="-1" style="position:absolute; right:10px; top:10px; width:36px; height:36px; min-width:36px; max-width:36px; padding:0; margin:0; border:0; background:transparent; border-radius:50%; display:inline-flex; align-items:center; justify-content:center; cursor:pointer; box-shadow:none; transform:none; transition:none;">
    <svg class="eye-open" aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>
    <svg class="eye-closed" aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.44-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/></svg>
  </button>` : '';

  return `<div class="field${hasToggleClass}">
          <input type="${type}" name="${name}" id="${fieldId}" placeholder="${placeholder}" value="${escapeHtml(value)}"${autocompleteAttr}${ariaInvalid}${requiredAttr} />
          <label for="${fieldId}">${escapeHtml(label)}</label>
          ${pwdToggleBtn}
        </div>`;
}

function formatDate(value) {
  if (!value) {
    return 'Not set';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'Not set';
  }

  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
}

function formatGender(value) {
  const map = {
    female: 'Female',
    male: 'Male',
    'rather-not-say': 'Rather not say',
    custom: 'Custom'
  };

  return value ? (map[value] || value) : 'Not set';
}

function renderAccountDashboard({ account }) {
  return renderGoogleAccountHub({ account });
}

async function renderAuthHome(req) {
  const session = await readAuthSession(req);
  const sessionPanel = session
    ? `${renderAccountChip({ email: session.email, note: 'Central Toggle session' })}
       <div class="bottom-row">
         <a class="text-link" href="/logout">Sign out</a>
       </div>`
    : `<div class="bottom-row">
         <a class="text-link" href="/signup">Create account</a>
         <a class="button" href="/login">Sign in</a>
       </div>
       ${renderGuestRow()}`;

  return renderPage({
    title: 'Toggle Account',
    eyebrow: 'Toggle Account',
    heading: 'Sign in once for all Toggle apps',
    description: 'This central account signs you in to all apps connected to Toggle Account.',
    body: sessionPanel
  });
}

function renderFlowHiddenFields(flowQuery) {
  return Object.entries(flowQuery)
    .map(([name, value]) => `<input type="hidden" name="${name}" value="${escapeHtml(value)}" />`)
    .join('');
}

function renderLoginDescription(client) {
  return client
    ? `to continue to <strong>${escapeHtml(client.name)}</strong>`
    : 'Use your central Toggle account to continue.';
}

/* Step 1 of the Google-style sign-in: email first */
function renderLoginEmailStep({ error, client, query }) {
  const flowQuery = pickAuthFlowQuery(query);

  return renderPage({
    title: 'Toggle Sign In',
    heading: 'Sign in',
    description: renderLoginDescription(client),
    body: `<form method="post" action="/login">
        ${renderFlowHiddenFields(flowQuery)}
        <input type="hidden" name="step" value="email" />
        ${renderFloatingField({ type: 'email', name: 'email', label: 'Email', value: query.email || '', autocomplete: 'email', invalid: Boolean(error) })}
        ${error ? renderFieldError(error) : ''}
        <div class="field-foot"><a class="text-link" href="${buildAuthPath('/forgot-password', flowQuery)}">Forgot email?</a></div>
        ${renderGuestRow()}
        <div class="bottom-row">
          <a class="text-link" href="${buildAuthPath('/signup', flowQuery)}">Create account</a>
          <button type="submit">Next</button>
        </div>
      </form>`
  });
}

/* Step 2 of the Google-style sign-in: password */
function renderLoginPasswordStep({ error, client, query }) {
  const flowQuery = pickAuthFlowQuery(query);

  return renderPage({
    title: 'Toggle Sign In',
    heading: 'Welcome back',
    description: renderLoginDescription(client),
    body: `<form method="post" action="/login">
        ${renderFlowHiddenFields(flowQuery)}
        <input type="hidden" name="step" value="password" />
        <input type="hidden" name="email" value="${escapeHtml(query.email || '')}" />
        ${renderAccountChip({ email: query.email || '' })}
        ${renderFloatingField({ type: 'password', name: 'password', label: 'Enter your password', autocomplete: 'current-password', invalid: Boolean(error) })}
        ${error ? renderFieldError(error) : ''}
        <div class="field-foot"><a class="text-link" href="${buildAuthPath('/forgot-password', flowQuery)}">Forgot password?</a></div>
        ${renderGuestRow()}
        <div class="bottom-row">
          <a class="text-link" href="${buildAuthPath('/login', flowQuery)}">Not you? Use a different account</a>
          <button type="submit">Next</button>
        </div>
      </form>`
  });
}

function renderLoginPage(options) {
  const step = options.query?.step === 'password' && options.query?.email ? 'password' : 'email';

  return step === 'password'
    ? renderLoginPasswordStep(options)
    : renderLoginEmailStep(options);
}

const signupMonths = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const signupGenders = [
  ['', 'Gender'],
  ['female', 'Female'],
  ['male', 'Male'],
  ['rather-not-say', 'Rather not say'],
  ['custom', 'Custom']
];

function renderSignupMonthOptions(selected) {
  return ['<option value="">Month</option>']
    .concat(signupMonths.map((name, index) => {
      const value = String(index + 1);
      const isSelected = String(selected || '') === value ? ' selected' : '';
      return '<option value="' + value + '"' + isSelected + '>' + name + '</option>';
    }))
    .join('');
}

function renderSignupGenderOptions(selected) {
  return signupGenders
    .map(([value, label]) => {
      const isSelected = String(selected || '') === value && value !== '' ? ' selected' : '';
      return '<option value="' + value + '"' + isSelected + '>' + label + '</option>';
    })
    .join('');
}

function renderSignupPage({ error, query = {} }) {
  const flowQuery = pickAuthFlowQuery(query);
  const errorPanel = error ? renderFieldError(error) : '';

  const body = `<div class="signup-progress">
          <div class="progress-bar-track">
            <div class="progress-bar-fill" id="signup-progress-fill" style="width: 20%;"></div>
          </div>
          <span class="progress-step-text" id="signup-step-indicator">Step 1 of 5</span>
        </div>
        <form method="post" action="/signup" id="signup-form" novalidate>
        ${renderFlowHiddenFields(flowQuery)}
        <input type="hidden" name="email" id="email" value="${escapeHtml(query.email || '')}" />
        <div id="form-error">${errorPanel}</div>
        ${renderSignupStepName(flowQuery, query)}
        ${renderSignupStepDetails(query)}
        ${renderSignupStepEmail(query)}
        ${renderSignupStepPassword()}
        ${renderSignupStepReview()}
      </form>
      <script>${renderSignupScript()}</script>`;

  return renderPage({
    title: 'Create Toggle Account',
    eyebrow: 'Create your Toggle Account',
    heading: 'Create a Toggle Account',
    description: 'Enter your name to get started.',
    body
  });
}

function buildSignupDate(month, day, year) {
  const m = Number(month);
  const d = Number(day);
  const y = Number(year);

  if (!m || !d || !y) {
    return null;
  }

  const date = new Date(Date.UTC(y, m - 1, d));
  if (date.getUTCDate() !== d || date.getUTCMonth() !== m - 1) {
    return null;
  }

  return date;
}

function renderSignupStepName(flowQuery, query) {
  return `<div class="signup-step" data-step="0">
          <div class="row-2">
            ${renderFloatingField({ name: 'firstName', label: 'First name', value: query.firstName || '', autocomplete: 'given-name' })}
            ${renderFloatingField({ name: 'lastName', label: 'Last name (optional)', value: query.lastName || '', autocomplete: 'family-name', required: false })}
          </div>
          <div class="hint">Use the name you are known by in everyday life.</div>
          <div class="bottom-row">
            <a class="text-link" href="${buildAuthPath('/login', flowQuery)}">Sign in instead</a>
            <button type="button" data-next>Next</button>
          </div>
        </div>`;
}

function renderSignupStepDetails(query) {
  const days = Array.from({ length: 31 }, (_, i) => {
    const d = String(i + 1);
    return '<option value="' + d + '"' + (String(query.day || '') === d ? ' selected' : '') + '>' + d + '</option>';
  }).join('');

  const years = Array.from({ length: 120 }, (_, i) => {
    const y = String(new Date().getUTCFullYear() - i);
    return '<option value="' + y + '"' + (String(query.year || '') === y ? ' selected' : '') + '>' + y + '</option>';
  }).join('');

  return `<div class="signup-step" data-step="1" hidden>
          <div class="row-3">
            <div class="field select-wrap">
              <select name="month" id="month">${renderSignupMonthOptions(query.month)}</select>
              <label for="month">Month</label>
            </div>
            <div class="field select-wrap">
              <select name="day" id="day"><option value="">Day</option>${days}</select>
              <label for="day">Day</label>
            </div>
            <div class="field select-wrap">
              <select name="year" id="year"><option value="">Year</option>${years}</select>
              <label for="year">Year</label>
            </div>
          </div>
          <div class="field select-wrap">
            <select name="gender" id="gender">${renderSignupGenderOptions(query.gender)}</select>
            <label for="gender">Gender</label>
          </div>
          <div class="hint">This helps us verify it's really you and secure your account.</div>
          <div class="bottom-row">
            <button type="button" class="button secondary" data-back>Back</button>
            <button type="button" data-next>Next</button>
          </div>
        </div>`;
}

function renderSignupStepEmail(query) {
  return `<div class="signup-step" data-step="2" hidden>
          <div class="chip-row" id="suggestion-chips"></div>
          <label class="checkbox-row">
            <input type="checkbox" id="custom-email-toggle" />
            Create your own email address
          </label>
          <div id="custom-email-wrap" hidden>
            ${renderFloatingField({ type: 'email', name: 'customEmail', id: 'customEmail', label: 'Your email address', value: query.email || '', autocomplete: 'email' })}
          </div>
          <div class="hint" id="email-status">Pick a suggested address or create your own.</div>
          <div class="bottom-row">
            <button type="button" class="button secondary" data-back>Back</button>
            <button type="button" data-next>Next</button>
          </div>
        </div>`;
}

function renderSignupStepPassword() {
  return `<div class="signup-step" data-step="3" hidden>
          ${renderFloatingField({ type: 'password', name: 'password', label: 'Password', autocomplete: 'new-password' })}
          ${renderFloatingField({ type: 'password', name: 'passwordConfirm', label: 'Confirm', autocomplete: 'new-password' })}
          <div class="hint">Use 8 or more characters with a mix of letters, numbers &amp; symbols.</div>
          <label class="checkbox-row">
            <input type="checkbox" id="show-password" />
            Show password
          </label>
          <div class="bottom-row">
            <button type="button" class="button secondary" data-back>Back</button>
            <button type="button" data-next>Next</button>
          </div>
        </div>`;
}

function renderSignupStepReview() {
  return `<div class="signup-step" data-step="4" hidden>
          <div class="review-list">
            <div class="review-item"><span class="review-label">Name</span><span class="review-value" id="review-name"></span></div>
            <div class="review-item"><span class="review-label">Birthday</span><span class="review-value" id="review-birthday"></span></div>
            <div class="review-item"><span class="review-label">Gender</span><span class="review-value" id="review-gender"></span></div>
            <div class="review-item"><span class="review-label">Email</span><span class="review-value" id="review-email"></span></div>
          </div>
          <div class="terms-box">
            By creating a Toggle Account, you agree to the Toggle <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
          </div>
          <label class="checkbox-row">
            <input type="checkbox" id="terms" />
            I agree to the Terms of Service and Privacy Policy
          </label>
          <div class="bottom-row">
            <button type="button" class="button secondary" data-back>Back</button>
            <button type="submit">Create account</button>
          </div>
        </div>`;
}

function renderSignupScript() {
  return [renderSignupScriptCore(), renderSignupScriptBehavior()].join('\n');
}

function renderSignupScriptCore() {
  return [
    '(function () {',
    '  var form = document.getElementById("signup-form");',
    '  if (!form) { return; }',
    '  var steps = Array.prototype.slice.call(form.querySelectorAll(".signup-step"));',
    '  var current = 0;',
    '  var titles = ["Create a Toggle Account", "Basic information", "Choose your email address", "Create a strong password", "Review your account info"];',
    '  var descs = [',
    '    "Enter your name to get started.",',
    '    "Enter your birthday and gender.",',
    '    "This will be your central Toggle sign-in.",',
    '    "Use 8 or more characters with a mix of letters, numbers & symbols.",',
    '    "Make sure everything looks right before you continue."',
    '  ];',
    '  var h1 = document.querySelector(".card-heading, .card h1");',
    '  var desc = document.querySelector(".card-desc, .card > p, .card p");',
    '  var errorSlot = document.getElementById("form-error");',
    '',
    '  function val(id) { var el = document.getElementById(id); return el ? String(el.value || "").trim() : ""; }',
    '  function mark(id, bad) { var el = document.getElementById(id); if (el) { el.setAttribute("aria-invalid", bad ? "true" : "false"); } }',
    '  function showError(msg) {',
    '    errorSlot.innerHTML = \'<div class="field-error" role="alert">\' +',
    '      \'<svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>\' +',
    '      \'<span></span></div>\';',
    '    errorSlot.querySelector("span").textContent = msg;',
    '  }',
    '  function clearError() { errorSlot.innerHTML = ""; }',
    '  function showStep(i) {',
    '    current = i;',
    '    steps.forEach(function (s, idx) { s.hidden = idx !== i; });',
    '    if (h1 && titles[i]) { h1.textContent = titles[i]; }',
    '    if (desc && descs[i]) { desc.textContent = descs[i]; }',
    '    var fill = document.getElementById("signup-progress-fill");',
    '    if (fill) { fill.style.width = ((i + 1) * 20) + "%"; }',
    '    var indicator = document.getElementById("signup-step-indicator");',
    '    if (indicator) { indicator.textContent = "Step " + (i + 1) + " of 5"; }',
    '    if (i === 4) { fillReview(); }',
    '  }',
    '  function sanitize(value) { return String(value || "").toLowerCase().replace(/[^a-z0-9]/g, ""); }',
    '  function buildSuggestions() {',
    '    var first = sanitize(val("firstName")) || "toggle";',
    '    var last = sanitize(val("lastName"));',
    '    var bases = [];',
    '    if (last) { bases.push(first + "." + last); bases.push(first + last); }',
    '    bases.push(first);',
    '    bases.push(first + (last || "") + Math.floor(10 + Math.random() * 90));',
    '    return bases.slice(0, 3).map(function (b) { return b + "@toggle.com"; });',
    '  }',
    '  function renderSuggestions() {',
    '    var wrap = document.getElementById("suggestion-chips");',
    '    if (!wrap) { return; }',
    '    wrap.innerHTML = "";',
    '    var currentEmail = val("email");',
    '    buildSuggestions().forEach(function (s) {',
    '      var chip = document.createElement("button");',
    '      chip.type = "button";',
    '      chip.className = "chip" + (s === currentEmail ? " selected" : "");',
    '      chip.setAttribute("data-email", s);',
    '      chip.textContent = s;',
    '      wrap.appendChild(chip);',
    '    });',
    '  }',
    '  function syncEmail() {',
    '    var toggle = document.getElementById("custom-email-toggle");',
    '    var email = document.getElementById("email");',
    '    if (toggle.checked) {',
    '      email.value = val("customEmail");',
    '    } else {',
    '      var selected = document.querySelector(".chip.selected");',
    '      if (selected) { email.value = selected.getAttribute("data-email"); }',
    '    }',
    '  }',
    '  function fillReview() {',
    '    var name = val("firstName") + (val("lastName") ? " " + val("lastName") : "");',
    '    var months = ["January","February","March","April","May","June","July","August","September","October","November","December"];',
    '    var m = val("month"); var d = val("day"); var y = val("year");',
    '    var birthday = m ? (months[Number(m) - 1] + " " + (d || "?") + ", " + (y || "?")) : "";',
    '    var genderSel = document.getElementById("gender");',
    '    var genderText = genderSel && genderSel.selectedIndex > 0 ? genderSel.options[genderSel.selectedIndex].text : "Not set";',
    '    document.getElementById("review-name").textContent = name || "-";',
    '    document.getElementById("review-birthday").textContent = birthday || "-";',
    '    document.getElementById("review-gender").textContent = genderText;',
    '    document.getElementById("review-email").textContent = val("email") || "-";',
    '  }',
    '  function validEmail(email) { return /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email); }'
  ].join('\n');
}

function renderSignupScriptBehavior() {
  return [
    '  function checkStep(idx, done) {',
    '    clearError();',
    '    if (idx === 0) {',
    '      var okName = val("firstName").length > 0 && val("firstName").length <= 80 && val("lastName").length <= 80;',
    '      mark("firstName", !val("firstName"));',
    '      if (!okName) { showError("Enter a first name (max 80 characters per field)."); }',
    '      return done(okName);',
    '    }',
    '    if (idx === 1) {',
    '      var m = Number(val("month")); var d = Number(val("day")); var y = Number(val("year"));',
    '      if (!m || !d || !y) { showError("Enter your full birthday."); return done(false); }',
    '      var dob = new Date(Date.UTC(y, m - 1, d));',
    '      if (dob.getUTCDate() !== d || dob.getUTCMonth() !== m - 1) { showError("Enter a valid birthday."); return done(false); }',
    '      var now = new Date();',
    '      if (dob > now) { showError("Your birthday cannot be in the future."); return done(false); }',
    '      var age = now.getUTCFullYear() - y - ((now.getUTCMonth() + 1 < m || (now.getUTCMonth() + 1 === m && now.getUTCDate() < d)) ? 1 : 0);',
    '      if (age < 13) { showError("You must be at least 13 years old to create a Toggle Account."); return done(false); }',
    '      return done(true);',
    '    }',
    '    if (idx === 2) {',
    '      syncEmail();',
    '      var email = val("email");',
    '      if (!validEmail(email)) { showError("Enter a valid email address."); return done(false); }',
    '      var status = document.getElementById("email-status");',
    '      status.textContent = "Checking if " + email + " is available...";',
    '      var xhr = new XMLHttpRequest();',
    '      xhr.open("GET", "/signup/check-email?email=" + encodeURIComponent(email), true);',
    '      xhr.onload = function () {',
    '        var data = null;',
    '        try { data = JSON.parse(xhr.responseText); } catch (e) { data = null; }',
    '        if (data && data.ok && data.available) {',
    '          status.textContent = email + " is available.";',
    '          done(true);',
    '        } else if (data && data.error) {',
    '          status.textContent = "";',
    '          showError(data.error);',
    '          done(false);',
    '        } else {',
    '          status.textContent = "";',
    '          showError("Could not verify that email. Please try again.");',
    '          done(false);',
    '        }',
    '      };',
    '      xhr.onerror = function () { showError("Could not verify that email. Please try again."); done(false); };',
    '      xhr.send();',
    '      return;',
    '    }',
    '    if (idx === 3) {',
    '      var p = val("password");',
    '      if (p.length < 8) { showError("Your password must be at least 8 characters long."); return done(false); }',
    '      if (p !== val("passwordConfirm")) { showError("Those passwords did not match. Try again."); return done(false); }',
    '      return done(true);',
    '    }',
    '    done(true);',
    '  }',
    '',
    '  form.addEventListener("click", function (event) {',
    '    var button = event.target.closest ? event.target.closest("button") : null;',
    '    if (!button) { return; }',
    '    if (button.hasAttribute("data-next")) {',
    '      event.preventDefault();',
    '      checkStep(current, function (ok) { if (ok) { showStep(current + 1); } });',
    '    } else if (button.hasAttribute("data-back")) {',
    '      event.preventDefault();',
    '      clearError();',
    '      showStep(Math.max(0, current - 1));',
    '    }',
    '  });',
    '',
    '  form.addEventListener("change", function (event) {',
    '    if (event.target.id === "custom-email-toggle") {',
    '      document.getElementById("custom-email-wrap").hidden = !event.target.checked;',
    '      if (!event.target.checked) { renderSuggestions(); }',
    '    }',
    '    if (event.target.id === "show-password") {',
    '      var type = event.target.checked ? "text" : "password";',
    '      ["password", "passwordConfirm"].forEach(function (id) { document.getElementById(id).type = type; });',
    '    }',
    '  });',
    '',
    '  form.addEventListener("click", function (event) {',
    '    var chip = event.target.closest ? event.target.closest(".chip") : null;',
    '    if (!chip) { return; }',
    '    event.preventDefault();',
    '    document.getElementById("email").value = chip.getAttribute("data-email");',
    '    Array.prototype.forEach.call(document.querySelectorAll(".chip"), function (c) { c.classList.toggle("selected", c === chip); });',
    '    document.getElementById("email-status").textContent = chip.getAttribute("data-email") + " selected.";',
    '  });',
    '',
    '  form.addEventListener("submit", function (event) {',
    '    event.preventDefault();',
    '    if (current !== 4) {',
    '      checkStep(current, function (ok) { if (ok) { showStep(current + 1); } });',
    '      return;',
    '    }',
    '    if (!document.getElementById("terms").checked) {',
    '      showError("You must agree to the Terms of Service and Privacy Policy.");',
    '      return;',
    '    }',
    '    syncEmail();',
    '    form.submit();',
    '  });',
    '',
    '  renderSuggestions();',
    '})();'
  ].join('\n');
}

function renderForgotPasswordPage({ error, query }) {
  const flowQuery = pickAuthFlowQuery(query);

  return renderPage({
    title: 'Forgot Password',
    eyebrow: 'Account Recovery',
    heading: 'Reset your password',
    description: 'Enter your email and we will generate a password reset link for your account.',
    body: `<form method="post" action="/forgot-password">
        ${renderFloatingField({ type: 'email', name: 'email', label: 'Email', value: query.email || '', autocomplete: 'email', invalid: Boolean(error) })}
        ${error ? renderFieldError(error) : ''}
        <div class="bottom-row">
          <a class="text-link" href="${buildAuthPath('/login', flowQuery)}">Back to sign in</a>
          <button type="submit">Send reset link</button>
        </div>
      </form>`
  });
}

function renderResetPasswordPage({ error, token, email }) {
  return renderPage({
    title: 'Choose a New Password',
    eyebrow: 'Account Recovery',
    heading: 'Create a new password',
    description: 'Pick a new password for your central Toggle account.',
    body: `${email ? renderAccountChip({ email }) : ''}
      <form method="post" action="/reset-password">
        <input type="hidden" name="token" value="${escapeHtml(token || '')}" />
        ${renderFloatingField({ type: 'password', name: 'password', label: 'New password', autocomplete: 'new-password', invalid: Boolean(error) })}
        ${error ? renderFieldError(error) : ''}
        <div class="hint">Use 8 or more characters with a mix of letters, numbers &amp; symbols.</div>
        <div class="bottom-row">
          <a class="text-link" href="/login">Back to sign in</a>
          <button type="submit">Update password</button>
        </div>
      </form>`
  });
}

function renderMessagePage({ title, eyebrow, heading, description, body, actions = '' }) {
  return renderPage({
    title,
    eyebrow,
    heading,
    description,
    body: `${body}${actions ? `<div class="actions">${actions}</div>` : ''}`
  });
}

function redirectWithCode({ redirectUri, code, state }) {
  const callbackUrl = new URL(redirectUri);
  callbackUrl.searchParams.set('code', code);

  if (state) {
    callbackUrl.searchParams.set('state', state);
  }

  return callbackUrl.toString();
}

router.post('/auth/login', async (req, res, next) => {
  try {
    const { email, password } = req.body ?? {};

    if (!email || !password) {
      return res.status(400).json({
        error: 'Email and password are required.'
      });
    }

    const authResult = await authenticateCredentials({ email, password, req });
    if (!authResult.ok) {
      return res.status(authResult.status).json({ error: authResult.error });
    }

    const accessToken = await signAccessToken({
      userId: authResult.user.userId,
      email: authResult.user.email,
      audience: config.defaultAudience
    });

    return res.status(200).json({
      access_token: accessToken,
      token_type: 'Bearer',
      expires_in: 900,
      user: {
        user_id: authResult.user.userId,
        email: authResult.user.email
      }
    });
  } catch (error) {
    return next(error);
  }
});

router.get('/', async (req, res, next) => {
  try {
    res.type('html').send(await renderAuthHome(req));
  } catch (error) {
    return next(error);
  }
});

router.get('/login', (req, res) => {
  const client = req.query.client_id ? getSsoClient(req.query.client_id) : null;
  res.type('html').send(renderLoginPage({ error: '', client, query: req.query }));
});

router.get('/signup', (req, res) => {
  res.type('html').send(renderSignupPage({ error: '', query: req.query }));
});

router.get('/signup/check-email', async (req, res, next) => {
  try {
    const email = String(req.query.email || '').trim();
    const availability = await isEmailAvailable({ email });
    return res.status(availability.ok ? 200 : 400).json(availability);
  } catch (error) {
    console.error('Email availability check failed:', error.message);
    return res.status(503).json({
      ok: false,
      available: false,
      error: 'The sign-up service is temporarily unavailable. Please make sure the database is running and try again.'
    });
  }
});

router.post('/signup', async (req, res, next) => {
  try {
    const {
      firstName = '',
      lastName = '',
      month = '',
      day = '',
      year = '',
      gender = '',
      email = '',
      password = '',
      passwordConfirm = '',
      client_id: clientId = '',
      redirect_uri: redirectUri = '',
      state = '',
      scope = '',
      code_challenge: codeChallenge = '',
      code_challenge_method: codeChallengeMethod = 'S256'
    } = req.body ?? {};

    const signupClient = clientId ? getSsoClient(clientId) : null;

    const formError = (message) =>
      renderSignupPage({ error: message, query: req.body ?? {} });

    const profile = validateProfile({ firstName, lastName, dateOfBirth: buildSignupDate(month, day, year), gender });
    if (!profile.ok) {
      return res.status(400).type('html').send(formError(profile.error));
    }

    if (!isValidEmailFormat(email)) {
      return res.status(400).type('html').send(formError('Enter a valid email address.'));
    }

    if (password !== passwordConfirm) {
      return res.status(400).type('html').send(formError('Those passwords did not match. Try again.'));
    }

    const availability = await isEmailAvailable({ email });
    if (!availability.ok) {
      return res.status(400).type('html').send(formError(availability.error));
    }
    if (!availability.available) {
      return res.status(409).type('html').send(formError('That email address is already taken. Try another.'));
    }

    if (clientId || redirectUri) {
      const validation = validateClientRequest(clientId, redirectUri);
      if (validation.error) {
        return res
          .status(400)
          .type('html')
          .send(formError(validation.error));
      }
    }

    const registration = await registerUser({
      email,
      password,
      firstName: profile.firstName,
      lastName: profile.lastName,
      dateOfBirth: profile.dateOfBirth,
      gender: profile.gender,
      req
    });
    if (!registration.ok) {
      return res
        .status(registration.status)
        .type('html')
        .send(formError(registration.error));
    }

    const verificationUrl = new URL(registration.verificationUrl);
    if (clientId) {
      verificationUrl.searchParams.set('client_id', clientId);
    }
    if (redirectUri) {
      verificationUrl.searchParams.set('redirect_uri', redirectUri);
    }
    if (state) {
      verificationUrl.searchParams.set('state', state);
    }
    if (scope) {
      verificationUrl.searchParams.set('scope', scope);
    }
    if (codeChallenge) {
      verificationUrl.searchParams.set('code_challenge', codeChallenge);
      verificationUrl.searchParams.set('code_challenge_method', codeChallengeMethod);
    }

    const displayName = profile.firstName || registration.email;

    const delivery = await sendAccountEmail({
      to: registration.email,
      subject: 'Verify your Toggle Account email',
      title: 'Verify your email',
      bodyText: `Welcome to Toggle! Confirm this email address to activate your account.`,
      linkText: 'Verify email',
      linkUrl: verificationUrl.toString()
    });

    const deliveryNote = delivery.delivered
      ? `A verification email was sent to <strong>${escapeHtml(registration.email)}</strong>.`
      : `Email delivery is not configured (${escapeHtml(delivery.reason)}). Use the link below while testing.`;

    return res.type('html').send(renderMessagePage({
      title: 'Verify Your Email',
      eyebrow: 'Account Setup',
      heading: registration.created ? `Almost there, ${displayName}` : 'Verification link refreshed',
      description: `Your Toggle account for <strong>${escapeHtml(registration.email)}</strong> is waiting for email verification.`,
      body: `<div class="account-chip">
          <span class="avatar" aria-hidden="true">${escapeHtml(displayName.charAt(0).toUpperCase())}</span>
          <span><strong>${escapeHtml(registration.email)}</strong><br />Pending email verification</span>
        </div>
        <div class="panel">
          <strong>Next step</strong>
          <p>${deliveryNote}</p>
          <p>After verifying, you will be signed in automatically${signupClient ? ` and sent back to <strong>${escapeHtml(signupClient.name)}</strong>` : ''}.</p>
        </div>
        ${renderDeveloperLinkPanel({ url: verificationUrl.toString() })}`,
      actions: `
        <a class="button" href="${escapeHtml(verificationUrl.toString())}">Verify email &amp; continue</a>
        <a class="button secondary" href="/">Back to account home</a>
      `
    }));
  } catch (error) {
    return next(error);
  }
});

router.get('/verify-email', async (req, res, next) => {
  try {
    const token = String(req.query.token || '');

    if (!token) {
      return res.status(400).type('html').send(renderMessagePage({
        title: 'Verification Error',
        eyebrow: 'Account Setup',
        heading: 'Missing verification link',
        description: 'We could not verify your email because the token was missing.',
        body: '<div class="panel error">Open the full verification link from the email or local development panel.</div>',
        actions: '<a class="button" href="/signup">Create account</a><a class="button secondary" href="/login">Back to sign in</a>'
      }));
    }

    const verification = await verifyEmailToken({ token, req });
    if (!verification.ok) {
      return res.status(verification.status).type('html').send(renderMessagePage({
        title: 'Verification Error',
        eyebrow: 'Account Setup',
        heading: 'This link could not be used',
        description: verification.error,
        body: '<div class="panel error">Request a fresh sign-up or verification link and try again.</div>',
        actions: '<a class="button" href="/signup">Create account</a><a class="button secondary" href="/login">Back to sign in</a>'
      }));
    }

    /* Google-style: after verifying, the user is signed in automatically. */
    const sessionId = await createLoginSession({
      userId: verification.userId,
      email: verification.email
    });
    setCookie(res, config.ssoSessionCookieName, sessionId, {
      httpOnly: true,
      sameSite: 'Lax',
      maxAge: 8 * 60 * 60
    });

    /* If the signup flow started from an app, continue back to it with a fresh code. */
    const {
      client_id: clientId = '',
      redirect_uri: redirectUri = '',
      state = ''
    } = req.query;

    if (clientId && redirectUri) {
      const validation = validateClientRequest(clientId, redirectUri);
      if (!validation.error) {
        /* Route through /authorize (now that the user is verified and signed in)
           so the consent screen is shown for first-time access. */
        return res.redirect(buildAuthPath('/authorize', {
          client_id: clientId,
          redirect_uri: redirectUri,
          state: String(req.query.state || ''),
          scope: String(req.query.scope || ''),
          code_challenge: String(req.query.code_challenge || ''),
          code_challenge_method: String(req.query.code_challenge_method || 'S256')
        }));
      }
    }

    /* No app in the flow: land on the account dashboard, like Google. */
    return res.redirect('/account');
  } catch (error) {
    return next(error);
  }
});

router.get('/forgot-password', (req, res) => {
  res.type('html').send(renderForgotPasswordPage({ error: '', query: req.query }));
});

router.post('/forgot-password', async (req, res, next) => {
  try {
    const { email = '' } = req.body ?? {};

    if (!email) {
      return res
        .status(400)
        .type('html')
        .send(renderForgotPasswordPage({ error: 'Email is required.', query: req.body ?? {} }));
    }

    const passwordReset = await requestPasswordReset({ email, req });

    let deliveryNote = '';
    if (passwordReset.resetUrl) {
      const delivery = await sendAccountEmail({
        to: passwordReset.email,
        subject: 'Reset your Toggle Account password',
        title: 'Password reset',
        bodyText: 'We received a request to reset the password for your account.',
        linkText: 'Reset password',
        linkUrl: passwordReset.resetUrl
      });

      deliveryNote = delivery.delivered
        ? `<p>A reset email was sent to <strong>${escapeHtml(passwordReset.email)}</strong>.</p>`
        : `<p>Email delivery is not configured (${escapeHtml(delivery.reason)}). Use the link below while testing.</p>`;
    }

    return res.type('html').send(renderMessagePage({
      title: 'Reset Link Created',
      eyebrow: 'Account Recovery',
      heading: 'Check your email',
      description: 'If that account can reset its password, a recovery link is now ready.',
      body: `<div class="panel">
        <strong>Next step</strong>
        <p>Use the reset link to choose a new password, then come back and sign in.</p>
        ${deliveryNote}
      </div>
      ${passwordReset.resetUrl ? renderDeveloperLinkPanel({ url: passwordReset.resetUrl }) : ''}`,
      actions: '<a class="button" href="/login">Back to sign in</a><a class="button secondary" href="/signup">Create account</a>'
    }));
  } catch (error) {
    return next(error);
  }
});

router.get('/reset-password', async (req, res, next) => {
  try {
    const token = String(req.query.token || '');

    if (!token) {
      return res.status(400).type('html').send(renderMessagePage({
        title: 'Reset Error',
        eyebrow: 'Account Recovery',
        heading: 'Missing reset link',
        description: 'We could not load the reset form because the token was missing.',
        body: '<div class="panel error">Open the full password reset link from the email or local development panel.</div>',
        actions: '<a class="button" href="/forgot-password">Request new link</a><a class="button secondary" href="/login">Back to sign in</a>'
      }));
    }

    const tokenStatus = await getPasswordResetTokenStatus(token);
    if (!tokenStatus.ok) {
      return res.status(400).type('html').send(renderMessagePage({
        title: 'Reset Error',
        eyebrow: 'Account Recovery',
        heading: 'This link could not be used',
        description: tokenStatus.error,
        body: '<div class="panel error">Request a fresh password reset link and try again.</div>',
        actions: '<a class="button" href="/forgot-password">Request new link</a><a class="button secondary" href="/login">Back to sign in</a>'
      }));
    }

    if (tokenStatus.status === 'pending_verification') {
      return res.status(403).type('html').send(renderMessagePage({
        title: 'Reset Not Available',
        eyebrow: 'Account Recovery',
        heading: 'Verify your email first',
        description: 'This account still needs email verification before password reset is available.',
        body: '<div class="panel error">Complete email verification, then sign in normally.</div>',
        actions: '<a class="button" href="/signup">Create account</a><a class="button secondary" href="/login">Back to sign in</a>'
      }));
    }

    return res.type('html').send(renderResetPasswordPage({
      error: '',
      token,
      email: tokenStatus.email
    }));
  } catch (error) {
    return next(error);
  }
});

router.post('/reset-password', async (req, res, next) => {
  try {
    const { token = '', password = '' } = req.body ?? {};

    if (!token || !password) {
      return res
        .status(400)
        .type('html')
        .send(renderResetPasswordPage({ error: 'A reset link and new password are required.', token }));
    }

    const resetResult = await resetPasswordWithToken({ token, password, req });
    if (!resetResult.ok) {
      return res
        .status(resetResult.status)
        .type('html')
        .send(renderResetPasswordPage({ error: resetResult.error, token }));
    }

    return res.type('html').send(renderMessagePage({
      title: 'Password Updated',
      eyebrow: 'Account Recovery',
      heading: 'Your password was updated',
      description: `${escapeHtml(resetResult.email)} can now sign in with the new password.`,
      body: '<div class="panel"><strong>Done</strong><p>Your account is ready for the normal Toggle sign-in flow again.</p></div>',
      actions: '<a class="button" href="/login">Sign in now</a><a class="button secondary" href="/">Back to account home</a>'
    }));
  } catch (error) {
    return next(error);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const {
      email = '',
      password = '',
      step = 'email',
      client_id: clientId = '',
      redirect_uri: redirectUri = '',
      state = ''
    } = req.body ?? {};

    const client = clientId ? getSsoClient(clientId) : null;

    if (clientId || redirectUri) {
      const validation = validateClientRequest(clientId, redirectUri);
      if (validation.error) {
        return res.status(400).type('html').send(renderLoginPage({
          error: validation.error,
          client: null,
          query: req.body ?? {}
        }));
      }
    }

    /* Step 1: email */
    if (step !== 'password') {
      if (!email) {
        return res
          .status(400)
          .type('html')
          .send(renderLoginEmailStep({ error: 'Enter an email.', client, query: req.body ?? {} }));
      }

      return res.type('html').send(renderLoginPasswordStep({ error: '', client, query: req.body ?? {} }));
    }

    /* Step 2: password */
    if (!email || !password) {
      return res
        .status(400)
        .type('html')
        .send(renderLoginPasswordStep({ error: 'Enter your password.', client, query: req.body ?? {} }));
    }

    const authResult = await authenticateCredentials({ email, password, req });
    if (!authResult.ok) {
      return res
        .status(authResult.status)
        .type('html')
        .send(renderLoginPasswordStep({
          error: authResult.error,
          client,
          query: req.body ?? {}
        }));
    }

    const sessionId = await createLoginSession(authResult.user);
    setCookie(res, config.ssoSessionCookieName, sessionId, {
      httpOnly: true,
      sameSite: 'Lax',
      maxAge: 8 * 60 * 60
    });

    if (clientId && redirectUri) {
      /* Route back through /authorize (now that the user has a session) so the
         consent screen is shown for first-time access instead of skipping it. */
      return res.redirect(buildAuthPath('/authorize', {
        client_id: clientId,
        redirect_uri: redirectUri,
        state,
        scope: req.body.scope || '',
        code_challenge: req.body.code_challenge || '',
        code_challenge_method: req.body.code_challenge_method || 'S256'
      }));
    }

    /* No app in the flow: land on the account dashboard, like Google. */
    return res.redirect('/account');
  } catch (error) {
    return next(error);
  }
});

router.get('/account', async (req, res, next) => {
  try {
    const cookies = parseCookies(req.headers.cookie);
    const sessionId = cookies[config.ssoSessionCookieName];
    const session = sessionId ? await readAuthSession(req) : null;
    if (!session) {
      return res.redirect('/login');
    }

    const summary = await getAccountSummary({ userId: session.userId });
    if (!summary.ok) {
      deleteLoginSession(sessionId);
      clearCookie(res, config.ssoSessionCookieName, { httpOnly: true, sameSite: 'Lax' });
      return res.redirect('/login');
    }

    return res.type('html').send(renderAccountDashboard({ account: summary.account }));
  } catch (error) {
    return next(error);
  }
});

function verifyPkce(verifier, challenge) {
  const computed = crypto.createHash('sha256').update(String(verifier)).digest('base64url');
  return computed === challenge;
}

async function issueAuthorizationCode({ client, user, scope, codeChallenge, codeChallengeMethod, state, res }) {
  const code = await createAuthorizationCode({
    clientId: client.clientId,
    redirectUri: client.redirectUri,
    user,
    codeChallenge,
    codeChallengeMethod,
    scope
  });

  return res.redirect(redirectWithCode({
    redirectUri: client.redirectUri,
    code,
    state
  }));
}

function authorizationErrorPage(res, description, errorText) {
  return res.status(400).type('html').send(renderPage({
    title: 'Authorization Error',
    eyebrow: 'Central SSO',
    heading: 'We could not complete sign-in',
    description,
    body: `<div class="panel error">${escapeHtml(errorText)}</div>`
  }));
}

router.get('/authorize', async (req, res, next) => {
  try {
    const {
      client_id: clientId = '',
      redirect_uri: redirectUri = '',
      state = '',
      scope = '',
      code_challenge: codeChallenge = '',
      code_challenge_method: codeChallengeMethod = ''
    } = req.query;

    const validation = validateClientRequest(clientId, redirectUri);
    if (validation.error) {
      return authorizationErrorPage(res, 'The client request was not valid.', validation.error);
    }

    const client = validation.client;

    /* PKCE is mandatory for browser flows. */
    if (!codeChallenge) {
      return authorizationErrorPage(res, 'The authorization request is missing code_challenge.', 'Browser authorization requests must use PKCE (code_challenge with S256).');
    }
    if (codeChallengeMethod && codeChallengeMethod !== 'S256') {
      return authorizationErrorPage(res, 'Only code_challenge_method=S256 is supported.', 'Unsupported PKCE method.');
    }

    /* Validate requested scope against what the client is allowed to ask for. */
    const requestedScopes = scope ? scope.split(' ').filter(Boolean) : [];
    const allowedScopes = client.scopes || [];
    if (requestedScopes.some(name => !allowedScopes.includes(name))) {
      return authorizationErrorPage(res, 'The app requested permissions it is not allowed to ask for.', 'Invalid scope requested.');
    }
    const normalizedScope = requestedScopes.join(' ');

    const session = await readAuthSession(req);
    if (!session) {
      const loginUrl = new URL('/login', config.authBaseUrl);
      loginUrl.searchParams.set('client_id', clientId);
      loginUrl.searchParams.set('redirect_uri', redirectUri);
      loginUrl.searchParams.set('scope', normalizedScope);
      loginUrl.searchParams.set('code_challenge', codeChallenge);
      loginUrl.searchParams.set('code_challenge_method', codeChallengeMethod || 'S256');
      if (state) {
        loginUrl.searchParams.set('state', state);
      }
      return res.redirect(loginUrl.toString());
    }

    /* Always confirm access, every time — like Google's app consent screen. */
    return res.type('html').send(renderConsentPage({
      client,
      user: session,
      scope: normalizedScope,
      codeChallenge,
      codeChallengeMethod: codeChallengeMethod || 'S256',
      state
    }));
  } catch (error) {
    return next(error);
  }
});

function renderConsentPage({ client, user, scope, codeChallenge, codeChallengeMethod, state }) {
  const scopeDescriptions = {
    offline_access:    { label: 'Stay signed in without re-entering your password',      icon: '<path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM12 17c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>' }
  };

  const scopeList = scope
    .split(' ')
    .filter(Boolean);

  const scopeItems = scopeList
    .map(name => {
      const desc = scopeDescriptions[name] || { label: 'Access to your Toggle account', icon: '<path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3zm-1 13H9v-2h2v2zm0-4H9V7h2v6zm4 4h-2v-2h2v2zm0-4h-2V7h2v6z"/>' };
      return `
      <li style="display:flex;align-items:flex-start;gap:12px;padding:10px 0;border-bottom:1px solid var(--g-border-subtle);">
        <span style="flex:none;width:32px;height:32px;border-radius:8px;background:var(--g-primary-container);display:inline-flex;align-items:center;justify-content:center;color:var(--g-primary);">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">${desc.icon}</svg>
        </span>
        <span style="display:flex;flex-direction:column;gap:2px;">
          <strong style="font-size:14px;font-weight:500;color:var(--g-text-primary);">${escapeHtml(desc.label)}</strong>
          <span style="font-size:12px;color:var(--g-text-tertiary);font-family:var(--font-body);">${escapeHtml(name)}</span>
        </span>
      </li>`;
    })
    .join('');

  // App icon: first letter of client name in a colored pill
  const appInitial = escapeHtml((client.name || '?')[0].toUpperCase());

  // User avatar: first letter of email
  const userInitial = escapeHtml((user.email || '?')[0].toUpperCase());

  const hidden = [
    ['client_id', client.clientId],
    ['redirect_uri', client.redirectUri],
    ['state', state],
    ['scope', scope],
    ['code_challenge', codeChallenge],
    ['code_challenge_method', codeChallengeMethod],
    ['decision', 'allow']
  ].map(([name, value]) => `<input type="hidden" name="${name}" value="${escapeHtml(value || '')}" />`).join('');

  const body = `
    <form method="post" action="/authorize/consent" id="consent-form">
      ${hidden}

      <!-- App + user identity banner -->
      <div style="display:flex;align-items:center;gap:14px;padding:14px 16px;background:var(--g-surface-subtle);border:1px solid var(--g-border-subtle);border-radius:14px;margin-bottom:18px;">
        <!-- App icon -->
        <div style="flex:none;width:44px;height:44px;border-radius:12px;background:linear-gradient(135deg,#1a73e8,#4285f4);display:flex;align-items:center;justify-content:center;color:#fff;font-family:var(--font-google);font-size:20px;font-weight:600;box-shadow:0 2px 8px rgba(26,115,232,0.35);">
          ${appInitial}
        </div>
        <div style="flex:1;min-width:0;">
          <div style="font-size:15px;font-weight:600;color:var(--g-text-primary);font-family:var(--font-google);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${escapeHtml(client.name)}</div>
          <div style="font-size:12px;color:var(--g-text-tertiary);margin-top:2px;">${escapeHtml(client.redirectUri)}</div>
        </div>
      </div>

      <!-- Signed-in account chip -->
      <div style="display:flex;align-items:center;gap:10px;padding:9px 14px;background:var(--card-bg);border:1px solid var(--g-border-subtle);border-radius:999px;width:fit-content;max-width:100%;margin-bottom:18px;">
        <div style="width:28px;height:28px;border-radius:50%;background:#1a73e8;color:#fff;font-family:var(--font-google);font-size:13px;font-weight:500;display:inline-flex;align-items:center;justify-content:center;flex:none;">${userInitial}</div>
        <span style="font-size:13px;color:var(--g-text-primary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${escapeHtml(user.email)}</span>
      </div>

      <!-- Permission list -->
      <div style="border:1px solid var(--g-border-subtle);border-radius:14px;padding:4px 16px;background:var(--g-surface-subtle);">
        <p style="font-size:13px;font-weight:600;color:var(--g-text-secondary);text-transform:uppercase;letter-spacing:0.5px;margin:14px 0 4px;">
          ${escapeHtml(client.name)} will be able to:
        </p>
        <ul style="list-style:none;margin:0;padding:0;">
          ${scopeItems}
          <!-- Last item has no bottom border -->
          <style>#consent-form li:last-child{border-bottom:0!important}</style>
        </ul>
      </div>

      <!-- Security note -->
      <div style="display:flex;align-items:flex-start;gap:10px;margin-top:14px;padding:11px 14px;border-radius:10px;background:var(--g-primary-container);border:1px solid rgba(168,199,250,0.18);">
        <svg style="flex:none;color:var(--g-primary);margin-top:1px;" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-1 14H9V9h2v6zm4 0h-2V9h2v6z"/>
        </svg>
        <span style="font-size:12px;color:var(--g-text-secondary);line-height:1.5;">
          Toggle will share your basic profile info with <strong style="color:var(--g-text-primary);">${escapeHtml(client.name)}</strong>. You can revoke access anytime from your Toggle Account settings.
        </span>
      </div>

      <!-- Action buttons -->
      <div class="bottom-row" style="margin-top:24px;">
        <a class="button secondary" href="/" id="consent-cancel-btn">Cancel</a>
        <button type="submit" id="consent-allow-btn">Allow access</button>
      </div>
    </form>`;

  return renderPage({
    title: `Sign in to ${client.name} — Toggle`,
    eyebrow: 'Authorization Request',
    eyebrowTone: 'neutral',
    heading: 'Are you sure?',
    description: `<strong>${escapeHtml(client.name)}</strong> is asking for permission to access your Toggle account.`,
    body,
    singleColumn: false
  });
}

router.post('/authorize/consent', async (req, res, next) => {
  try {
    const {
      client_id: clientId = '',
      redirect_uri: redirectUri = '',
      state = '',
      scope = '',
      code_challenge: codeChallenge = '',
      code_challenge_method: codeChallengeMethod = 'S256'
    } = req.body ?? {};

    const validation = validateClientRequest(clientId, redirectUri);
    const session = await readAuthSession(req);

    if (validation.error || !session) {
      const client = validation.client;
      const redirectTarget = new URL(client ? client.redirectUri : redirectUri);
      redirectTarget.searchParams.set('error', 'access_denied');
      if (state) {
        redirectTarget.searchParams.set('state', state);
      }
      return res.redirect(redirectTarget.toString());
    }

    await saveConsent({ userId: session.userId, clientId, scope });

    return await issueAuthorizationCode({
      client: validation.client,
      user: session,
      scope,
      codeChallenge,
      codeChallengeMethod,
      state,
      res
    });
  } catch (error) {
    return next(error);
  }
});

router.post('/token', async (req, res, next) => {
  try {
    const {
      grant_type: grantType = 'authorization_code',
      code = '',
      code_verifier: codeVerifier = '',
      refresh_token: refreshToken = '',
      client_id: clientId = '',
      redirect_uri: redirectUri = ''
    } = req.body ?? {};

    const validation = validateClientRequest(clientId, redirectUri);
    if (validation.error) {
      return res.status(400).json({ error: validation.error });
    }

    const audience = validation.client.audience;

    if (grantType === 'refresh_token') {
      const rotated = await rotateRefreshToken(refreshToken);
      if (!rotated || rotated.clientId !== clientId) {
        return res.status(400).json({ error: 'Refresh token is invalid, expired, or revoked.' });
      }

      const accessToken = await signAccessToken({
        userId: rotated.userId,
        email: (await getAccountSummary({ userId: rotated.userId })).account?.email || '',
        audience,
        scope: rotated.scope
      });

      return res.status(200).json({
        access_token: accessToken,
        token_type: 'Bearer',
        expires_in: 900,
        refresh_token: rotated.token,
        scope: rotated.scope
      });
    }

    if (grantType !== 'authorization_code') {
      return res.status(400).json({ error: 'Unsupported grant_type.' });
    }

    const authCode = await consumeAuthorizationCode(code);
    if (!authCode) {
      return res.status(400).json({ error: 'Authorization code is invalid or expired.' });
    }

    if (authCode.clientId !== clientId || authCode.redirectUri !== redirectUri) {
      return res.status(400).json({ error: 'Authorization code does not match the client request.' });
    }

    /* PKCE verification: the verifier must hash to the stored challenge. */
    if (authCode.codeChallenge) {
      if (!codeVerifier || !verifyPkce(codeVerifier, authCode.codeChallenge)) {
        return res.status(400).json({ error: 'PKCE verification failed.' });
      }
    }

    const accessToken = await signAccessToken({
      userId: authCode.user.userId,
      email: authCode.user.email,
      audience,
      scope: authCode.scope
    });

    const tokenResponse = {
      access_token: accessToken,
      token_type: 'Bearer',
      expires_in: 900,
      user: {
        user_id: authCode.user.userId,
        email: authCode.user.email
      }
    };

    if (authCode.scope) {
      tokenResponse.scope = authCode.scope;
    }

    /* Issue a rotating refresh token when the app asked for offline access. */
    if (authCode.scope.split(' ').includes('offline_access')) {
      tokenResponse.refresh_token = await createRefreshToken({
        userId: authCode.user.userId,
        clientId,
        scope: authCode.scope
      });
    }

    return res.status(200).json(tokenResponse);
  } catch (error) {
    return next(error);
  }
});

router.get('/logout', async (req, res, next) => {
  try {
    const cookies = parseCookies(req.headers.cookie);
    const sessionId = cookies[config.ssoSessionCookieName];

    if (sessionId) {
      const session = await getLoginSession(sessionId);
      if (session) {
        await revokeRefreshTokensForUser(session.userId);
      }
      await deleteLoginSession(sessionId);
    }

    clearCookie(res, config.ssoSessionCookieName, {
      httpOnly: true,
      sameSite: 'Lax'
    });

    res.redirect('/login');
  } catch (error) {
    return next(error);
  }
});

/* Public key set so resource servers can verify tokens without shared secrets. */
router.get('/.well-known/jwks.json', async (_req, res, next) => {
  try {
    const jwks = await getJwks();
    return res.status(200).json(jwks);
  } catch (error) {
    return next(error);
  }
});

export default router;
