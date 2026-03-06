// Type definitions for environment variables
interface Env {
  API_TOKEN: string;
  WX_APPID: string;
  WX_SECRET: string;
  WX_USERID: string;
  WX_TEMPLATE_ID: string;
  WX_BASE_URL: string;
}

// Type definition for request context
interface RequestContext {
  request: Request;
  env: Env;
  ctx: ExecutionContext;
}

// Type definition for parsed parameters
interface ParsedParams {
  [key: string]: string | undefined;
}

// Type definition for token response
interface TokenResponse {
  access_token: string;
  [key: string]: any;
}

// Type definition for message response
interface MessageResponse {
  errmsg: string;
  [key: string]: any;
}

// Type definition for send message payload
interface SendMessagePayload {
  touser: string;
  template_id: string;
  url: string;
  data: {
    title: { value: string };
    content: { value: string };
  };
}

// NEW: Helper function to extract parameters from any request type
async function getParams(request: Request): Promise<ParsedParams> {
  const { searchParams } = new URL(request.url);
  const urlParams = Object.fromEntries(searchParams.entries());

  let bodyParams: ParsedParams = {};
  // Only try to parse a body if it's a POST/PUT/PATCH request
  if (request.method === 'POST' || request.method === 'PUT' || request.method === 'PATCH') {
    const contentType = (request.headers.get('content-type') || '').toLowerCase();
    try {
      if (contentType.includes('application/json')) {
        const jsonBody = await request.json();
        // jsonBody can be a string, an object, or other types
        if (typeof jsonBody === 'string') {
          // treat raw string as content
          bodyParams = { content: jsonBody };
        } else if (jsonBody && typeof jsonBody === 'object') {
          // support nested containers like { params: {...} } or { data: {...} }
          if (jsonBody.params && typeof jsonBody.params === 'object') {
            bodyParams = jsonBody.params;
          } else if (jsonBody.data && typeof jsonBody.data === 'object') {
            bodyParams = jsonBody.data;
          } else {
            bodyParams = jsonBody;
          }
        }
      } else if (contentType.includes('application/x-www-form-urlencoded') || contentType.includes('multipart/form-data')) {
        const formData = await request.formData();
        bodyParams = Object.fromEntries(formData.entries());
      } else {
        // Fallback: try to read raw text and parse as JSON, otherwise treat as raw content
        const text = await request.text();
        if (text) {
          try {
            const parsed = JSON.parse(text);
            if (parsed && typeof parsed === 'object') {
              if (parsed.params && typeof parsed.params === 'object') {
                bodyParams = parsed.params;
              } else if (parsed.data && typeof parsed.data === 'object') {
                bodyParams = parsed.data;
              } else {
                bodyParams = parsed;
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

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    // If path is a single segment like '/<token>', serve an interactive test page
    // but ignore reserved paths like '/wxsend' and '/index.html'
    const singleSeg = url.pathname.match(/^\/([^\/]+)\/?$/);
    if (singleSeg && singleSeg[1] && singleSeg[1] !== 'wxsend' && singleSeg[1] !== 'index.html') {
      const rawTokenFromPath = singleSeg[1];

      // 1. Authenticate the token first
      if (rawTokenFromPath !== env.API_TOKEN) {
        const responseBody = { msg: 'Invalid token' };
        return new Response(JSON.stringify(responseBody), {
          status: 403,
          headers: { 'Content-Type': 'application/json; charset=utf-8' },
        });
      }

      // 2. Sanitize the token for safe embedding into HTML value attributes
      const sanitizedToken = rawTokenFromPath
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");

      const html = "test"

      return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
    }

    // Route: only handle message sending on '/wxsend'
    if (url.pathname === '/wxsend') {
      // MODIFIED: Use the new helper function to get all parameters
      const params = await getParams(request);

      // MODIFIED: Read parameters from the unified 'params' object
      const content = params.content;
      const title = params.title;
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

      if (!content || !title || !requestToken) {
        const responseBody = { msg: 'Missing required parameters: content, title, token' };
        return new Response(JSON.stringify(responseBody), {
          status: 400,
          headers: { 'Content-Type': 'application/json; charset=utf-8' },
        });
      }

      if (requestToken !== env.API_TOKEN) {
        const responseBody = { msg: 'Invalid token' };
        return new Response(JSON.stringify(responseBody), {
          status: 403,
          headers: { 'Content-Type': 'application/json; charset=utf-8' },
        });
      }

      const appid = params.appid || env.WX_APPID;
      const secret = params.secret || env.WX_SECRET;
      const useridStr = params.userid || env.WX_USERID;
      const template_id = params.template_id || env.WX_TEMPLATE_ID;
      const base_url = params.base_url || env.WX_BASE_URL;

      if (!appid || !secret || !useridStr || !template_id) {
        const responseBody = { msg: 'Missing required environment variables: WX_APPID, WX_SECRET, WX_USERID, WX_TEMPLATE_ID' };
        return new Response(JSON.stringify(responseBody), {
          status: 500,
          headers: { 'Content-Type': 'application/json; charset=utf-8' },
        });
      }

      const user_list = useridStr.split('|').map(uid => uid.trim()).filter(Boolean);

      try {
        const accessToken = await getStableToken(appid, secret);
        if (!accessToken) {
          const responseBody = { msg: 'Failed to get access token' };
          return new Response(JSON.stringify(responseBody), {
            status: 500,
            headers: { 'Content-Type': 'application/json; charset=utf-8' },
          });
        }

        const results = await Promise.all(user_list.map(userid =>
          sendMessage(accessToken, userid, template_id, base_url, title, content)
        ));

        const successfulMessages = results.filter(r => r.errmsg === 'ok');

        if (successfulMessages.length > 0) {
          const responseBody = { msg: `Successfully sent messages to ${successfulMessages.length} user(s). First response: ok` };
          return new Response(JSON.stringify(responseBody), {
            status: 200,
            headers: { 'Content-Type': 'application/json; charset=utf-8' },
          });
        } else {
          const firstError = results.length > 0 ? results[0].errmsg : "Unknown error";
          const responseBody = { msg: `Failed to send messages. First error: ${firstError}` };
          return new Response(JSON.stringify(responseBody), {
            status: 500,
            headers: { 'Content-Type': 'application/json; charset=utf-8' },
          });
        }

      } catch (error) {
        console.error('Error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        const responseBody = { msg: `An error occurred: ${errorMessage}` };
        return new Response(JSON.stringify(responseBody), {
          status: 500,
          headers: { 'Content-Type': 'application/json; charset=utf-8' },
        });
      }
    }

    // If not /wxsend, handle homepage or other paths
    // If request is a GET to root, serve a simple HTML homepage describing the service
    if (request.method === 'GET' && (url.pathname === '/' || url.pathname === '/index.html')) {
      const html = "index"
      return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
    }

    // For any other path/method, return 404
    return new Response('Not Found', { status: 404 });
  },
};

async function getStableToken(appid: string, secret: string): Promise<string> {
  const tokenUrl = 'https://api.weixin.qq.com/cgi-bin/stable_token';
  const payload = {
    grant_type: 'client_credential',
    appid: appid,
    secret: secret,
    force_refresh: false
  };
  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json;charset=utf-8' },
    body: JSON.stringify(payload)
  });
  const data: TokenResponse = await response.json();
  return data.access_token;
}

async function sendMessage(
  accessToken: string,
  userid: string,
  template_id: string,
  base_url: string,
  title: string | undefined,
  content: string | undefined
): Promise<MessageResponse> {
  const sendUrl = `https://api.weixin.qq.com/cgi-bin/message/template/send?access_token=${accessToken}`;

  // Create a Date object for Beijing time (UTC+8) by adding 8 hours to the current UTC time
  const beijingTime = new Date(new Date().getTime() + 8 * 60 * 60 * 1000);
  // Format the date to 'YYYY-MM-DD HH:MM:SS' string
  const date = beijingTime.toISOString().slice(0, 19).replace('T', ' ');

  const encoded_message = encodeURIComponent(content || '');
  const encoded_date = encodeURIComponent(date);

  const payload: SendMessagePayload = {
    touser: userid,
    template_id: template_id,
    url: `${base_url}?message=${encoded_message}&date=${encoded_date}&title=${encodeURIComponent(title || '')}`,
    data: {
      title: { value: title || '' },
      content: { value: (title || '') + "：" + (content || '') } // 微信测试号不支持自定义 title，拼接到 content 上
    }
  };

  const response = await fetch(sendUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json;charset=utf-8' },
    body: JSON.stringify(payload)
  });

  return await response.json();
}
