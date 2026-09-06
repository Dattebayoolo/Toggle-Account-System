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
import { createAuthorizationCode, createLoginSession, deleteLoginSession, getLoginSession, consumeAuthorizationCode } from '../authStore.js';
import { clearCookie, parseCookies, setCookie } from '../../common/cookies.js';
import { escapeHtml, renderAccountChip, renderFieldError, renderGuestRow, renderPage } from '../../common/html.js';
import { signAccessToken } from '../../common/jwt.js';

const router = express.Router();

function readAuthSession(req) {
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
    state: source.state || ''
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

  return `<div class="field">
          <input type="${type}" name="${name}" id="${fieldId}" placeholder="${placeholder}" value="${escapeHtml(value)}"${autocompleteAttr}${ariaInvalid} required />
          <label for="${fieldId}">${escapeHtml(label)}</label>
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
  const firstName = account.first_name || '';
  const displayName = firstName || account.email;
  const fullName = [account.first_name, account.last_name].filter(Boolean).join(' ') || account.email;

  return renderPage({
    title: 'Toggle Account Dashboard',
    heading: `Welcome, ${displayName}`,
    description: 'Manage your central Toggle account and connected apps.',
    body: `<div class="account-chip">
          <span class="avatar" aria-hidden="true">${escapeHtml(displayName.charAt(0).toUpperCase())}</span>
          <span><strong>${escapeHtml(fullName)}</strong><br />${escapeHtml(account.email)}</span>
        </div>

        <div class="panel">
          <strong>Account details</strong>
          <div class="review-list" style="border: 0; padding: 8px 0 0; margin: 0;">
            <div class="review-item"><span class="review-label">Email</span><span class="review-value">${escapeHtml(account.email)}</span></div>
            <div class="review-item"><span class="review-label">Name</span><span class="review-value">${escapeHtml(fullName)}</span></div>
            <div class="review-item"><span class="review-label">Birthday</span><span class="review-value">${escapeHtml(formatDate(account.date_of_birth))}</span></div>
            <div class="review-item"><span class="review-label">Gender</span><span class="review-value">${escapeHtml(formatGender(account.gender))}</span></div>
            <div class="review-item"><span class="review-label">Member since</span><span class="review-value">${escapeHtml(formatDate(account.created_at))}</span></div>
            <div class="review-item"><span class="review-label">Last sign-in</span><span class="review-value">${escapeHtml(formatDate(account.last_login_at))}</span></div>
            <div class="review-item"><span class="review-label">Status</span><span class="review-value">${escapeHtml(account.status === 'active' ? 'Active' : account.status)}</span></div>
          </div>
        </div>

        <div class="panel">
          <strong>Your apps</strong>
          <p>Sign in to Toggle apps using this central account.</p>
        </div>
        <div class="chip-actions">
          <a class="button" href="/authorize?client_id=toggle-docs&redirect_uri=${encodeURIComponent(getSsoClient('toggle-docs').redirectUri)}">Continue to Toggle Docs</a>
          <a class="button secondary" href="/authorize?client_id=toggle-calendar&redirect_uri=${encodeURIComponent(getSsoClient('toggle-calendar').redirectUri)}">Continue to Toggle Calendar</a>
        </div>

        <div class="bottom-row">
          <a class="text-link" href="/forgot-password">Change password</a>
          <a class="button secondary" href="/logout">Sign out</a>
        </div>`
  });
}

function renderAuthHome(req) {
  const session = readAuthSession(req);
  const sessionPanel = session
    ? `${renderAccountChip({ email: session.email, note: 'Central Toggle session' })}
       <div class="bottom-row">
         <a class="text-link" href="/logout">Sign out</a>
         <a class="button" href="/authorize?client_id=toggle-docs&redirect_uri=${encodeURIComponent(getSsoClient('toggle-docs').redirectUri)}">Continue to Toggle Docs</a>
       </div>
       <div class="actions">
         <a class="button secondary" href="/authorize?client_id=toggle-calendar&redirect_uri=${encodeURIComponent(getSsoClient('toggle-calendar').redirectUri)}">Continue to Toggle Calendar</a>
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
    description: 'This central account signs you in to Toggle Docs, Toggle Calendar, and other Toggle apps.',
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

  const body = `<form method="post" action="/signup" id="signup-form" novalidate>
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
            ${renderFloatingField({ name: 'lastName', label: 'Last name (optional)', value: query.lastName || '', autocomplete: 'family-name' })}
          </div>
          <div class="hint">Use the name people call you in everyday life.</div>
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
            <div class="field"><select name="month" id="month">${renderSignupMonthOptions(query.month)}</select></div>
            <div class="field"><select name="day" id="day"><option value="">Day</option>${days}</select></div>
            <div class="field"><select name="year" id="year"><option value="">Year</option>${years}</select></div>
          </div>
          <div class="field"><select name="gender" id="gender">${renderSignupGenderOptions(query.gender)}</select></div>
          <div class="hint">This helps us confirm it is really you and keep your account safe.</div>
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
    '  var h1 = document.querySelector(".card h1");',
    '  var desc = document.querySelector(".card > p");',
    '  var errorSlot = document.getElementById("form-error");',
    '',
    '  function val(id) { var el = document.getElementById(id); return el ? String(el.value || "").trim() : ""; }',
    '  function mark(id, bad) { var el = document.getElementById(id); if (el) { el.setAttribute("aria-invalid", bad ? "true" : "false"); } }',
    '  function showError(msg) {',
    '    errorSlot.innerHTML = \'<div class="field-error" role="alert">\' +',
    '      \'<svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 100 20 10 10 0 000-20zm-1 5h2v8h-2V7zm0 10h2v2h-2v-2z"/></svg>\' +',
    '      \'<span></span></div>\';',
    '    errorSlot.querySelector("span").textContent = msg;',
    '  }',
    '  function clearError() { errorSlot.innerHTML = ""; }',
    '  function showStep(i) {',
    '    current = i;',
    '    steps.forEach(function (s, idx) { s.hidden = idx !== i; });',
    '    if (h1 && titles[i]) { h1.textContent = titles[i]; }',
    '    if (desc && descs[i]) { desc.textContent = descs[i]; }',
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
      audience: ['toggle-docs', 'toggle-calendar']
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

router.get('/', (req, res) => {
  res.type('html').send(renderAuthHome(req));
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
      state = ''
    } = req.body ?? {};

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

    const displayName = profile.firstName || registration.email;

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
          <p>Open the verification link to activate your account. After verifying, you will be signed in automatically${client ? ` and sent back to <strong>${escapeHtml(client.name)}</strong>` : ''}.</p>
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
    const sessionId = createLoginSession({
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
        const code = createAuthorizationCode({
          clientId,
          redirectUri,
          user: {
            userId: verification.userId,
            email: verification.email
          }
        });

        return res.redirect(redirectWithCode({
          redirectUri: validation.client.redirectUri,
          code,
          state
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

    return res.type('html').send(renderMessagePage({
      title: 'Reset Link Created',
      eyebrow: 'Account Recovery',
      heading: 'Check your email',
      description: 'If that account can reset its password, a recovery link is now ready.',
      body: `<div class="panel">
        <strong>Next step</strong>
        <p>Use the reset link to choose a new password, then come back and sign in.</p>
      </div>
      ${renderDeveloperLinkPanel({ url: passwordReset.resetUrl })}`,
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

    const sessionId = createLoginSession(authResult.user);
    setCookie(res, config.ssoSessionCookieName, sessionId, {
      httpOnly: true,
      sameSite: 'Lax',
      maxAge: 8 * 60 * 60
    });

    if (clientId && redirectUri) {
      const validation = validateClientRequest(clientId, redirectUri);
      const code = createAuthorizationCode({
        clientId,
        redirectUri,
        user: authResult.user
      });

      return res.redirect(redirectWithCode({
        redirectUri: validation.client.redirectUri,
        code,
        state
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
    const session = sessionId ? readAuthSession(req) : null;
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

router.get('/authorize', (req, res) => {
  const {
    client_id: clientId = '',
    redirect_uri: redirectUri = '',
    state = ''
  } = req.query;

  const validation = validateClientRequest(clientId, redirectUri);
  if (validation.error) {
    return res.status(400).type('html').send(renderPage({
      title: 'Authorization Error',
      eyebrow: 'Central SSO',
      heading: 'We could not complete sign-in',
      description: 'The client request was not valid.',
      body: `<div class="panel error">${escapeHtml(validation.error)}</div>`
    }));
  }

  const session = readAuthSession(req);
  if (!session) {
    const loginUrl = new URL('/login', config.authBaseUrl);
    loginUrl.searchParams.set('client_id', clientId);
    loginUrl.searchParams.set('redirect_uri', redirectUri);
    if (state) {
      loginUrl.searchParams.set('state', state);
    }
    return res.redirect(loginUrl.toString());
  }

  const code = createAuthorizationCode({
    clientId,
    redirectUri,
    user: session
  });

  return res.redirect(redirectWithCode({ redirectUri, code, state }));
});

router.post('/token', async (req, res, next) => {
  try {
    const {
      code = '',
      client_id: clientId = '',
      redirect_uri: redirectUri = ''
    } = req.body ?? {};

    const validation = validateClientRequest(clientId, redirectUri);
    if (validation.error) {
      return res.status(400).json({ error: validation.error });
    }

    const authCode = consumeAuthorizationCode(code);
    if (!authCode) {
      return res.status(400).json({ error: 'Authorization code is invalid or expired.' });
    }

    if (authCode.clientId !== clientId || authCode.redirectUri !== redirectUri) {
      return res.status(400).json({ error: 'Authorization code does not match the client request.' });
    }

    const accessToken = await signAccessToken({
      userId: authCode.user.userId,
      email: authCode.user.email,
      audience: validation.client.audience
    });

    return res.status(200).json({
      access_token: accessToken,
      token_type: 'Bearer',
      expires_in: 900,
      user: {
        user_id: authCode.user.userId,
        email: authCode.user.email
      }
    });
  } catch (error) {
    return next(error);
  }
});

router.get('/logout', (req, res) => {
  const cookies = parseCookies(req.headers.cookie);
  const sessionId = cookies[config.ssoSessionCookieName];

  if (sessionId) {
    deleteLoginSession(sessionId);
  }

  clearCookie(res, config.ssoSessionCookieName, {
    httpOnly: true,
    sameSite: 'Lax'
  });

  res.redirect('/login');
});

export default router;
