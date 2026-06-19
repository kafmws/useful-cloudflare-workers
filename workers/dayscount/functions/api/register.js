const ALLOWED_EMAIL_DOMAIN = 'qq.com';

export async function onRequestPost({ request, env }) {
  let payload;
  try {
    payload = await request.json();
  } catch {
    return json({ error: 'Invalid JSON body' }, 400);
  }

  const email = String(payload.email || '').trim().toLowerCase();
  const password = String(payload.password || '');
  const captchaToken = String(payload.captchaToken || '');

  if (!isAllowedEmail(email)) {
    return json({ error: 'Only QQ email registration is allowed' }, 403);
  }
  if (password.length < 8) {
    return json({ error: 'Password must be at least 8 characters' }, 400);
  }
  if (!captchaToken) {
    return json({ error: 'Turnstile token is required' }, 400);
  }

  const rateLimit = env.REGISTER_RATE_LIMITER;
  if (rateLimit) {
    const ip = request.headers.get('cf-connecting-ip') || 'unknown';
    const key = `${email}:${ip}`;
    const { success } = await rateLimit.limit({ key });
    if (!success) {
      return json({ error: 'Too many registration attempts' }, 429);
    }
  }

  const supabaseUrl = env.SUPABASE_URL;
  const supabasePublishableKey = env.SUPABASE_PUBLISHABLE_KEY;
  if (!supabaseUrl || !supabasePublishableKey) {
    return json({ error: 'Registration service is not configured' }, 500);
  }

  const redirectTo = env.AUTH_REDIRECT_URL || new URL(request.url).origin;
  const signupUrl = new URL('/auth/v1/signup', `${supabaseUrl.replace(/\/$/, '')}/`);
  signupUrl.searchParams.set('redirect_to', redirectTo);

  let response;
  try {
    response = await fetch(signupUrl.toString(), {
      method: 'POST',
      headers: {
        apikey: supabasePublishableKey,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
        gotrue_meta_security: { captcha_token: captchaToken },
      }),
    });
  } catch (err) {
    return json({ error: 'Registration upstream request failed' }, 502);
  }

  if (!response.ok) {
    const body = await safeJson(response);
    return json({ error: body?.msg || body?.message || 'Registration failed' }, response.status);
  }

  return json({ ok: true }, 200);
}

export function onRequest() {
  return json({ error: 'Method not allowed' }, 405, { allow: 'POST' });
}

function isAllowedEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.endsWith(`@${ALLOWED_EMAIL_DOMAIN}`);
}

async function safeJson(response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function json(body, status, extraHeaders = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      ...extraHeaders,
    },
  });
}
