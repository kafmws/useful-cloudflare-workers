/* ═══════════════════════════════════════════════════════════════
   RUNTIME CONFIGURATION
   Public browser config is loaded from /api/config.
═══════════════════════════════════════════════════════════════ */
const CONFIG_API_PATH = '/api/config';
const REGISTER_API_PATH = '/api/register';
const ALLOWED_EMAIL_DOMAIN = 'qq.com';
const MAX_RECORDS = 10000;
const appConfig = {
  SUPABASE_URL: '',
  SUPABASE_PUBLISHABLE_KEY: '',
  TURNSTILE_SITE_KEY: '',
};

/* ═══════════════════════════════════════════════════════════════
   I18N — TRANSLATIONS
═══════════════════════════════════════════════════════════════ */
const I18N = {
  zh: {
    authTagline:    'Days Count · 倒计时与纪念日',
    login:          '登录',
    register:       '注册',
    email:          '邮箱',
    password:       '密码',
    confirmPwd:     '确认密码',
    loginBtn:       '登录',
    registerBtn:    '注册账号',
    filterAll:      '全部',
    filterUpcoming: '即将到来',
    filterPast:     '已过去',
    filterToday:    '今天',
    filterAnnual:   '周年',
    searchPlaceholder: '搜索...',
    emptyTitle:     '还没有日子',
    emptyDesc:      '点击右下角的 + 开始记录重要的日子',
    emptySearch:    '没有找到匹配的日子',
    modalAdd:       '添加日子',
    modalEdit:      '编辑日子',
    flName:         '名称',
    flDate:         '日期',
    flEmoji:        '图标',
    flColor:        '颜色',
    flNote:         '备注',
    flAnnual:       '是否每年重复',
    namePlaceholder: '给这个日子起个名字',
    notePlaceholder: '可选备注',
    customEmojiPlaceholder: '或输入自定义 emoji',
    delete:         '删除',
    save:           '保存',
    settings:       '设置',
    export:         '导出数据',
    exportSub:      '下载为 JSON 文件',
    import:         '导入数据',
    importSub:      '从 JSON 文件导入',
    logout:         '退出登录',
    daysUntil:      '天后',
    daysAgo:        '天前',
    today:          '今天',
    days:           '天',
    weeks:          '周',
    months:         '月',
    years:          '年',
    daysLabel:      '天数',
    weeksLabel:     '周数',
    monthsLabel:    '月数',
    annualLabel:    '第 {n} 次',
    nextAnnualLabel:'距下次 {n} 天',
    recordCount:    '{n} / 10,000 条记录',
    deleteConfirm:  '确认删除',
    deleteMsg:      '确定要删除这个日子吗？',
    cancel:         '取消',
    confirm:        '确认',
    toastSaved:     '已保存 ✓',
    toastDeleted:   '已删除',
    toastExported:  '已导出',
    toastImported:  '已导入 {n} 条记录',
    toastImportErr: '导入失败：格式错误',
    toastMaxErr:    '已达到 10,000 条记录上限',
    toastSyncErr:   '同步失败，已保存到本地',
    errEmail:       '请输入有效邮箱',
    errPwd:         '密码至少 8 位字符',
    errPwdMatch:    '两次密码不一致',
    errEmailDomain: '仅支持 QQ 邮箱注册',
    errTurnstile:   '请先完成人机验证',
    errLoginFail:   '邮箱或密码错误',
    errEmailNotConfirmed: '邮箱尚未验证，请点击注册邮件中的链接完成验证后再登录',
    errCaptcha:     '人机验证失败，请重试',
    errRegFail:     '注册失败，请重试',
    regSuccess:     '注册成功！请检查邮箱中的验证链接，验证后即可登录',
    langBtn:        'EN',
  },
  en: {
    authTagline:    'Countdown & Memories',
    login:          'Login',
    register:       'Sign Up',
    email:          'Email',
    password:       'Password',
    confirmPwd:     'Confirm Password',
    loginBtn:       'Login',
    registerBtn:    'Create Account',
    filterAll:      'All',
    filterUpcoming: 'Upcoming',
    filterPast:     'Past',
    filterToday:    'Today',
    filterAnnual:   'Annual',
    searchPlaceholder: 'Search...',
    emptyTitle:     'No events yet',
    emptyDesc:      'Tap + to add your first important date',
    emptySearch:    'No events match your search',
    modalAdd:       'Add Event',
    modalEdit:      'Edit Event',
    flName:         'Name',
    flDate:         'Date',
    flEmoji:        'Icon',
    flColor:        'Color',
    flNote:         'Note',
    flAnnual:       'Repeat annually',
    namePlaceholder: 'Name this date',
    notePlaceholder: 'Optional note',
    customEmojiPlaceholder: 'Or enter custom emoji',
    delete:         'Delete',
    save:           'Save',
    settings:       'Settings',
    export:         'Export Data',
    exportSub:      'Download as JSON',
    import:         'Import Data',
    importSub:      'Import from JSON file',
    logout:         'Sign Out',
    daysUntil:      'days to go',
    daysAgo:        'days ago',
    today:          'Today',
    days:           'days',
    weeks:          'weeks',
    months:         'months',
    years:          'years',
    daysLabel:      'Days',
    weeksLabel:     'Weeks',
    monthsLabel:    'Months',
    annualLabel:    'Year {n}',
    nextAnnualLabel:'{n} days to next',
    recordCount:    '{n} / 10,000 records',
    deleteConfirm:  'Delete Event',
    deleteMsg:      'Are you sure you want to delete this event?',
    cancel:         'Cancel',
    confirm:        'Confirm',
    toastSaved:     'Saved ✓',
    toastDeleted:   'Deleted',
    toastExported:  'Exported',
    toastImported:  'Imported {n} records',
    toastImportErr: 'Import failed: invalid format',
    toastMaxErr:    'You have reached the 10,000 record limit',
    toastSyncErr:   'Sync failed, saved locally',
    errEmail:       'Please enter a valid email',
    errPwd:         'Password must be at least 8 characters',
    errPwdMatch:    'Passwords do not match',
    errEmailDomain: 'Only QQ email registration is allowed',
    errTurnstile:   'Please complete the verification first',
    errLoginFail:   'Invalid email or password',
    errEmailNotConfirmed: 'Email not verified yet. Click the link in your sign-up email, then log in.',
    errCaptcha:     'Verification failed, please try again',
    errRegFail:     'Registration failed, please try again',
    regSuccess:     'Account created! Check your email for the verification link, then log in.',
    langBtn:        '中',
  }
};

/* ═══════════════════════════════════════════════════════════════
   APP STATE
═══════════════════════════════════════════════════════════════ */
let lang = localStorage.getItem('dc_lang') || 'zh';
let currentUser = null;
let events = [];          // Array of event objects
let currentFilter = 'all';
let searchQuery = '';
let editingEventId = null;
let currentDetailId = null;
let isAnnualToggle = false;
let supabaseClient = null;

// Turnstile widgets keyed by auth form. Sign-in needs a captcha token too when
// Supabase "Bot and Abuse Protection" is enabled; the token is ignored if it isn't.
const turnstile = {
  login:    { containerId: 'login-turnstile', widgetId: null, token: '' },
  register: { containerId: 'turnstile-widget', widgetId: null, token: '' },
};
let turnstileRenderAttempts = 0;

/* ═══════════════════════════════════════════════════════════════
   INIT
═══════════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', async () => {
  bindUIEvents();
  try {
    await loadRuntimeConfig();

    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }

    // Init Supabase (gracefully handle missing credentials)
    try {
      if (appConfig.SUPABASE_URL && appConfig.SUPABASE_PUBLISHABLE_KEY) {
        supabaseClient = window.supabase.createClient(appConfig.SUPABASE_URL, appConfig.SUPABASE_PUBLISHABLE_KEY);
      }
    } catch (e) { console.warn('Supabase init skipped:', e.message); }

    applyLang();
    renderEmojiPicker();
    renderColorPicker();
    renderTurnstileWidget('login');
    setTodayAsDefault();

    if (supabaseClient) {
      // Check existing session
      const { data: { session } } = await supabaseClient.auth.getSession();
      if (session?.user) {
        currentUser = session.user;
        await loadEventsFromSupabase();
        showMain();
      } else {
        showAuth();
      }

      // Listen for auth changes
      supabaseClient.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          currentUser = session.user;
          await loadEventsFromSupabase();
          showMain();
        } else if (event === 'SIGNED_OUT') {
          currentUser = null;
          events = [];
          showAuth();
        }
      });
    } else {
      // Offline/demo mode: load from localStorage
      loadFromLocalStorage();
      showMain();
    }
  } catch (err) {
    console.error('App initialization failed:', err);
    loadFromLocalStorage();
    showMain();
  } finally {
    hideLoadingScreen();
  }
});

function hideLoadingScreen() {
  setTimeout(() => {
    const ls = document.getElementById('loading-screen');
    if (!ls) return;
    ls.classList.add('fade-out');
    setTimeout(() => ls.classList.add('is-gone'), 400);
  }, 600);
}

/* ═══════════════════════════════════════════════════════════════
   I18N HELPERS
═══════════════════════════════════════════════════════════════ */
function t(key, vars = {}) {
  let str = I18N[lang][key] || I18N['zh'][key] || key;
  for (const [k, v] of Object.entries(vars)) str = str.replace(`{${k}}`, v);
  return str;
}

function applyLang() {
  const zh = lang === 'zh';
  document.documentElement.lang = zh ? 'zh-CN' : 'en';

  setText('auth-tagline', t('authTagline'));
  setText('t-login', t('login'));
  setText('t-register', t('register'));
  setText('l-email', t('email'));
  setText('l-password', t('password'));
  setText('r-email', t('email'));
  setText('r-password', t('password'));
  setText('r-password2', t('confirmPwd'));
  setText('t-loginbtn', t('loginBtn'));
  setText('t-registerbtn', t('registerBtn'));
  setText('chip-all', t('filterAll'));
  setText('chip-upcoming', t('filterUpcoming'));
  setText('chip-past', t('filterPast'));
  setText('chip-today', t('filterToday'));
  setText('chip-annual', t('filterAnnual'));
  setAttr('search-input', 'placeholder', t('searchPlaceholder'));
  setText('empty-title', t('emptyTitle'));
  setText('empty-desc', t('emptyDesc'));
  setText('fl-name', t('flName'));
  setText('fl-date', t('flDate'));
  setText('fl-emoji', t('flEmoji'));
  setText('fl-color', t('flColor'));
  setText('fl-note', t('flNote'));
  setText('fl-annual', t('flAnnual'));
  setAttr('field-name', 'placeholder', t('namePlaceholder'));
  setAttr('field-note', 'placeholder', t('notePlaceholder'));
  setAttr('field-custom-emoji', 'placeholder', t('customEmojiPlaceholder'));
  setText('t-delete', t('delete'));
  setText('t-save', t('save'));
  setText('t-settings', t('settings'));
  setText('t-export', t('export'));
  setText('t-export-sub', t('exportSub'));
  setText('t-import', t('import'));
  setText('t-import-sub', t('importSub'));
  setText('t-logout', t('logout'));
  setText('lang-toggle-btn', t('langBtn'));

  updateRecordCountDisplay();
  if (document.getElementById('main-screen')?.classList.contains('hidden') === false) {
    renderCards();
  }
}

function toggleLang() {
  lang = lang === 'zh' ? 'en' : 'zh';
  localStorage.setItem('dc_lang', lang);
  applyLang();
}

function setText(id, str) {
  const el = document.getElementById(id);
  if (el) el.textContent = str;
}

function setAttr(id, attr, val) {
  const el = document.getElementById(id);
  if (el) el.setAttribute(attr, val);
}

async function loadRuntimeConfig() {
  try {
    const response = await fetch(CONFIG_API_PATH, {
      cache: 'no-store',
      headers: { accept: 'application/json' },
    });
    if (!response.ok) throw new Error(`Config request failed: ${response.status}`);
    const config = await response.json();
    appConfig.SUPABASE_URL = String(config.SUPABASE_URL || '');
    appConfig.SUPABASE_PUBLISHABLE_KEY = String(config.SUPABASE_PUBLISHABLE_KEY || '');
    appConfig.TURNSTILE_SITE_KEY = String(config.TURNSTILE_SITE_KEY || '');
  } catch (err) {
    console.warn('Runtime config unavailable; starting in local-only mode:', err.message);
  }
}

function bindUIEvents() {
  document.getElementById('tab-login')?.addEventListener('click', () => switchAuthTab('login'));
  document.getElementById('tab-register')?.addEventListener('click', () => switchAuthTab('register'));
  document.getElementById('btn-login')?.addEventListener('click', handleLogin);
  document.getElementById('btn-register')?.addEventListener('click', handleRegister);
  document.getElementById('lang-toggle-btn')?.addEventListener('click', toggleLang);
  document.getElementById('btn-open-menu')?.addEventListener('click', openMenu);
  document.getElementById('search-input')?.addEventListener('input', onSearch);
  document.querySelectorAll('.chip').forEach((chip) => {
    chip.addEventListener('click', () => setFilter(chip.dataset.filter));
  });
  document.getElementById('fab')?.addEventListener('click', openAddModal);
  document.getElementById('btn-close-detail')?.addEventListener('click', closeDetail);
  document.getElementById('btn-edit-detail')?.addEventListener('click', editCurrentEvent);
  document.getElementById('btn-close-add-modal')?.addEventListener('click', closeAddModal);
  document.getElementById('toggle-annual')?.addEventListener('click', toggleAnnual);
  document.getElementById('btn-delete-event')?.addEventListener('click', deleteCurrentEditEvent);
  document.getElementById('btn-save-event')?.addEventListener('click', saveEvent);
  document.getElementById('btn-close-menu')?.addEventListener('click', closeMenu);
  bindMenuAction('btn-export', handleExport);
  bindMenuAction('btn-import', triggerImport);
  bindMenuAction('btn-logout', handleLogout);
  document.getElementById('import-file')?.addEventListener('change', handleImport);
}

function bindMenuAction(id, handler) {
  const el = document.getElementById(id);
  if (!el) return;
  el.addEventListener('click', handler);
  el.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handler();
    }
  });
}

function setHidden(elOrId, hidden) {
  const el = typeof elOrId === 'string' ? document.getElementById(elOrId) : elOrId;
  if (el) el.classList.toggle('is-hidden', hidden);
}

function hideFeedback(el) {
  if (!el) return;
  el.textContent = '';
  el.classList.remove('is-visible');
}

function showFeedback(el, msg) {
  if (!el) return;
  el.textContent = msg;
  el.classList.add('is-visible');
}

function setButtonLoading(btn, loading, labelId, labelText) {
  btn.disabled = loading;
  if (loading) {
    const spinner = document.createElement('span');
    spinner.className = 'spinner';
    btn.replaceChildren(spinner);
    return;
  }

  const label = document.createElement('span');
  label.id = labelId;
  label.textContent = labelText;
  btn.replaceChildren(label);
}

/* ═══════════════════════════════════════════════════════════════
   SUPABASE DATABASE OPERATIONS
═══════════════════════════════════════════════════════════════ */
async function loadEventsFromSupabase() {
  if (!supabaseClient || !currentUser) { loadFromLocalStorage(); return; }
  try {
    const { data, error } = await supabaseClient
      .from('events')
      .select('*')
      .eq('user_id', currentUser.id)
      .order('created_at', { ascending: false })
      .limit(MAX_RECORDS);

    if (error) throw error;
    events = (data || []).map(dbRowToEvent);
    saveToLocalStorage();
    renderCards();
    updateRecordCountDisplay();
  } catch (err) {
    console.error('Load error:', err);
    loadFromLocalStorage();
    renderCards();
  }
}

async function upsertEventToSupabase(event) {
  if (!supabaseClient || !currentUser) { saveToLocalStorage(); return; }
  const row = eventToDbRow(event);
  const { error } = await supabaseClient.from('events').upsert(row, { onConflict: 'id' });
  if (error) throw error;
}

async function deleteEventFromSupabase(id) {
  if (!supabaseClient || !currentUser) { saveToLocalStorage(); return; }
  const { error } = await supabaseClient
    .from('events')
    .delete()
    .eq('id', id)
    .eq('user_id', currentUser.id);
  if (error) throw error;
}

function eventToDbRow(event) {
  return {
    id: event.id,
    user_id: currentUser?.id,
    name: event.name,
    date: event.date,
    emoji: event.emoji,
    color: event.color,
    note: event.note || '',
    is_annual: event.isAnnual,
    created_at: event.createdAt,
    updated_at: new Date().toISOString(),
  };
}

function dbRowToEvent(row) {
  return normalizeEvent({
    id: row.id,
    name: row.name,
    date: row.date,
    emoji: row.emoji || '📅',
    color: row.color || 'orange',
    note: row.note || '',
    isAnnual: row.is_annual || false,
    createdAt: row.created_at,
  });
}

/* ═══════════════════════════════════════════════════════════════
   LOCAL STORAGE (offline fallback)
═══════════════════════════════════════════════════════════════ */
function saveToLocalStorage() {
  localStorage.setItem('dc_events', JSON.stringify(events));
}

function loadFromLocalStorage() {
  try {
    const raw = localStorage.getItem('dc_events');
    const parsed = raw ? JSON.parse(raw) : [];
    events = Array.isArray(parsed) ? parsed.map(normalizeEvent) : [];
  } catch { events = []; }
}

/* ═══════════════════════════════════════════════════════════════
   AUTH HANDLERS
═══════════════════════════════════════════════════════════════ */
function switchAuthTab(tab) {
  const isLogin = tab === 'login';
  document.getElementById('tab-login').classList.toggle('active', isLogin);
  document.getElementById('tab-register').classList.toggle('active', !isLogin);
  setHidden('login-form', !isLogin);
  setHidden('register-form', isLogin);
  hideFeedback(document.getElementById('login-error'));
  hideFeedback(document.getElementById('register-error'));
  hideFeedback(document.getElementById('register-success'));
  renderTurnstileWidget(isLogin ? 'login' : 'register');
}

async function handleLogin() {
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;
  const errEl = document.getElementById('login-error');
  const btn = document.getElementById('btn-login');

  hideFeedback(errEl);

  if (!isValidEmail(email)) { showFieldError(errEl, t('errEmail')); return; }
  if (password.length < 6)  { showFieldError(errEl, t('errPwd')); return; }

  setButtonLoading(btn, true, 't-loginbtn', t('loginBtn'));

  if (!supabaseClient) {
    // Demo mode: simulate login
    currentUser = { id: 'demo', email };
    loadFromLocalStorage();
    showMain();
    setButtonLoading(btn, false, 't-loginbtn', t('loginBtn'));
    return;
  }

  // Pass the captcha token when one is available. Supabase requires it on
  // sign-in when bot protection is enabled, and ignores it otherwise.
  const captchaToken = turnstile.login.token || undefined;
  const { error } = await supabaseClient.auth.signInWithPassword({
    email,
    password,
    options: captchaToken ? { captchaToken } : undefined,
  });

  if (error) {
    showFieldError(errEl, mapAuthError(error));
    resetTurnstile('login');
  }

  setButtonLoading(btn, false, 't-loginbtn', t('loginBtn'));
}

// Translate a Supabase auth error into a clear, actionable message instead of
// hiding every failure behind a generic "wrong password".
function mapAuthError(error) {
  const code = error?.code || '';
  const msg = (error?.message || '').toLowerCase();
  if (code === 'email_not_confirmed' || msg.includes('not confirmed') || msg.includes('email not confirmed')) {
    return t('errEmailNotConfirmed');
  }
  if (code === 'invalid_credentials' || msg.includes('invalid login')) {
    return t('errLoginFail');
  }
  if (msg.includes('captcha')) {
    return t('errCaptcha');
  }
  return error?.message || t('errLoginFail');
}

async function handleRegister() {
  const email = document.getElementById('reg-email').value.trim();
  const password = document.getElementById('reg-password').value;
  const password2 = document.getElementById('reg-password2').value;
  const errEl = document.getElementById('register-error');
  const sucEl = document.getElementById('register-success');
  const btn = document.getElementById('btn-register');

  hideFeedback(errEl);
  hideFeedback(sucEl);

  if (!isValidEmail(email))  { showFieldError(errEl, t('errEmail')); return; }
  if (!isAllowedRegistrationEmail(email)) { showFieldError(errEl, t('errEmailDomain')); return; }
  if (password.length < 8)   { showFieldError(errEl, t('errPwd')); return; }
  if (password !== password2) { showFieldError(errEl, t('errPwdMatch')); return; }
  if (supabaseClient && appConfig.TURNSTILE_SITE_KEY && !turnstile.register.token) {
    showFieldError(errEl, t('errTurnstile'));
    return;
  }

  setButtonLoading(btn, true, 't-registerbtn', t('registerBtn'));

  if (!supabaseClient) {
    showFeedback(sucEl, t('regSuccess'));
    setButtonLoading(btn, false, 't-registerbtn', t('registerBtn'));
    return;
  }

  const { error } = await registerAccount(email, password, turnstile.register.token);
  if (error) {
    showFieldError(errEl, t('errRegFail'));
  } else {
    showFeedback(sucEl, t('regSuccess'));
  }
  resetTurnstile('register');

  setButtonLoading(btn, false, 't-registerbtn', t('registerBtn'));
}

async function handleLogout() {
  if (supabaseClient) await supabaseClient.auth.signOut();
  else {
    currentUser = null;
    events = [];
    showAuth();
  }
  closeMenu();
}

function showFieldError(el, msg) {
  showFeedback(el, msg);
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isAllowedRegistrationEmail(email) {
  return email.toLowerCase().endsWith(`@${ALLOWED_EMAIL_DOMAIN}`);
}

async function registerAccount(email, password, captchaToken) {
  try {
    const response = await fetch(REGISTER_API_PATH, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email, password, captchaToken }),
    });
    if (!response.ok) return { error: new Error('Registration failed') };
    return { error: null };
  } catch (err) {
    return { error: err };
  }
}

function renderTurnstileWidget(key) {
  const state = turnstile[key];
  if (!state) return;
  const container = document.getElementById(state.containerId);
  if (!container || !appConfig.TURNSTILE_SITE_KEY) return;
  setHidden(container, false);
  if (!window.turnstile) {
    if (turnstileRenderAttempts < 20) {
      turnstileRenderAttempts += 1;
      setTimeout(() => renderTurnstileWidget(key), 250);
    }
    return;
  }
  if (state.widgetId !== null) return;

  state.widgetId = window.turnstile.render(container, {
    sitekey: appConfig.TURNSTILE_SITE_KEY,
    callback: (token) => { state.token = token; },
    'expired-callback': () => { state.token = ''; },
    'error-callback': () => { state.token = ''; },
  });
}

function resetTurnstile(key) {
  const state = turnstile[key];
  if (!state) return;
  state.token = '';
  if (window.turnstile && state.widgetId !== null) {
    window.turnstile.reset(state.widgetId);
  }
}

/* ═══════════════════════════════════════════════════════════════
   SCREEN NAVIGATION
═══════════════════════════════════════════════════════════════ */
function showAuth() {
  document.getElementById('auth-screen').classList.remove('hidden');
  document.getElementById('main-screen').classList.add('hidden');
}

function showMain() {
  document.getElementById('auth-screen').classList.add('hidden');
  document.getElementById('main-screen').classList.remove('hidden');
  updateRecordCountDisplay();
  renderCards();
}

/* ═══════════════════════════════════════════════════════════════
   DATE UTILITIES
═══════════════════════════════════════════════════════════════ */
function today() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function parseDate(str) {
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function formatDate(str) {
  const d = parseDate(str);
  if (lang === 'zh') {
    return `${d.getFullYear()}年${d.getMonth()+1}月${d.getDate()}日`;
  }
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

function getDiffDays(event) {
  const now = today();
  let target = parseDate(event.date);

  if (event.isAnnual) {
    // Find next occurrence this year or next year
    const thisYear = new Date(now.getFullYear(), target.getMonth(), target.getDate());
    target = thisYear >= now ? thisYear : new Date(now.getFullYear()+1, target.getMonth(), target.getDate());
  }

  return Math.round((target - now) / 86400000);
}

function getAnnualYear(event) {
  const now = today();
  const origin = parseDate(event.date);
  const thisYear = new Date(now.getFullYear(), origin.getMonth(), origin.getDate());
  const yearsElapsed = thisYear <= now ? now.getFullYear() - origin.getFullYear() : now.getFullYear() - origin.getFullYear() - 1;
  return yearsElapsed + 1;
}

/* ═══════════════════════════════════════════════════════════════
   RENDER LOGIC
═══════════════════════════════════════════════════════════════ */
function getFilteredEvents() {
  let filtered = [...events];

  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(e =>
      e.name.toLowerCase().includes(q) ||
      (e.note || '').toLowerCase().includes(q)
    );
  }

  switch (currentFilter) {
    case 'upcoming':
      filtered = filtered.filter(e => getDiffDays(e) > 0);
      break;
    case 'past':
      filtered = filtered.filter(e => !e.isAnnual && getDiffDays(e) < 0);
      break;
    case 'today':
      filtered = filtered.filter(e => getDiffDays(e) === 0);
      break;
    case 'annual':
      filtered = filtered.filter(e => e.isAnnual);
      break;
  }

  // Sort: today first, then upcoming by soonest, then past by most recent
  filtered.sort((a, b) => {
    const da = getDiffDays(a);
    const db = getDiffDays(b);
    if (da === 0 && db === 0) return 0;
    if (da === 0) return -1;
    if (db === 0) return 1;
    if (da > 0 && db > 0) return da - db;
    if (da < 0 && db < 0) return db - da;
    return da > 0 ? -1 : 1;
  });

  return filtered;
}

function renderCards() {
  const grid = document.getElementById('cards-grid');
  const emptyState = document.getElementById('empty-state');
  const filtered = getFilteredEvents();

  grid.replaceChildren();

  if (filtered.length === 0) {
    emptyState.classList.add('visible');
    setText('empty-title', searchQuery ? '' : t('emptyTitle'));
    setText('empty-desc', searchQuery ? t('emptySearch') : t('emptyDesc'));
    emptyState.querySelector('.empty-icon').textContent = searchQuery ? '🔍' : '🗓️';
    return;
  }

  emptyState.classList.remove('visible');

  // Group by section
  let lastSection = null;

  filtered.forEach((event, idx) => {
    const diff = getDiffDays(event);
    const section = diff === 0 ? 'today' : diff > 0 ? 'upcoming' : 'past';

    if (section !== lastSection && currentFilter === 'all' && !searchQuery) {
      const label = document.createElement('div');
      label.className = 'section-label';
      label.textContent = {
        today: lang === 'zh' ? '📍 今天' : '📍 Today',
        upcoming: lang === 'zh' ? '⏳ 即将到来' : '⏳ Upcoming',
        past: lang === 'zh' ? '🕰️ 已过去' : '🕰️ Past',
      }[section];
      grid.appendChild(label);
      lastSection = section;
    }

    const card = createCardElement(event, diff, idx);
    grid.appendChild(card);
  });
}

function createCardElement(event, diff, idx) {
  const card = document.createElement('div');
  card.className = 'event-card card-animate';
  card.dataset.color = event.color || 'orange';

  const countClass = diff === 0 ? 'count-today' : diff > 0 ? 'count-future' : 'count-past';
  const absDiff = Math.abs(diff);

  let countLabel;
  if (diff === 0) {
    countLabel = t('today');
  } else if (diff > 0) {
    countLabel = lang === 'zh' ? `${absDiff} ${t('daysUntil')}` : `${absDiff} ${t('daysUntil')}`;
  } else {
    countLabel = lang === 'zh' ? `${absDiff} ${t('daysAgo')}` : `${absDiff} ${t('daysAgo')}`;
  }

  let metaLine = formatDate(event.date);
  if (event.isAnnual) {
    const yr = getAnnualYear(event);
    metaLine += ` · ${lang === 'zh' ? `第 ${yr} 次` : `Year ${yr}`}`;
  }
  if (event.note) metaLine += ` · ${event.note.slice(0, 20)}${event.note.length > 20 ? '…' : ''}`;

  const icon = createEl('div', 'card-icon-wrap', safeEmoji(event.emoji));
  const body = createEl('div', 'card-body');
  body.append(
    createEl('div', 'card-title', event.name),
    createEl('div', 'card-meta card-date-str', metaLine),
  );

  const right = createEl('div', 'card-right');
  right.append(
    createEl('div', `card-count ${countClass}`, String(absDiff)),
    createEl('span', 'card-unit', t('days')),
  );

  card.append(icon, body, right);

  card.addEventListener('click', () => openDetail(event.id));
  return card;
}

/* ═══════════════════════════════════════════════════════════════
   DETAIL VIEW
═══════════════════════════════════════════════════════════════ */
function openDetail(id) {
  const event = events.find(e => e.id === id);
  if (!event) return;
  currentDetailId = id;

  const diff = getDiffDays(event);
  const absDiff = Math.abs(diff);
  const countClass = diff === 0 ? 'count-today' : diff > 0 ? 'count-future' : 'count-past';

  const weeks = Math.floor(absDiff / 7);
  const months = Math.floor(absDiff / 30.44);
  const origin = parseDate(event.date);
  const years = Math.abs(today().getFullYear() - origin.getFullYear());

  let subtitle;
  if (diff === 0) subtitle = lang === 'zh' ? '🎉 就是今天！' : '🎉 It\'s today!';
  else if (diff > 0) subtitle = lang === 'zh' ? `还有 ${absDiff} 天` : `${absDiff} days to go`;
  else subtitle = lang === 'zh' ? `已过去 ${absDiff} 天` : `${absDiff} days ago`;

  setText('detail-title-text', event.name);

  const body = document.getElementById('detail-body');
  const hero = createEl('div', 'detail-hero');
  hero.append(
    createEl('span', 'detail-emoji', safeEmoji(event.emoji)),
    createEl('div', `detail-big-count ${countClass}`, diff === 0 ? '0' : String(absDiff)),
    createEl('div', 'detail-unit', t('days')),
    createEl('div', 'detail-date-label', subtitle),
    createEl('div', 'detail-date-label detail-date-muted', formatDate(event.date)),
  );
  if (event.note) {
    hero.append(createEl('div', 'detail-date-label detail-note', `"${event.note}"`));
  }

  const stats = createEl('div', 'detail-stats-grid');
  stats.append(
    createStatCard(absDiff, t('daysLabel')),
    createStatCard(weeks, t('weeksLabel')),
    createStatCard(months, t('monthsLabel')),
    createStatCard(years, t('years')),
  );

  const children = [hero, stats];
  if (event.isAnnual) {
    const annual = createEl('div', 'stat-card annual-stat-card');
    annual.append(
      createEl('span', 'annual-stat-label', lang === 'zh' ? '🔁 每年重复' : '🔁 Repeats annually'),
      createEl('span', 'annual-stat-value', lang === 'zh' ? `第 ${getAnnualYear(event)} 次` : `Year ${getAnnualYear(event)}`),
    );
    children.push(annual);
  }
  body.replaceChildren(...children);

  document.getElementById('detail-overlay').classList.add('open');
}

function closeDetail() {
  document.getElementById('detail-overlay').classList.remove('open');
  currentDetailId = null;
}

function editCurrentEvent() {
  if (!currentDetailId) return;
  closeDetail();
  openEditModal(currentDetailId);
}

/* ═══════════════════════════════════════════════════════════════
   ADD / EDIT MODAL
═══════════════════════════════════════════════════════════════ */
function openAddModal() {
  editingEventId = null;
  setText('modal-title', t('modalAdd'));
  document.getElementById('field-name').value = '';
  setTodayAsDefault();
  document.getElementById('field-note').value = '';
  document.getElementById('field-custom-emoji').value = '';
  setSelectedEmoji('📅');
  setSelectedColor('orange');
  isAnnualToggle = false;
  updateAnnualToggle();
  setHidden('btn-delete-event', true);
  openModal('add-modal');
}

function openEditModal(id) {
  const event = events.find(e => e.id === id);
  if (!event) return;
  editingEventId = id;
  setText('modal-title', t('modalEdit'));
  document.getElementById('field-name').value = event.name;
  document.getElementById('field-date').value = event.date;
  document.getElementById('field-note').value = event.note || '';
  document.getElementById('field-custom-emoji').value = '';
  setSelectedEmoji(event.emoji || '📅');
  setSelectedColor(event.color || 'orange');
  isAnnualToggle = event.isAnnual || false;
  updateAnnualToggle();
  setHidden('btn-delete-event', false);
  openModal('add-modal');
}

function closeAddModal() { closeModal('add-modal'); editingEventId = null; }

async function saveEvent() {
  const name = document.getElementById('field-name').value.trim();
  const date = document.getElementById('field-date').value;
  const note = document.getElementById('field-note').value.trim();
  const customEmoji = document.getElementById('field-custom-emoji').value.trim();

  if (!name) {
    const nameField = document.getElementById('field-name');
    nameField.focus();
    nameField.classList.add('field-error');
    setTimeout(() => nameField.classList.remove('field-error'), 1500);
    return;
  }
  if (!date) {
    document.getElementById('field-date').focus();
    return;
  }

  const selectedEmoji = normalizeEmoji(customEmoji || getSelectedEmoji());
  const selectedColor = getSelectedColor();

  if (!editingEventId && events.length >= MAX_RECORDS) {
    showToast(t('toastMaxErr'), 'error');
    return;
  }

  const event = {
    id: editingEventId || generateId(),
    name,
    date,
    emoji: selectedEmoji,
    color: selectedColor,
    note,
    isAnnual: isAnnualToggle,
    createdAt: editingEventId
      ? (events.find(e => e.id === editingEventId)?.createdAt || new Date().toISOString())
      : new Date().toISOString(),
  };

  if (editingEventId) {
    const idx = events.findIndex(e => e.id === editingEventId);
    if (idx !== -1) events[idx] = event;
  } else {
    events.unshift(event);
  }

  saveToLocalStorage();
  closeAddModal();
  renderCards();
  updateRecordCountDisplay();
  showToast(t('toastSaved'), 'success');

  try {
    await upsertEventToSupabase(event);
  } catch (err) {
    console.error('Sync error:', err);
    showToast(t('toastSyncErr'), 'error');
  }
}

async function deleteCurrentEditEvent() {
  if (!editingEventId) return;
  const id = editingEventId;

  // Inline confirm
  const btn = document.getElementById('btn-delete-event');
  if (btn.dataset.confirm !== '1') {
    btn.dataset.confirm = '1';
    btn.querySelector('#t-delete').textContent = lang === 'zh' ? '确认删除？' : 'Confirm?';
    setTimeout(() => {
      if (btn.dataset.confirm === '1') {
        btn.dataset.confirm = '';
        btn.querySelector('#t-delete').textContent = t('delete');
      }
    }, 3000);
    return;
  }

  events = events.filter(e => e.id !== id);
  saveToLocalStorage();
  closeAddModal();
  renderCards();
  updateRecordCountDisplay();
  showToast(t('toastDeleted'));

  try {
    await deleteEventFromSupabase(id);
  } catch (err) {
    console.error('Delete sync error:', err);
  }
}

/* ═══════════════════════════════════════════════════════════════
   EMOJI PICKER
═══════════════════════════════════════════════════════════════ */
const EMOJIS = ['📅','🎂','🎉','❤️','🏆','✈️','🎓','💍','🌸','🌟','🎵','💼','🏠','👶','🐣','🌈','🎯','📖','🙏','🎪'];

function renderEmojiPicker() {
  const container = document.getElementById('emoji-picker');
  container.replaceChildren();
  EMOJIS.forEach(emoji => {
    const btn = document.createElement('button');
    btn.className = 'emoji-btn';
    btn.type = 'button';
    btn.textContent = emoji;
    btn.dataset.emoji = emoji;
    btn.addEventListener('click', () => setSelectedEmoji(emoji));
    container.appendChild(btn);
  });
}

function setSelectedEmoji(emoji) {
  document.querySelectorAll('.emoji-btn').forEach(btn => {
    btn.classList.toggle('selected', btn.dataset.emoji === emoji);
  });
}

function getSelectedEmoji() {
  const sel = document.querySelector('.emoji-btn.selected');
  return sel ? sel.dataset.emoji : '📅';
}

/* ═══════════════════════════════════════════════════════════════
   COLOR PICKER
═══════════════════════════════════════════════════════════════ */
const COLORS = ['orange','red','green','blue','purple','gold','rose'];

function renderColorPicker() {
  const container = document.getElementById('color-picker');
  container.replaceChildren();
  COLORS.forEach(color => {
    const dot = document.createElement('div');
    dot.className = 'color-dot';
    dot.dataset.color = color;
    dot.addEventListener('click', () => setSelectedColor(color));
    container.appendChild(dot);
  });
  setSelectedColor('orange');
}

function setSelectedColor(color) {
  document.querySelectorAll('.color-dot').forEach(dot => {
    dot.classList.toggle('selected', dot.dataset.color === color);
  });
}

function getSelectedColor() {
  const sel = document.querySelector('.color-dot.selected');
  return sel ? sel.dataset.color : 'orange';
}

/* ═══════════════════════════════════════════════════════════════
   ANNUAL TOGGLE
═══════════════════════════════════════════════════════════════ */
function toggleAnnual() {
  isAnnualToggle = !isAnnualToggle;
  updateAnnualToggle();
}

function updateAnnualToggle() {
  const toggle = document.getElementById('toggle-annual');
  toggle.classList.toggle('on', isAnnualToggle);
}

/* ═══════════════════════════════════════════════════════════════
   FILTER & SEARCH
═══════════════════════════════════════════════════════════════ */
function setFilter(filter) {
  currentFilter = filter;
  document.querySelectorAll('.chip').forEach(c => {
    c.classList.toggle('active', c.dataset.filter === filter);
  });
  renderCards();
}

function onSearch() {
  searchQuery = document.getElementById('search-input').value.trim();
  renderCards();
}

/* ═══════════════════════════════════════════════════════════════
   EXPORT / IMPORT
═══════════════════════════════════════════════════════════════ */
function handleExport() {
  const data = {
    app: '日子有数 Days Count',
    version: '1.0',
    exportedAt: new Date().toISOString(),
    events: events,
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `days-count-export-${new Date().toISOString().slice(0,10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showToast(t('toastExported'), 'success');
  closeMenu();
}

function triggerImport() {
  document.getElementById('import-file').click();
}

async function handleImport(e) {
  const file = e.target.files[0];
  if (!file) return;
  e.target.value = '';

  try {
    const text = await file.text();
    const data = JSON.parse(text);

    let importedEvents = [];
    if (Array.isArray(data)) {
      importedEvents = data;
    } else if (data.events && Array.isArray(data.events)) {
      importedEvents = data.events;
    } else {
      throw new Error('Invalid format');
    }

    // Validate & sanitize
    const valid = importedEvents.filter(e =>
      e && typeof e.name === 'string' && typeof e.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(e.date)
    ).map(e => ({
      id: e.id || generateId(),
      name: e.name.slice(0, 60),
      date: e.date,
      emoji: normalizeEmoji(e.emoji || '📅'),
      color: COLORS.includes(e.color) ? e.color : 'orange',
      note: (e.note || '').slice(0, 200),
      isAnnual: Boolean(e.isAnnual || e.is_annual),
      createdAt: e.createdAt || e.created_at || new Date().toISOString(),
    }));

    if (valid.length === 0) throw new Error('No valid events');

    // Merge (deduplicate by id)
    const existingIds = new Set(events.map(e => e.id));
    const newEvents = valid.filter(e => !existingIds.has(e.id));
    events = [...newEvents, ...events].slice(0, MAX_RECORDS);
    saveToLocalStorage();
    renderCards();
    updateRecordCountDisplay();
    showToast(t('toastImported', { n: newEvents.length }), 'success');
    closeMenu();

    // Sync new events to Supabase
    for (const event of newEvents) {
      try { await upsertEventToSupabase(event); } catch {}
    }
  } catch (err) {
    showToast(t('toastImportErr'), 'error');
  }
}

/* ═══════════════════════════════════════════════════════════════
   MENU
═══════════════════════════════════════════════════════════════ */
function openMenu() {
  const email = currentUser?.email || (supabaseClient ? '' : '本地模式 / Local Mode');
  document.getElementById('user-email-display').textContent = email;
  updateRecordCountDisplay();
  openModal('menu-modal');
}

function closeMenu() { closeModal('menu-modal'); }

function updateRecordCountDisplay() {
  const badge = document.getElementById('record-count-badge');
  const display = document.getElementById('record-count-display');
  const str = t('recordCount', { n: events.length });
  if (badge) badge.textContent = events.length > 0 ? str : '';
  if (display) display.textContent = str;
}

/* ═══════════════════════════════════════════════════════════════
   MODAL HELPERS
═══════════════════════════════════════════════════════════════ */
function openModal(id) {
  const overlay = document.getElementById(id);
  overlay.classList.add('open');
  // Close on backdrop click
  overlay.addEventListener('click', function handler(e) {
    if (e.target === overlay) {
      closeModal(id);
      overlay.removeEventListener('click', handler);
    }
  });
}

function closeModal(id) {
  document.getElementById(id).classList.remove('open');
}

/* ═══════════════════════════════════════════════════════════════
   TOAST
═══════════════════════════════════════════════════════════════ */
let toastTimer;
function showToast(msg, type = '') {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.className = `toast ${type} show`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2500);
}

/* ═══════════════════════════════════════════════════════════════
   UTILITIES
═══════════════════════════════════════════════════════════════ */
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function createEl(tag, className = '', text = '') {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (text !== '') el.textContent = text;
  return el;
}

function createStatCard(value, label) {
  const card = createEl('div', 'stat-card');
  card.append(
    createEl('span', 'stat-value', String(value)),
    createEl('span', 'stat-label', label),
  );
  return card;
}

function normalizeEmoji(value) {
  const text = String(value || '').replace(/[<>&"]/g, '').trim();
  return text ? Array.from(text).slice(0, 8).join('') : '📅';
}

function safeEmoji(value) {
  return normalizeEmoji(value);
}

function normalizeEvent(event) {
  const date = typeof event?.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(event.date)
    ? event.date
    : `${today().getFullYear()}-${String(today().getMonth() + 1).padStart(2, '0')}-${String(today().getDate()).padStart(2, '0')}`;

  return {
    id: String(event?.id || generateId()).slice(0, 128),
    name: String(event?.name || '').slice(0, 60),
    date,
    emoji: normalizeEmoji(event?.emoji || '📅'),
    color: COLORS.includes(event?.color) ? event.color : 'orange',
    note: String(event?.note || '').slice(0, 200),
    isAnnual: Boolean(event?.isAnnual || event?.is_annual),
    createdAt: typeof event?.createdAt === 'string' ? event.createdAt : (event?.created_at || new Date().toISOString()),
  };
}

function setTodayAsDefault() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth()+1).padStart(2,'0');
  const d = String(now.getDate()).padStart(2,'0');
  document.getElementById('field-date').value = `${y}-${m}-${d}`;
}

// Keyboard close for modals
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeModal('add-modal');
    closeModal('menu-modal');
    closeDetail();
  }
  if (e.key === 'Enter' && !document.getElementById('login-form')?.classList.contains('is-hidden')) {
    const authActive = !document.getElementById('auth-screen').classList.contains('hidden');
    if (authActive) {
      const activeTab = document.getElementById('tab-login').classList.contains('active');
      if (activeTab) handleLogin();
    }
  }
});

