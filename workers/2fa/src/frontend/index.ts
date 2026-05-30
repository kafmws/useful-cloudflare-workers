// src/frontend/index.ts
// The entire frontend is a single self-contained HTML string.
// Embedded here so it ships in the CF Worker bundle without any static file serving.

export const FRONTEND_HTML = /* html */`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>2FA Console</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500;700&family=IBM+Plex+Sans:wght@300;400;600&display=swap" rel="stylesheet">
<style>
:root{
  --bg:#07090d;--surf:#0e1117;--card:#131720;--border:#1c2333;
  --g:#00e87a;--b:#29b6f6;--r:#f97066;--y:#ffd166;
  --tx:#cdd9e5;--dim:#545d6a;--mono:'IBM Plex Mono',monospace;--sans:'IBM Plex Sans',sans-serif;
}
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth}
body{background:var(--bg);color:var(--tx);font-family:var(--sans);font-size:16px;min-height:100vh;overflow-x:hidden}

/* grid */
body::after{content:'';position:fixed;inset:0;background-image:linear-gradient(rgba(0,232,122,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(0,232,122,.03) 1px,transparent 1px);background-size:32px 32px;pointer-events:none;z-index:0}

.wrap{position:relative;z-index:1;max-width:900px;margin:0 auto;padding:0 16px 80px}

/* header */
header{padding:28px 0 20px;border-bottom:1px solid var(--border);margin-bottom:24px;display:flex;align-items:center;gap:14px}
.logo{width:42px;height:42px;background:var(--g);border-radius:6px;display:grid;place-items:center;font-family:var(--mono);font-weight:700;font-size:16px;color:#000;box-shadow:0 0 18px rgba(0,232,122,.3);flex-shrink:0}
.title{font-family:var(--mono);font-size:18px;font-weight:500;letter-spacing:.03em}
.title b{color:var(--g)}
.subtitle{font-family:var(--mono);font-size:16px;color:var(--dim);margin-top:2px}
.docs-link{margin-left:auto;font-family:var(--mono);font-size:16px;color:var(--dim);text-decoration:none;border:1px solid var(--border);padding:6px 12px;border-radius:4px;transition:all .15s}
.docs-link:hover{border-color:var(--g);color:var(--g)}

/* auth */
.auth{display:flex;gap:10px;align-items:center;background:var(--surf);border:1px solid var(--border);border-radius:7px;padding:12px 14px;margin-bottom:20px;flex-wrap:wrap}
.auth label{font-family:var(--mono);font-size:16px;color:var(--dim);white-space:nowrap}
.auth input{flex:1;background:transparent;border:none;outline:none;font-family:var(--mono);font-size:16px;color:var(--tx);min-width:180px}
.auth input::placeholder{color:var(--dim)}
.pill{font-family:var(--mono);font-size:16px;padding:4px 9px;border-radius:3px;border:1px solid;white-space:nowrap}
.pill-ok{border-color:var(--g);color:var(--g)}
.pill-err{border-color:var(--r);color:var(--r)}
.pill-idle{border-color:var(--dim);color:var(--dim)}
.pill-warn{border-color:var(--y);color:var(--y)}

/* tabs */
.tabs{display:flex;gap:1px;margin-bottom:0;flex-wrap:wrap}
.tab{font-family:var(--mono);font-size:16px;letter-spacing:.06em;padding:9px 18px;background:transparent;border:1px solid transparent;border-bottom:none;color:var(--dim);cursor:pointer;border-radius:5px 5px 0 0;transition:all .15s}
.tab:hover{color:var(--tx)}
.tab.on{background:var(--card);border-color:var(--border);color:var(--g);margin-bottom:-1px}

/* panels */
.panel{background:var(--card);border:1px solid var(--border);border-radius:0 7px 7px 7px;padding:20px;display:none}
.panel.on{display:block}

/* section label */
.slabel{font-family:var(--mono);font-size:16px;letter-spacing:.1em;color:var(--dim);text-transform:uppercase;margin-bottom:12px}

/* form */
.frow{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:10px}
.field{display:flex;flex-direction:column;gap:4px;flex:1;min-width:140px}
.field label{font-family:var(--mono);font-size:16px;color:var(--dim)}
.field input,.field select{background:var(--surf);border:1px solid var(--border);border-radius:5px;padding:10px 12px;font-family:var(--mono);font-size:16px;color:var(--tx);outline:none;transition:border-color .15s;width:100%}
.field input:focus,.field select:focus{border-color:var(--g)}
.field select option{background:var(--surf)}

/* buttons */
.btn{font-family:var(--mono);font-size:16px;letter-spacing:.04em;padding:8px 18px;border-radius:5px;border:none;cursor:pointer;transition:all .15s;white-space:nowrap}
.btn-p{background:var(--g);color:#000;font-weight:700}
.btn-p:hover{box-shadow:0 0 14px rgba(0,232,122,.4)}
.btn-g{background:transparent;border:1px solid var(--border);color:var(--tx)}
.btn-g:hover{border-color:var(--g);color:var(--g)}
.btn-d{background:transparent;border:1px solid var(--r);color:var(--r);font-size:16px;padding:6px 11px}
.btn-d:hover{background:rgba(249,112,102,.08)}
.btn:disabled{opacity:.4;cursor:not-allowed}

/* key cards */
.kgrid{display:flex;flex-direction:column;gap:7px}
.kcard{display:flex;align-items:center;gap:14px;background:var(--surf);border:1px solid var(--border);border-radius:6px;padding:11px 14px;transition:border-color .15s;flex-wrap:wrap}
.kcard:hover{border-color:var(--dim)}
.kname{font-family:var(--mono);font-weight:500;font-size:16px;flex:1}
.kmeta{font-family:var(--mono);font-size:16px;color:var(--dim)}
.kaccess{font-family:var(--mono);font-size:16px;color:var(--dim);flex-basis:100%;word-break:break-all}
.kbadge{font-family:var(--mono);font-size:16px;padding:4px 8px;border-radius:3px}
.btotp{background:rgba(0,232,122,.08);color:var(--g);border:1px solid rgba(0,232,122,.18)}
.bhotp{background:rgba(41,182,246,.08);color:var(--b);border:1px solid rgba(41,182,246,.18)}

/* otp cards */
.ogrid{display:flex;flex-direction:column;gap:9px}
.ocard{display:grid;grid-template-columns:120px 1fr auto auto;align-items:center;gap:12px;background:var(--surf);border:1px solid var(--border);border-radius:6px;padding:12px 16px}
.oname{font-family:var(--mono);font-size:16px;color:var(--dim);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.ocode{font-family:var(--mono);font-size:26px;font-weight:700;letter-spacing:.18em;color:var(--g);text-shadow:0 0 16px rgba(0,232,122,.35)}
.otimer{font-family:var(--mono);font-size:16px;color:var(--dim);text-align:right}
.tbar{height:2px;background:var(--border);border-radius:1px;overflow:hidden;margin-top:3px;width:48px}
.tfill{height:100%;background:var(--g);border-radius:1px;transition:width 1s linear}
.copybtn{font-family:var(--mono);font-size:16px;background:transparent;border:1px solid var(--border);color:var(--dim);padding:6px 11px;border-radius:4px;cursor:pointer;transition:all .15s;white-space:nowrap}
.copybtn:hover{border-color:var(--g);color:var(--g)}
.copybtn.done{border-color:var(--g);color:var(--g)}

/* lookup */
.lrow{display:flex;gap:9px;align-items:flex-end}

/* divider */
hr{border:none;border-top:1px solid var(--border);margin:18px 0}

/* empty */
.empty{text-align:center;padding:40px 20px;font-family:var(--mono);font-size:16px;color:var(--dim);line-height:2}
small{font-size:16px}

/* toast */
#toast{position:fixed;bottom:20px;right:20px;background:var(--card);border:1px solid var(--border);border-radius:6px;padding:10px 18px;font-family:var(--mono);font-size:16px;transform:translateY(70px);opacity:0;transition:all .25s cubic-bezier(.34,1.56,.64,1);z-index:999;max-width:300px}
#toast.show{transform:translateY(0);opacity:1}
#toast.ok{border-color:var(--g);color:var(--g)}
#toast.err{border-color:var(--r);color:var(--r)}

/* spinner */
.spin{display:inline-block;width:10px;height:10px;border:1.5px solid var(--dim);border-top-color:var(--g);border-radius:50%;animation:spin .5s linear infinite;vertical-align:middle;margin-right:5px}
@keyframes spin{to{transform:rotate(360deg)}}

/* auto-refresh row */
.arow{display:flex;align-items:center;gap:10px;margin-bottom:14px}
.ck{display:flex;align-items:center;gap:6px;font-family:var(--mono);font-size:16px;color:var(--dim);cursor:pointer}
.ck input{accent-color:var(--g)}

@media(max-width:580px){
  header{align-items:flex-start;flex-wrap:wrap}
  .docs-link{margin-left:0}
  .panel{border-radius:0 0 7px 7px;padding:16px}
  .ocard{grid-template-columns:1fr auto;grid-template-rows:auto auto auto}
  .oname{grid-column:1 / -1}
  .ocode{grid-column:1 / -1;font-size:22px}
  .otimer{grid-column:2;grid-row:2}
  .copybtn{grid-column:1;grid-row:2;justify-self:start}
}
</style>
</head>
<body>
<div class="wrap">

<header>
  <div class="logo">2FA</div>
  <div>
    <div class="title"><b>2FA</b> Console</div>
    <div class="subtitle">TOTP · HOTP · RFC 4226/6238</div>
  </div>
  <a class="docs-link" href="/openapi.json" target="_blank">openapi.json ↗</a>
</header>

<!-- auth bar -->
<div class="auth">
  <label>X-API-Key</label>
  <input type="password" id="apiKey" placeholder="paste API key…" autocomplete="off" spellcheck="false">
  <span class="pill pill-idle" id="authBadge">idle</span>
  <button class="btn btn-g" style="padding:6px 12px" onclick="checkAuth()">verify</button>
</div>

<!-- tabs -->
<div class="tabs">
  <button class="tab on"  onclick="tab('otp',this)">⏱ OTP</button>
  <button class="tab"     onclick="tab('keys',this)">🔑 Keys</button>
  <button class="tab"     onclick="tab('add',this)">＋ Add</button>
</div>

<!-- OTP panel -->
<div class="panel on" id="panel-otp">
  <p class="slabel">All TOTP codes</p>
  <div class="arow">
    <button class="btn btn-p" onclick="loadAll()">↻ Refresh all</button>
    <label class="ck"><input type="checkbox" id="autoRefresh" onchange="toggleAuto()"> auto (30s)</label>
  </div>
  <div class="ogrid" id="otpGrid"><div class="empty">Click Refresh to generate codes.</div></div>
  <hr>
  <p class="slabel">Single key lookup</p>
  <div class="lrow">
    <div class="field" style="flex:1"><label>Key name</label><input id="lname" placeholder="github" onkeydown="if(event.key==='Enter')lookup()"></div>
    <button class="btn btn-g" onclick="lookup()">Generate</button>
  </div>
  <div id="lookupOut" style="margin-top:10px"></div>
</div>

<!-- Keys panel -->
<div class="panel" id="panel-keys">
  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">
    <p class="slabel" style="margin:0">Keychain (admin)</p>
    <button class="btn btn-g" style="padding:6px 12px" onclick="loadKeys()">↻ Reload</button>
  </div>
  <div class="kgrid" id="keysGrid"><div class="empty">Click Reload to list keys.<br>Requires admin API key.</div></div>
</div>

<!-- Add panel -->
<div class="panel" id="panel-add">
  <p class="slabel">Add new key (admin)</p>
  <div class="frow">
    <div class="field"><label>Name *</label><input id="aname" placeholder="github" spellcheck="false"></div>
    <div class="field" style="flex:2"><label>Base32 Secret or otpauth URI *</label><input id="asecret" placeholder="otpauth://totp/service:account?secret=..." spellcheck="false"></div>
  </div>
  <div class="frow">
    <div class="field"><label>Type</label><select id="atype"><option value="totp">TOTP (time-based)</option><option value="hotp">HOTP (counter)</option></select></div>
    <div class="field"><label>Digits</label><select id="adigits"><option value="6">6 (default)</option><option value="7">7</option><option value="8">8</option></select></div>
  </div>
  <button class="btn btn-p" onclick="addKey()">Add key</button>
  <div id="addOut" style="margin-top:10px"></div>
  <p style="margin-top:10px;font-family:var(--mono);font-size:16px;color:var(--dim)">Secret is stored server-side only. Requires admin key.</p>
</div>

</div><!-- /wrap -->
<div id="toast"></div>

<script>
// ── state ─────────────────────────────────────────────────────────────────
const $ = id => document.getElementById(id);
const key = () => $('apiKey').value.trim();
let autoTimer = null;
let cardSeq = 0;

// ── api ───────────────────────────────────────────────────────────────────
async function api(method, path, body) {
  const r = await fetch(path, {
    method,
    headers: { 'X-API-Key': key(), 'Content-Type': 'application/json' },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw Object.assign(new Error(data.error || 'HTTP ' + r.status), { status: r.status });
  return data;
}

// ── tabs ──────────────────────────────────────────────────────────────────
function tab(name, el) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('on'));
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('on'));
  el.classList.add('on');
  $('panel-' + name).classList.add('on');
}

// ── auth ──────────────────────────────────────────────────────────────────
async function checkAuth() {
  const b = $('authBadge');
  b.className = 'pill pill-idle'; b.textContent = '…';
  try {
    await api('GET', '/api/v1/keys');
    b.className = 'pill pill-ok'; b.textContent = 'admin';
    toast('Admin key accepted');
  } catch(e) {
    if (e.status === 403) {
      b.className = 'pill pill-warn'; b.textContent = 'readonly';
      toast('Read-only key accepted');
      return;
    }
    b.className = 'pill pill-err'; b.textContent = 'fail';
    toast(e.message || 'Invalid key or server unreachable', 'err');
  }
}

// ── toast ─────────────────────────────────────────────────────────────────
function toast(msg, type='ok') {
  const t = $('toast');
  t.textContent = (type === 'ok' ? '✓ ' : '✗ ') + msg;
  t.className = 'show ' + type;
  clearTimeout(t._t);
  t._t = setTimeout(() => t.className = '', 2800);
}

// ── OTP ───────────────────────────────────────────────────────────────────
async function loadAll() {
  const g = $('otpGrid');
  g.innerHTML = '<div class="empty"><span class="spin"></span>generating…</div>';
  try {
    const d = await api('GET', '/api/v1/otp');
    if (!d.codes?.length) { g.innerHTML = '<div class="empty">No TOTP keys found.<br>Add keys in the Add tab.</div>'; return; }
    g.innerHTML = '';
    d.codes.forEach(c => g.appendChild(otpCard(c)));
    startTick();
  } catch(e) {
    g.innerHTML = '<div class="empty" style="color:var(--r)">✗ ' + e.message + '</div>';
  }
}

function otpCard(c) {
  const d = document.createElement('div');
  d.className = 'ocard'; d.dataset.name = c.name;
  const uid = 'otp-' + (++cardSeq);
  d.dataset.uid = uid;
  const hasTimer = c.validForSeconds !== undefined;
  if (hasTimer) d.dataset.vf = c.validForSeconds;
  const pct = ((c.validForSeconds ?? 30) / 30 * 100).toFixed(1);

  const name = document.createElement('div');
  name.className = 'oname';
  name.textContent = c.name;

  const code = document.createElement('div');
  code.className = 'ocode';
  code.id = uid + '-code';
  code.textContent = fmt(c.code, c.digits);

  const timer = document.createElement('div');
  timer.className = 'otimer';
  if (hasTimer) {
    const time = document.createElement('span');
    time.id = uid + '-tim';
    time.textContent = c.validForSeconds;
    const bar = document.createElement('div');
    bar.className = 'tbar';
    const fill = document.createElement('div');
    fill.className = 'tfill';
    fill.id = uid + '-bar';
    fill.style.width = pct + '%';
    bar.appendChild(fill);
    timer.append(time, 's', bar);
  } else {
    timer.textContent = c.otpType === 'hotp' ? 'counter ' + (c.counter ?? 0) : '';
  }

  const copy = document.createElement('button');
  copy.className = 'copybtn';
  copy.id = uid + '-cp';
  copy.type = 'button';
  copy.textContent = 'copy';
  copy.addEventListener('click', () => cp(uid));

  d.append(name, code, timer, copy);
  return d;
}

function fmt(code, digits) {
  const m = Math.floor(digits / 2);
  return code.slice(0, m) + ' ' + code.slice(m);
}

function esc(s) {
  return String(s).replace(/[&<>"']/g, c => {
    if (c === '&') return '&amp;';
    if (c === '<') return '&lt;';
    if (c === '>') return '&gt;';
    if (c === '"') return '&quot;';
    return '&#39;';
  });
}

function startTick() {
  clearInterval(window._tick);
  window._tick = setInterval(() => {
    document.querySelectorAll('.ocard').forEach(card => {
      if (card.dataset.vf === undefined) return;
      let v = parseInt(card.dataset.vf) - 1;
      if (v < 0) v = 29;
      card.dataset.vf = v;
      const t = $(card.dataset.uid + '-tim'), b = $(card.dataset.uid + '-bar');
      if (t) t.textContent = v;
      if (b) b.style.width = (v / 30 * 100).toFixed(1) + '%';
    });
  }, 1000);
}

function toggleAuto() {
  clearInterval(autoTimer);
  if ($('autoRefresh').checked) { autoTimer = setInterval(loadAll, 30000); toast('Auto-refresh on'); }
  else toast('Auto-refresh off');
}

async function lookup() {
  const name = $('lname').value.trim(); if (!name) return;
  const out = $('lookupOut');
  out.innerHTML = '<span class="spin"></span>';
  try {
    const c = await api('GET', '/api/v1/otp/' + encodeURIComponent(name));
    out.innerHTML = ''; out.appendChild(otpCard(c));
  } catch(e) {
    out.innerHTML = '<div style="font-family:var(--mono);font-size:16px;color:var(--r)">✗ ' + esc(e.message) + '</div>';
  }
}

async function cp(uid) {
  const el = $(uid + '-code'), btn = $(uid + '-cp');
  if (!el) return;
  const text = (el.textContent || '').replace(/\\s/g,'');
  try {
    await copyText(text);
    btn.textContent = 'copied!'; btn.classList.add('done');
    toast('Copied ' + text);
    setTimeout(() => { btn.textContent = 'copy'; btn.classList.remove('done'); }, 1400);
  } catch(e) {
    btn.textContent = 'failed';
    toast(e.message || 'Clipboard copy failed', 'err');
    setTimeout(() => { btn.textContent = 'copy'; }, 1400);
  }
}

async function copyText(text) {
  if (!text) throw new Error('Nothing to copy');

  if (navigator.clipboard && window.isSecureContext) {
    try {
      await Promise.race([
        navigator.clipboard.writeText(text),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Clipboard timeout')), 700)),
      ]);
      return;
    } catch {
      // Fall through to the legacy path below.
    }
  }

  const ta = document.createElement('textarea');
  ta.value = text;
  ta.setAttribute('readonly', '');
  ta.style.position = 'fixed';
  ta.style.left = '-9999px';
  ta.style.top = '0';
  document.body.appendChild(ta);
  ta.focus();
  ta.select();
  ta.setSelectionRange(0, ta.value.length);
  const ok = document.execCommand('copy');
  document.body.removeChild(ta);
  if (!ok) throw new Error('Clipboard permission denied');
}

// ── Keys ──────────────────────────────────────────────────────────────────
async function loadKeys() {
  const g = $('keysGrid');
  g.innerHTML = '<div class="empty"><span class="spin"></span>loading…</div>';
  try {
    const d = await api('GET', '/api/v1/keys');
    if (!d.keys?.length) { g.innerHTML = '<div class="empty">No keys yet.</div>'; return; }
    g.innerHTML = ''; d.keys.forEach(k => g.appendChild(keyCard(k)));
  } catch(e) {
    g.innerHTML = '<div class="empty" style="color:var(--r)">✗ ' + e.message + (e.status === 403 ? '<br><small>Admin key required</small>' : '') + '</div>';
  }
}

function keyCard(k) {
  const d = document.createElement('div');
  d.className = 'kcard';

  const name = document.createElement('div');
  name.className = 'kname';
  name.textContent = k.name;

  const badge = document.createElement('span');
  badge.className = 'kbadge b' + k.otpType;
  badge.textContent = k.otpType.toUpperCase();

  const meta = document.createElement('div');
  meta.className = 'kmeta';
  meta.textContent = k.digits + ' digits · ' + k.createdAt.slice(0,10);

  const access = document.createElement('div');
  access.className = 'kaccess';
  access.textContent = k.accessKey ? 'access ' + k.accessKey : 'access unavailable for legacy entry';

  const copyAccess = document.createElement('button');
  copyAccess.className = 'btn btn-g';
  copyAccess.type = 'button';
  copyAccess.textContent = 'copy access';
  copyAccess.disabled = !k.accessKey;
  copyAccess.addEventListener('click', async () => {
    if (!k.accessKey) return;
    await copyText(k.accessKey);
    toast('Access key copied');
  });

  const del = document.createElement('button');
  del.className = 'btn btn-d';
  del.type = 'button';
  del.textContent = 'delete';
  del.addEventListener('click', () => delKey(k.name, d));

  d.append(name, badge, meta, copyAccess, del, access);
  return d;
}

async function delKey(name, card) {
  if (!confirm('Delete key "' + name + '"? Cannot be undone.')) return;
  try {
    await api('DELETE', '/api/v1/keys/' + encodeURIComponent(name));
    if (card) card.remove();
    toast('Deleted "' + name + '"');
    if (!$('keysGrid').children.length) $('keysGrid').innerHTML = '<div class="empty">No keys yet.</div>';
  } catch(e) { toast(e.message, 'err'); }
}

// ── Add key ───────────────────────────────────────────────────────────────
function parseOtpAuthInput(raw) {
  if (!raw.trim().toLowerCase().startsWith('otpauth://')) return null;
  const url = new URL(raw.trim());
  if (url.protocol !== 'otpauth:') throw new Error('Invalid otpauth URI');
  const otpType = url.hostname.toLowerCase();
  if (otpType !== 'totp' && otpType !== 'hotp') throw new Error('otpauth type must be totp or hotp');
  const label = decodeURIComponent(url.pathname.replace(/^\\/+/, ''));
  const colon = label.indexOf(':');
  const labelIssuer = colon >= 0 ? label.slice(0, colon).trim() : '';
  const account = (colon >= 0 ? label.slice(colon + 1) : label).trim();
  const issuer = (url.searchParams.get('issuer') || labelIssuer).trim();
  const secret = (url.searchParams.get('secret') || '').trim().toUpperCase().replace(/\\s/g, '');
  if (!secret) throw new Error('otpauth URI must include a secret');
  return {
    name: labelIssuer || !issuer ? label.trim() : issuer + ':' + account,
    secret,
    otpType,
    digits: url.searchParams.get('digits') || '6',
  };
}

function applyOtpAuthInput() {
  const raw = $('asecret').value.trim();
  if (!raw.toLowerCase().startsWith('otpauth://')) return;
  try {
    const parsed = parseOtpAuthInput(raw);
    if (!parsed) return;
    $('aname').value = parsed.name;
    $('atype').value = parsed.otpType;
    if (['6','7','8'].includes(parsed.digits)) $('adigits').value = parsed.digits;
  } catch(e) {
    toast(e.message, 'err');
  }
}

async function addKey() {
  applyOtpAuthInput();
  const name = $('aname').value.trim();
  const rawSecret = $('asecret').value.trim();
  const secret = rawSecret.toLowerCase().startsWith('otpauth://')
    ? rawSecret
    : rawSecret.toUpperCase().replace(/\\s/g,'');
  const otpType = $('atype').value;
  const digits = parseInt($('adigits').value);
  if (!secret || (!name && !secret.toLowerCase().startsWith('otpauth://'))) { toast('Name and secret are required', 'err'); return; }
  try {
    const added = await api('POST', '/api/v1/keys', { name: name || undefined, secret, otpType, digits });
    toast('Key "' + added.name + '" added');
    $('aname').value = ''; $('asecret').value = '';
    $('addOut').innerHTML = '';
    if (added.code) $('addOut').appendChild(otpCard(added));
  } catch(e) { toast(e.message, 'err'); }
}

// ── init ──────────────────────────────────────────────────────────────────
const sk = localStorage.getItem('2fa_key');
if (sk) $('apiKey').value = sk;
$('apiKey').addEventListener('input', () => localStorage.setItem('2fa_key', $('apiKey').value));
$('asecret').addEventListener('paste', () => setTimeout(applyOtpAuthInput, 0));
$('asecret').addEventListener('blur', applyOtpAuthInput);
</script>
</body>
</html>`;
