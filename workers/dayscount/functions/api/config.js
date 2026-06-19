export function onRequestGet({ env }) {
  return json({
    SUPABASE_URL: env.SUPABASE_URL || '',
    SUPABASE_PUBLISHABLE_KEY: env.SUPABASE_PUBLISHABLE_KEY || '',
    TURNSTILE_SITE_KEY: env.TURNSTILE_SITE_KEY || '',
  });
}

export function onRequest() {
  return json({ error: 'Method not allowed' }, 405, { allow: 'GET' });
}

function json(body, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      ...extraHeaders,
    },
  });
}
