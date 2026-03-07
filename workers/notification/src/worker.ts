import { handleWeChat } from "./wechat";
import type { Env, RequestParams } from "./types";

// Helper function to safely convert any object to params
function normalizeToParams(obj: any): RequestParams {
  const result: Record<string, string> = {};
  if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        result[key] = value;
      } else if (value !== undefined && value !== null) {
        // Convert non-string values to string
        result[key] = String(value);
      }
    }
  }
  return result;
}

// Helper function to extract parameters from any request type
async function getParams(request: Request): Promise<RequestParams> {
  const { searchParams } = new URL(request.url);
  const urlParams = normalizeToParams(Object.fromEntries(searchParams.entries()));

  let bodyParams: Record<string, string> = {};
  // Only try to parse a body if it's a POST/PUT/PATCH request
  if (request.method === 'POST' || request.method === 'PUT' || request.method === 'PATCH') {
    const contentType = (request.headers.get('content-type') || '').toLowerCase();
    try {
      if (contentType.includes('application/json')) {
        const jsonBody: any = await request.json();
        // jsonBody can be a string, an object, or other types
        if (typeof jsonBody === 'string') {
          // treat raw string as content
          bodyParams = { content: jsonBody };
        } else if (jsonBody && typeof jsonBody === 'object') {
          // support nested containers like { params: {...} } or { data: {...} }
          if (jsonBody.params && typeof jsonBody.params === 'object') {
            bodyParams = normalizeToParams(jsonBody.params);
          } else if (jsonBody.data && typeof jsonBody.data === 'object') {
            bodyParams = normalizeToParams(jsonBody.data);
          } else {
            bodyParams = normalizeToParams(jsonBody);
          }
        }
      } else if (contentType.includes('application/x-www-form-urlencoded') || contentType.includes('multipart/form-data')) {
        const formData = await request.formData();
        bodyParams = normalizeToParams(Object.fromEntries(formData.entries()));
      } else {
        // Fallback: try to read raw text and parse as JSON, otherwise treat as raw content
        const text = await request.text();
        if (text) {
          try {
            const parsed: any = JSON.parse(text);
            if (parsed && typeof parsed === 'object') {
              if (parsed.params && typeof parsed.params === 'object') {
                bodyParams = normalizeToParams(parsed.params);
              } else if (parsed.data && typeof parsed.data === 'object') {
                bodyParams = normalizeToParams(parsed.data);
              } else {
                bodyParams = normalizeToParams(parsed);
              }
            } else {
              bodyParams = { content: text };
            }
          } catch (e) {
            bodyParams = { content: text };
          }
        }
      }
    } catch (error) {
      console.error('Failed to parse request body:', error);
      // Ignore body parsing errors and proceed with URL params
    }
  }

  // Merge params, giving body parameters precedence over URL parameters
  return { ...urlParams, ...bodyParams };
}

const channelMap = {
  'wechat': handleWeChat,
  'unsupported': (params: RequestParams, env: Env) => new Response("unsupported channel", {status: 400})
} as const;

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    
    // handle homepage
    // If request is a GET to root, serve a simple HTML homepage describing the service
    if (request.method === 'GET' && (url.pathname === '/' || url.pathname === '/index.html'
        || url.pathname === '/index.htm' || url.pathname === '/index.jsp')) {
      return handleHomePage();
    }

    if (url.pathname === '/view') {
      // handle message viewing on '/view'
      return handleView(request, env);
    }

    // Authentication begins
    // Use the new helper function to get all parameters
    const params = await getParams(request);
    // token can come from body/url params or from Authorization header
    let requestToken = params.token;
    if (!requestToken) {
    const authHeader = request.headers.get('Authorization') || request.headers.get('authorization');
        if (authHeader) {
            // support formats: 'Bearer <token>' or raw token
            const parts = authHeader.split(' ');
            requestToken = parts.length === 2 && /^Bearer$/i.test(parts[0]) ? parts[1] : authHeader;
        }
    }

    if (requestToken !== env.API_TOKEN || !requestToken) {
        const responseBody = { msg: 'Invalid token' };
        return new Response(JSON.stringify(responseBody), {
            status: 403,
            headers: { 'Content-Type': 'application/json; charset=utf-8' },
        });
    }

    // If path is a single segment like '/test?token=' or 'Authorization Bearer token' , 
    // serve an interactive test page
    const singleSeg = url.pathname.match(/^\/([^\/]+)\/?$/);
    if (singleSeg && singleSeg[1] && singleSeg[1] === 'test') {
      return handleTestPage(requestToken, env);
    }

    // handle message sending on '/send' and any '/xx' as channel 'xx'
    if (url.pathname !== '/send') {
      params.channel = url.pathname.substring(1)
    }
    return handleSend(params, env);

    // For any other path/method, return 404
    // return new Response('Not Found', { status: 404 });
  }
};

async function handleSend(params: RequestParams, env: Env): Promise<Response> {
  const channel = params.channel as keyof typeof channelMap;
  const handler = channelMap[channel] ?? channelMap.unsupported;
  return handler(params, env);
}

async function handleHomePage() {
  const html = `
    <!doctype html>
    <html lang="zh-CN">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <title>你妈喊你回家吃饭 —— 消息推送服务</title>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;700&display=swap" rel="stylesheet">
        <style>
          body {
            font-family: 'Noto Sans SC', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            margin: 0;
            background: linear-gradient(170deg, #f3e8ff 0%, #ffffff 100%);
            color: #1f2937;
          }
          .card {
            background: rgba(255, 255, 255, 0.85);
            backdrop-filter: blur(10px);
            border-radius: 24px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.18);
            padding: 40px;
            max-width: 720px;
            width: 90%;
            text-align: center;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
          }
          .card:hover {
            transform: translateY(-8px);
            box-shadow: 0 16px 40px rgba(0, 0, 0, 0.12);
          }
          h1 {
            margin: 0 0 12px;
            font-size: 32px;
            font-weight: 700;
            background: linear-gradient(90deg, #8b5cf6, #3b82f6);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
          }
          p {
            color: #4b5563;
            margin: 0 0 24px;
            font-size: 16px;
            line-height: 1.6;
          }
          .author {
            margin: 20px 0;
            color: #374151;
            font-size: 14px;
          }
          .icons {
            display: flex;
            gap: 20px;
            justify-content: center;
            margin-top: 24px;
          }
          .btn {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 12px 20px;
            border-radius: 12px;
            text-decoration: none;
            color: #374151;
            background: #f4f4f5;
            border: 1px solid #e4e4e7;
            font-weight: 700;
            transition: all 0.2s ease;
          }
          .btn:hover {
            background: #ffffff;
            border-color: #d4d4d8;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.05);
          }
          .icon {
            width: 22px;
            height: 22px;
            display: inline-block;
          }
          footer {
            margin-top: 24px;
            color: #6b7280;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <div class="card">
          <h1>你妈喊你回家吃饭 — 消息推送服务</h1>
          <p>一个极简、可靠的消息推送服务，支持多个消息通道。</p>
          <p>由 <a href="https://kafm.eu.org" target="_blank" rel="noopener">kafm</a> 部署，Powered by <a href="https://github.com/kafmws/useful-cloudflare-workers/notification" target="_blank" rel="noopener">useful-cloudflare-workers</a>.</p>
        </div> 
      </body> 


    </html>`;
  return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}

async function handleTestPage(tokenMayFromPath: string, env: Env) {
  
  // 2. Sanitize the token for safe embedding into HTML value attributes
  const sanitizedToken = tokenMayFromPath
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

  const html = `
    <!doctype html>
    <html lang="zh-CN">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <title>你妈喊你回家吃饭 —— 消息推送测试页面</title>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;700&display=swap" rel="stylesheet">
        <style>
          body {
            font-family: 'Noto Sans SC', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            margin: 0;
            padding: 24px;
            background: linear-gradient(170deg, #f3e8ff 0%, #ffffff 100%);
            color: #1f2937;
            box-sizing: border-box;
          }
          .container {
            background: rgba(255, 255, 255, 0.85);
            backdrop-filter: blur(10px);
            border-radius: 24px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.18);
            padding: 40px;
            max-width: 720px;
            width: 100%;
            text-align: left;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
          }
          .container:hover {
            transform: translateY(-8px);
            box-shadow: 0 16px 40px rgba(0, 0, 0, 0.12);
          }
          h1 {
            margin: 0 0 12px;
            font-size: 32px;
            font-weight: 700;
            text-align: center;
            background: linear-gradient(90deg, #8b5cf6, #3b82f6);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
          }
          .hint {
            color: #4b5563;
            margin: 0 0 24px;
            font-size: 16px;
            line-height: 1.6;
            text-align: center;
          }
          label {
            display: block;
            margin: 16px 0 8px;
            font-weight: 700;
            color: #374151;
          }
          input[type=text], textarea {
            width: 100%;
            padding: 12px;
            border: 1px solid #d4d4d8;
            border-radius: 12px;
            background: #f4f4f5;
            transition: all 0.2s ease;
            box-sizing: border-box;
            font-family: inherit;
            font-size: 14px;
          }
          input[type=text]:focus, textarea:focus {
            outline: none;
            border-color: #8b5cf6;
            background: #ffffff;
            box-shadow: 0 0 0 2px #c4b5fd;
          }
          select {
            width: 100%;
            padding: 12px;
            border: 1px solid #d4d4d8;
            border-radius: 12px;
            background: #f4f4f5;
            transition: all 0.2s ease;
            box-sizing: border-box;
            font-family: inherit;
            font-size: 14px;
            cursor: pointer;
          }
          select:focus {
            outline: none;
            border-color: #8b5cf6;
            background: #ffffff;
            box-shadow: 0 0 0 2px #c4b5fd;
          }
          .channel-field {
            margin: 8px 0;
          }
          button {
            margin-top: 24px;
            padding: 12px 20px;
            border-radius: 12px;
            border: 0;
            background: #8b5cf6;
            color: #fff;
            cursor: pointer;
            font-weight: 700;
            transition: all 0.2s ease;
          }
          button:hover {
            background: #7c3aed;
            transform: translateY(-2px);
          }
          button#clearBtn {
            background: #f4f4f5;
            color: #374151;
            border: 1px solid #e4e4e7;
          }
          button#clearBtn:hover {
            background: #ffffff;
            border-color: #d4d4d8;
            color: #1f2937;
          }
          pre {
            background: #1f2937;
            color: #e5e7eb;
            padding: 16px;
            border-radius: 12px;
            white-space: pre-wrap;
            word-break: break-all;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>你妈喊你回家吃饭 —— 消息推送测试页面</h1>
          <p class="hint">当前 token (来自路径)：<strong>${sanitizedToken}</strong></p>

          <form id="testForm" method="POST" action="">

            <label for="channel">消息通道</label>
            <select id="channel" name="channel">
              <option value="wechat">微信 (WeChat)</option>
              <option value="email">邮件 (Email)</option>
              <option value="telegram">电报 (Telegram)</option>
            </select>

            <label for="title">消息标题 (title)</label>
            <input id="title" name="title" type="text" value="测试标题" />

            <label for="content">内容 (content)</label>
            <textarea id="content" name="content" rows="4">你妈喊你回家吃饭</textarea>

            <div class="channel-field" data-channel="wechat">
              <label for="userid">用户 ID (userid，可选，多用户用 | 分隔)</label>
              <input id="userid" name="userid" type="text" placeholder="例如: OPENID1|OPENID2" />
            </div>

            <div class="channel-field" data-channel="wechat">
              <label for="appid">WX_APPID (可选，留空使用环境变量)</label>
              <input id="appid" name="appid" type="text" />
            </div>

            <div class="channel-field" data-channel="wechat">
              <label for="secret">WX_SECRET (可选，留空使用环境变量)</label>
              <input id="secret" name="secret" type="text" />
            </div>

            <div class="channel-field" data-channel="wechat">
              <label for="template_id">模板 ID (template_id，可选)</label>
              <input id="template_id" name="template_id" type="text" />
            </div>

            <div class="channel-field" data-channel="wechat">
              <label for="base_url">跳转链接 base_url (可选)</label>
              <input id="base_url" name="base_url" type="text" />
            </div>

            <div class="channel-field" data-channel="email">
              <label for="email_to">收件邮箱</label>
              <input id="email_to" name="email_to" type="email" placeholder="example@example.com" />
            </div>

            <div class="channel-field" data-channel="telegram">
              <label for="telegram_chat_id">Telegram Chat ID</label>
              <input id="telegram_chat_id" name="telegram_chat_id" type="text" placeholder="123456789" />
            </div>

            <input type="hidden" name="token" id="hiddenToken" value="${sanitizedToken}" />

            <div style="display:flex;gap:12px;align-items:center">
              <button id="sendBtn" type="submit">发送测试请求</button>
              <button type="button" id="clearBtn">清空</button>
            </div>
          </form>
          <div id="responseCard" style="display:none; margin-top: 20px;">
            <label for="responseArea">响应</label>
            <pre id="responseArea"></pre>
          </div>
        </div>

        <script>
          const form = document.getElementById('testForm');
          const sendBtn = document.getElementById('sendBtn');
          const clearBtn = document.getElementById('clearBtn');
          const responseArea = document.getElementById('responseArea');
          const responseCard = document.getElementById('responseCard');
          const channelSelect = document.getElementById('channel');
          const channelFields = document.querySelectorAll('.channel-field');

          function updateFieldsVisibility() {
            const selectedChannel = channelSelect.value;
            channelFields.forEach(field => {
              const fieldChannel = field.getAttribute('data-channel');
              field.style.display = fieldChannel === selectedChannel ? 'block' : 'none';
            });
            responseArea.textContent = '';
            responseCard.style.display = 'none';
          }

          function getFieldsForChannel(channel) {
            const fields = new Set();
            // 通用字段
            fields.add('title');
            fields.add('content');
            fields.add('token');
            // 通道特定字段
            channelFields.forEach(field => {
              if (field.getAttribute('data-channel') === channel) {
                const inputs = field.querySelectorAll('input, textarea');
                inputs.forEach(input => {
                  if (input.name) fields.add(input.name);
                });
              }
            });
            return fields;
          }

          // 更新字段可见性
          channelSelect.addEventListener('change', updateFieldsVisibility);

          if (form && sendBtn && clearBtn && responseArea && responseCard) {
            // 初始化可见性
            updateFieldsVisibility();

            clearBtn.addEventListener('click', () => {
              form.reset();
              channelSelect.value = 'wechat';
              updateFieldsVisibility();
              responseArea.textContent = '';
              responseCard.style.display = 'none';
            });

            form.addEventListener('submit', async (event) => {
              event.preventDefault();
              sendBtn.disabled = true;
              const originalText = sendBtn.textContent;
              sendBtn.textContent = '发送中...';
              responseCard.style.display = 'none';

              const selectedChannel = channelSelect.value;
              const allowedFields = getFieldsForChannel(selectedChannel);

              const formData = new FormData(form);
              const payload = {'channel': selectedChannel};
              for (const [k, v] of formData.entries()) {
                if (allowedFields.has(k) && k !== 'token' && v) {
                    payload[k] = v;
                }
              }

              try {
                const headers = { 'Content-Type': 'application/json' };
                const token = document.getElementById('hiddenToken').value;
                if (token) headers['Authorization'] = token;

                const response = await fetch('/send', { method: 'POST', headers, body: JSON.stringify(payload) });
                const responseText = await response.text();
                responseArea.textContent = 'Status: ' + response.status + '\\n\\n' + responseText;
                responseCard.style.display = 'block';
              } catch (err) {
                responseArea.textContent = 'Fetch error: ' + err.message;
                responseCard.style.display = 'block';
              } finally {
                sendBtn.disabled = false;
                sendBtn.textContent = originalText;
              }
            });
          }
        </script>
      </body>
    </html>`;
  return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}

async function handleView(request: Request, env: Env) {
  // 从URL参数中获取数据
  const url = new URL(request.url);
  const title = url.searchParams.get('title') || '消息推送';
  const message = url.searchParams.get('message') || '无内容信息';
  const date = url.searchParams.get('date') || '无时间信息';

  // geek 风格简洁信息展示
  const html = `
    <!doctype html>
    <html lang="zh-CN">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <title>${title}</title>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600&family=Noto+Sans+SC:wght@400;700&display=swap" rel="stylesheet">
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: 'Noto Sans SC', -apple-system, BlinkMacSystemFont, sans-serif;
            background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
            color: #e2e8f0;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
          }
          .message-card {
            background: rgba(15, 23, 42, 0.8);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(148, 163, 184, 0.2);
            border-radius: 16px;
            padding: 40px;
            max-width: 600px;
            width: 100%;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
            animation: fadeIn 0.6s ease-out;
          }
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          .message-header {
            border-bottom: 2px solid rgba(148, 163, 184, 0.2);
            padding-bottom: 16px;
            margin-bottom: 24px;
          }
          .message-title {
            font-size: 28px;
            font-weight: 700;
            background: linear-gradient(90deg, #60a5fa, #a78bfa);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 8px;
          }
          .message-time {
            font-family: 'JetBrains Mono', monospace;
            font-size: 12px;
            color: #64748b;
            letter-spacing: 0.5px;
          }
          .message-content {
            font-size: 16px;
            line-height: 1.8;
            color: #cbd5e1;
            word-break: break-word;
            white-space: pre-wrap;
            margin-bottom: 16px;
          }
          .message-footer {
            text-align: center;
            color: #64748b;
            font-size: 12px;
            margin-top: 24px;
            padding-top: 16px;
            border-top: 1px solid rgba(148, 163, 184, 0.15);
          }
          .badge {
            display: inline-block;
            background: rgba(148, 163, 184, 0.1);
            border: 1px solid rgba(148, 163, 184, 0.2);
            padding: 4px 12px;
            border-radius: 4px;
            font-family: 'JetBrains Mono', monospace;
            font-size: 11px;
            color: #94a3b8;
            margin-top: 8px;
          }
        </style>
      </head>
      <body>
        <div class="message-card">
          <div class="message-header">
            <div class="message-title">${title}</div>
            <div class="message-time">⏰ ${date}</div>
          </div>
          <div class="message-content">${message}</div>
          <div class="message-footer">
            <span class="badge">Powered by <a href="https://github.com/kafmws/useful-cloudflare-workers/tree/main/workers/notification" target="_blank" rel="noopener">useful-cloudflare-workers</a>.</span>
          </div>
        </div>
      </body>
    </html>`;
  
  return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}