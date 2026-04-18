// 这是对原始混淆版 workers.js 的中文注释整理版。
// 代码本体仍然保持原有逻辑，但我把变量名、函数职责、请求链路都说明白了。
//
// 这个 Worker 的本质：
// 1. 对外暴露 OpenAI 兼容接口：
//    - GET  /v1/models
//    - POST /v1/chat/completions
// 2. 对内把请求转发到 Cherry AI 上游：
//    - https://api.cherry-ai.com/v1/chat/completions
// 3. 通过 HMAC-SHA256 自己给上游请求签名
// 4. 可选要求调用方提供 CHERRY2API_WORKER_TOKEN 做二次鉴权

const config = {
  // 上游真实服务地址
  upstreamBaseUrl: 'https://api.cherry-ai.com',

  // 可选的 OpenAI API Key 白名单。
  // 当前为空数组，意味着默认“不校验 OpenAI key”。
  // 也就是说，如果没有额外的 CHERRY2API_WORKER_TOKEN 保护，这个代理可能相当于公开暴露。
  openaiApiKeys: [],

  // 允许使用的模型列表，对外 /v1/models 也会返回这些值。
  models: [
    'glm-4.5-flash',
    'Qwen/Qwen3-8B',
    'Qwen/Qwen3-Next-80B-A3B-Instruct',
  ],

  // Cherry 侧使用的 client id
  cherryClientId: 'cherry-studio',

  // Cherry 请求签名所需的 secret，被拆成两段硬编码在源码里。
  // 真实 secret = `${prefix}.${suffix}`
  cherrySecretPrefix: 'K3RNPFx19hPh1AHr5E1wBEFfi4uYUjoCFuzjDzvS9cAWD8KuKJR8FOClwUpGqRRX',
  cherrySecretSuffix: 'GvI6I5ZrEHcGOWjO5AKhJKGmnwwGfM62XKpWqkjhvzRU2NZIinM77aTGIqhqys0g',

  // 允许跨域来源。这里直接放开为 *
  corsAllowOrigin: '*',
};

const encoder = new TextEncoder();

// 缓存导入后的 HMAC key，避免每次请求都重复 importKey。
let cachedHmacKey;

/**
 * 规范化 URL 路径
 *
 * 作用：
 * - 空路径 / 根路径 => '/'
 * - 把末尾多余的 '/' 去掉，避免 '/v1/models/' 和 '/v1/models' 被当成两个路由
 */
function normalizePath(pathname) {
  if (!pathname || pathname === '/') return '/';
  return pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
}

/**
 * 统一返回 JSON，并顺手补上 CORS 头与 no-store 缓存策略。
 */
function jsonResponse(data, init = {}) {
  const headers = new Headers(init.headers);
  headers.set('Content-Type', 'application/json; charset=utf-8');
  headers.set('Cache-Control', 'no-store');
  return withCors(new Response(JSON.stringify(data, null, 2), { ...init, headers }));
}

/**
 * 统一错误返回格式，尽量模仿 OpenAI 风格：
 * {
 *   error: {
 *     message,
 *     type,
 *     param,
 *     code
 *   }
 * }
 */
function errorResponse(status, code, message, param = null, provider_error = null) {
  return jsonResponse(
    { error: { message, type: code, param, code: provider_error } },
    { status },
  );
}

/**
 * 给响应添加 CORS 头。
 *
 * 这里允许：
 * - Authorization
 * - Content-Type
 * - X-Worker-Token
 * - X-API-Token
 *
 * 所以调用方既可以走 Authorization: Bearer <token>
 * 也可以走自定义头携带 token。
 */
function withCors(response) {
  const headers = new Headers(response.headers);
  headers.set('Access-Control-Allow-Origin', config.corsAllowOrigin);
  headers.set('Access-Control-Allow-Headers', 'Authorization, Content-Type, X-Worker-Token, X-API-Token');
  headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  headers.set('Access-Control-Expose-Headers', 'Content-Type, Cache-Control');
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

/**
 * 兼容不同客户端的字段命名。
 *
 * 部分 OpenAI 兼容客户端会传 max_completion_tokens，
 * Cherry 上游可能更期望 max_tokens，
 * 所以这里做一次映射。
 */
function normalizePayload(payload) {
  const cloned = structuredClone(payload);
  if (cloned.max_tokens == null && typeof cloned.max_completion_tokens === 'number') {
    cloned.max_tokens = cloned.max_completion_tokens;
  }
  delete cloned.max_completion_tokens;
  return cloned;
}

/**
 * 从 Authorization: Bearer xxx 中提取 token。
 */
function getBearerToken(request) {
  return (
    request.headers.get('Authorization')?.match(/^Bearer\s+(.+)$/i)?.[1]?.trim() ?? ''
  );
}

/**
 * 校验“OpenAI API Key”白名单。
 *
 * 注意：
 * - 如果 config.openaiApiKeys 是空数组，则直接放行。
 * - 这意味着这层鉴权默认是关闭的。
 */
function validateOpenAIApiKey(request) {
  if (!Array.isArray(config.openaiApiKeys) || config.openaiApiKeys.length === 0) {
    return null;
  }

  const token = getBearerToken(request);
  if (token && config.openaiApiKeys.includes(token)) {
    return null;
  }

  return errorResponse(
    401,
    'authentication_error',
    'Invalid API key provided.',
    'Authorization header',
    'Authorization header is required.',
  );
}

/**
 * 计算 HMAC-SHA256，并输出十六进制小写字符串。
 *
 * 用途：给 Cherry 上游请求做签名。
 */
async function hmacSha256Hex(secret, message) {
  if (!cachedHmacKey) {
    cachedHmacKey = crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign'],
    );
  }

  const key = await cachedHmacKey;
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(message));
  return [...new Uint8Array(sig)]
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * 构造请求 Cherry 上游时需要的签名头。
 *
 * canonical string 格式：
 *   method\npath\n\nclientId\ntimestamp\nbody
 *
 * 然后：
 * - secret = prefix + '.' + suffix
 * - signature = HMAC_SHA256(secret, canonical)
 *
 * 最终发送这些头：
 * - X-Client-ID
 * - X-Timestamp
 * - X-Signature
 */
async function buildCherryHeaders(method, path, body = '') {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const secret = `${config.cherrySecretPrefix}.${config.cherrySecretSuffix}`;
  const canonical = [method, path, '', config.cherryClientId, timestamp, body].join('\n');
  const signature = await hmacSha256Hex(secret, canonical);

  return {
    'X-Client-ID': config.cherryClientId,
    'X-Timestamp': timestamp,
    'X-Signature': signature,
  };
}

/**
 * 处理 GET /v1/models
 *
 * 返回一个 OpenAI 风格的模型列表。
 */
async function handleModels(request) {
  const authError = validateOpenAIApiKey(request);
  if (authError) return authError;

  return jsonResponse({
    object: 'list',
    data: config.models.map((id) => ({
      id,
      object: 'model',
      created: 0,
      owned_by: 'cherry-ai',
    })),
  });
}

/**
 * 处理 POST /v1/chat/completions
 *
 * 主流程：
 * 1. 校验 OpenAI key（如果配置了白名单）
 * 2. 读取并解析 JSON body
 * 3. 做字段兼容处理
 * 4. 校验 model 是否存在且受支持
 * 5. 给请求签名
 * 6. 转发到 Cherry 上游
 * 7. 把上游响应原样透传回来
 */
async function handleChatCompletions(request) {
  const authError = validateOpenAIApiKey(request);
  if (authError) return authError;

  const bodyText = await request.text();
  if (!bodyText) {
    return errorResponse(400, 'invalid_request_error', 'Request body is required.');
  }

  let payload;
  try {
    payload = JSON.parse(bodyText);
  } catch {
    return errorResponse(400, 'invalid_request_error', 'Request body must be valid JSON.');
  }

  payload = normalizePayload(payload);

  if (!payload.model || typeof payload.model !== 'string') {
    return errorResponse(400, 'invalid_request_error', 'The `model` field is required.');
  }

  if (!config.models.includes(payload.model)) {
    return errorResponse(
      400,
      'invalid_request_error',
      `Unsupported model: ${payload.model}. Supported models: ${config.models.join(', ')}`,
      'model',
    );
  }

  const serialized = JSON.stringify(payload);
  const signedHeaders = await buildCherryHeaders('POST', '/v1/chat/completions', serialized);

  const upstream = await fetch(`${config.upstreamBaseUrl}/v1/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...signedHeaders,
    },
    body: serialized,
  });

  if (!upstream.ok) {
    return wrapUpstreamError(upstream);
  }

  // 成功时基本透传上游响应体，仅重新设置少量头。
  const headers = new Headers();
  headers.set('Content-Type', upstream.headers.get('Content-Type') ?? 'application/json');
  headers.set('Cache-Control', 'no-store');
  return withCors(new Response(upstream.body, { status: upstream.status, headers }));
}

/**
 * 统一包装上游错误。
 *
 * 逻辑：
 * - 如果上游返回 JSON，尽量抽取 error.message / error.type / error.param / error.code
 * - 如果上游不是 JSON，就直接把文本内容塞进 message
 */
async function wrapUpstreamError(response) {
  const fallback = `Cherry upstream request failed with status ${response.status}.`;
  const contentType = response.headers.get('Content-Type') ?? '';

  try {
    if (contentType.includes('application/json')) {
      const data = await response.json();
      const err = data?.error;
      const message = err?.message ?? data?.message ?? fallback;
      const type = err?.type ?? statusType(response.status);
      const param = err?.param ?? null;
      const code = err?.code ?? null;
      return errorResponse(response.status, String(type), message, param, code);
    }

    const text = (await response.text()).trim();
    return errorResponse(response.status, statusType(response.status), text || fallback);
  } catch {
    return errorResponse(response.status, statusType(response.status), fallback);
  }
}

/**
 * 根据 HTTP 状态码归类错误类型。
 */
function statusType(status) {
  if (status === 401 || status === 403) return 'authentication_error';
  if (status >= 500) return 'server_error';
  return 'invalid_request_error';
}

/**
 * 提取“Worker 自己的访问 token”。
 *
 * 支持三种来源：
 * 1. Authorization: Bearer <token>
 * 2. X-Worker-Token: <token>
 * 3. X-API-Token: <token>
 */
function getWorkerTokenFromRequest(request) {
  const authHeader = request.headers.get('Authorization') ?? '';
  const bearerToken = authHeader.match(/^Bearer\s+(.+)$/i)?.[1]?.trim();
  return (
    bearerToken ||
    request.headers.get('X-Worker-Token')?.trim() ||
    request.headers.get('X-API-Token')?.trim() ||
    ''
  );
}

/**
 * 校验 Worker 外层 token。
 *
 * 这层和 validateOpenAIApiKey 不是一回事：
 * - validateOpenAIApiKey：模拟 OpenAI API key 校验
 * - validateWorkerToken：保护整个 Worker 的私有访问
 *
 * 逻辑：
 * - 如果环境变量没有配置 CHERRY2API_WORKER_TOKEN，则放行
 * - 如果是 OPTIONS 预检请求，则放行
 * - 否则要求请求里必须带正确 token
 */
function validateWorkerToken(request, env) {
  const configuredToken = env?.CHERRY2API_WORKER_TOKEN?.trim();
  if (!configuredToken || request.method === 'OPTIONS') return null;

  const requestToken = getWorkerTokenFromRequest(request);
  if (requestToken === configuredToken) return null;

  return errorResponse(
    401,
    'unauthorized',
    'Missing or invalid worker token',
    null,
    'Set CHERRY2API_WORKER_TOKEN in Cloudflare Workers environment variables, then send it with Authorization: Bearer <token> or X-Worker-Token.',
  );
}

/**
 * Worker 入口。
 *
 * 路由总览：
 * - OPTIONS / 任意路径                => CORS 预检
 * - GET     /                        => 状态页
 * - GET     /v1/models               => 模型列表
 * - POST    /v1/chat/completions     => 对话补全代理
 * - 其他                             => 404
 */
export default {
  async fetch(request, env) {
    // 先过 Worker 级别鉴权
    const workerAuthError = validateWorkerToken(request, env);
    if (workerAuthError) return workerAuthError;

    const url = new URL(request.url);
    const path = normalizePath(url.pathname);

    // 处理 CORS 预检
    if (request.method === 'OPTIONS') {
      return withCors(new Response(null, { status: 204 }));
    }

    // 根路径：返回状态信息，便于外部快速探活
    if (path === '/') {
      return jsonResponse({
        object: 'status',
        message: 'Cherry AI OpenAI-compatible proxy is running.',
        endpoints: ['/v1/models', '/v1/chat/completions'],
        configured_models: config.models,
      });
    }

    // 模型列表
    if (path === '/v1/models' && request.method === 'GET') {
      return handleModels(request);
    }

    // 对话补全
    if (path === '/v1/chat/completions' && request.method === 'POST') {
      return handleChatCompletions(request);
    }

    // 其余路径全部 404
    return errorResponse(404, 'invalid_request_error', 'Not found.', null, 'invalid_url_error');
  },
};