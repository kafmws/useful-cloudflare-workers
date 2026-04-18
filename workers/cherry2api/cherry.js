const http = require('node:http');
const { createHmac } = require('node:crypto');

const config = {
  upstreamBaseUrl: process.env.CHERRY_UPSTREAM_BASE_URL || 'https://api.cherry-ai.com',
  openaiApiKeys: parseApiKeys(process.env.OPENAI_API_KEYS),
  models: [
    'glm-4.5-flash',
    'Qwen/Qwen3-8B',
    'Qwen/Qwen3-Next-80B-A3B-Instruct',
  ],
  cherryClientId: process.env.CHERRY_CLIENT_ID || 'cherry-studio',
  cherrySecretPrefix:
    process.env.CHERRY_SECRET_PREFIX ||
    'K3RNPFx19hPh1AHr5E1wBEFfi4uYUjoCFuzjDzvS9cAWD8KuKJR8FOClwUpGqRRX',
  cherrySecretSuffix:
    process.env.CHERRY_SECRET_SUFFIX ||
    'GvI6I5ZrEHcGOWjO5AKhJKGmnwwGfM62XKpWqkjhvzRU2NZIinM77aTGIqhqys0g',
  corsAllowOrigin: process.env.CORS_ALLOW_ORIGIN || '*',
};

function parseApiKeys(value) {
  if (!value) return [];
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizePath(pathname) {
  if (!pathname || pathname === '/') return '/';
  return pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
}

function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', config.corsAllowOrigin);
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Authorization, Content-Type, X-Worker-Token, X-API-Token',
  );
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Expose-Headers', 'Content-Type, Cache-Control');
}

function sendJson(res, status, data, extraHeaders = {}) {
  setCorsHeaders(res);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    ...extraHeaders,
  });
  res.end(JSON.stringify(data, null, 2));
}

function errorResponse(res, status, type, message, param = null, providerError = null) {
  sendJson(res, status, {
    error: {
      message,
      type,
      param,
      code: providerError,
    },
  });
}

function normalizePayload(payload) {
  const cloned = structuredClone(payload);
  if (cloned.max_tokens == null && typeof cloned.max_completion_tokens === 'number') {
    cloned.max_tokens = cloned.max_completion_tokens;
  }
  delete cloned.max_completion_tokens;
  return cloned;
}

function getBearerToken(headers) {
  const auth = headers.authorization || '';
  return auth.match(/^Bearer\s+(.+)$/i)?.[1]?.trim() || '';
}

function validateOpenAIApiKey(headers) {
  if (!Array.isArray(config.openaiApiKeys) || config.openaiApiKeys.length === 0) {
    return null;
  }

  const token = getBearerToken(headers);
  if (token && config.openaiApiKeys.includes(token)) {
    return null;
  }

  return {
    status: 401,
    type: 'authentication_error',
    message: 'Invalid API key provided.',
    param: 'Authorization header',
    providerError: 'Authorization header is required.',
  };
}

function hmacSha256Hex(secret, message) {
  return createHmac('sha256', secret).update(message).digest('hex');
}

function buildCherryHeaders(method, path, body = '') {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const secret = `${config.cherrySecretPrefix}.${config.cherrySecretSuffix}`;
  const canonical = [method, path, '', config.cherryClientId, timestamp, body].join('\n');
  const signature = hmacSha256Hex(secret, canonical);

  return {
    'X-Client-ID': config.cherryClientId,
    'X-Timestamp': timestamp,
    'X-Signature': signature,
  };
}

function statusType(status) {
  if (status === 401 || status === 403) return 'authentication_error';
  if (status >= 500) return 'server_error';
  return 'invalid_request_error';
}

function getWorkerTokenFromHeaders(headers) {
  return (
    getBearerToken(headers) ||
    String(headers['x-worker-token'] || '').trim() ||
    String(headers['x-api-token'] || '').trim() ||
    ''
  );
}

function validateWorkerToken(req) {
  const configuredToken = String(process.env.CHERRY2API_WORKER_TOKEN || '').trim();
  if (!configuredToken || req.method === 'OPTIONS') return null;

  const requestToken = getWorkerTokenFromHeaders(req.headers);
  if (requestToken === configuredToken) return null;

  return {
    status: 401,
    type: 'unauthorized',
    message: 'Missing or invalid worker token',
    param: null,
    providerError:
      'Set CHERRY2API_WORKER_TOKEN in environment variables, then send it with Authorization: Bearer <token> or X-Worker-Token.',
  };
}

async function readRequestBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks).toString('utf8');
}

async function wrapUpstreamError(res, upstream) {
  const fallback = `Cherry upstream request failed with status ${upstream.status}.`;
  const contentType = upstream.headers.get('content-type') || '';

  try {
    if (contentType.includes('application/json')) {
      const data = await upstream.json();
      const err = data && data.error;
      const message = (err && err.message) || data.message || fallback;
      const type = (err && err.type) || statusType(upstream.status);
      const param = (err && err.param) || null;
      const code = (err && err.code) || null;
      return errorResponse(res, upstream.status, String(type), message, param, code);
    }

    const text = (await upstream.text()).trim();
    return errorResponse(res, upstream.status, statusType(upstream.status), text || fallback);
  } catch {
    return errorResponse(res, upstream.status, statusType(upstream.status), fallback);
  }
}

function handleModels(req, res) {
  const authError = validateOpenAIApiKey(req.headers);
  if (authError) {
    return errorResponse(
      res,
      authError.status,
      authError.type,
      authError.message,
      authError.param,
      authError.providerError,
    );
  }

  return sendJson(res, 200, {
    object: 'list',
    data: config.models.map((id) => ({
      id,
      object: 'model',
      created: 0,
      owned_by: 'cherry-ai',
    })),
  });
}

async function handleChatCompletions(req, res) {
  const authError = validateOpenAIApiKey(req.headers);
  if (authError) {
    return errorResponse(
      res,
      authError.status,
      authError.type,
      authError.message,
      authError.param,
      authError.providerError,
    );
  }

  const bodyText = await readRequestBody(req);
  if (!bodyText) {
    return errorResponse(res, 400, 'invalid_request_error', 'Request body is required.');
  }

  let payload;
  try {
    payload = JSON.parse(bodyText);
  } catch {
    return errorResponse(res, 400, 'invalid_request_error', 'Request body must be valid JSON.');
  }

  payload = normalizePayload(payload);

  if (!payload.model || typeof payload.model !== 'string') {
    return errorResponse(res, 400, 'invalid_request_error', 'The `model` field is required.');
  }

  if (!config.models.includes(payload.model)) {
    return errorResponse(
      res,
      400,
      'invalid_request_error',
      `Unsupported model: ${payload.model}. Supported models: ${config.models.join(', ')}`,
      'model',
    );
  }

  const serialized = JSON.stringify(payload);
  const signedHeaders = buildCherryHeaders('POST', '/chat/completions', serialized);

  const upstream = await fetch(`${config.upstreamBaseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...signedHeaders,
    },
    body: serialized,
  });

  if (!upstream.ok) {
    return wrapUpstreamError(res, upstream);
  }

  const responseText = await upstream.text();
  setCorsHeaders(res);
  res.writeHead(upstream.status, {
    'Content-Type': upstream.headers.get('content-type') || 'application/json',
    'Cache-Control': 'no-store',
  });
  res.end(responseText);
}

async function requestListener(req, res) {
  const workerAuthError = validateWorkerToken(req);
  if (workerAuthError) {
    return errorResponse(
      res,
      workerAuthError.status,
      workerAuthError.type,
      workerAuthError.message,
      workerAuthError.param,
      workerAuthError.providerError,
    );
  }

  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const path = normalizePath(url.pathname);

  if (req.method === 'OPTIONS') {
    setCorsHeaders(res);
    res.writeHead(204);
    res.end();
    return;
  }

  if (path === '/') {
    return sendJson(res, 200, {
      object: 'status',
      message: 'Cherry AI OpenAI-compatible proxy is running.',
      endpoints: ['/v1/models', '/v1/chat/completions'],
      configured_models: config.models,
    });
  }

  if (path === '/v1/models' && req.method === 'GET') {
    return handleModels(req, res);
  }

  if (path === '/v1/chat/completions' && req.method === 'POST') {
    return handleChatCompletions(req, res);
  }

  return errorResponse(res, 404, 'invalid_request_error', 'Not found.', null, 'invalid_url_error');
}

function createApp() {
  return http.createServer((req, res) => {
    requestListener(req, res).catch((error) => {
      console.error('Unhandled request error:', error);
      errorResponse(res, 500, 'server_error', 'Internal server error.');
    });
  });
}

module.exports = {
  config,
  createApp,
  requestListener,
};

if (require.main === module) {
  const port = Number(process.env.PORT || 8787);
  const host = process.env.HOST || '0.0.0.0';
  const server = createApp();
  server.listen(port, host, () => {
    console.log(`Cherry proxy listening on http://${host}:${port}`);
  });
}
