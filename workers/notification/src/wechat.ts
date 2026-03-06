import type { Env, RequestParams } from "./types";

// Type definition for token response
interface TokenResponse {
  access_token: string;
  [key: string]: any;
}

// Type definition for message response
interface WeChatResponse {
  errmsg: string;
  [key: string]: any;
}

// Type definition for send message payload
interface WeChatMessage {
  touser: string;
  template_id: string;
  url: string;
  data: {
    title: { value: string };
    content: { value: string };
  };
}

async function getStableWeChatToken(appid: string, secret: string): Promise<string> {
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

async function sendWeChatMessage(
  accessToken: string,
  userid: string,
  template_id: string,
  base_url: string,
  title: string | undefined,
  content: string | undefined
): Promise<WeChatResponse> {
  const sendUrl = `https://api.weixin.qq.com/cgi-bin/message/template/send?access_token=${accessToken}`;

  // Create a Date object for Beijing time (UTC+8) by adding 8 hours to the current UTC time
  const beijingTime = new Date(new Date().getTime() + 8 * 60 * 60 * 1000);
  // Format the date to 'YYYY-MM-DD HH:MM:SS' string
  const date = beijingTime.toISOString().slice(0, 19).replace('T', ' ');

  const encoded_message = encodeURIComponent(content || '');
  const encoded_date = encodeURIComponent(date);

  const payload: WeChatMessage = {
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

async function handleWeChat(params: RequestParams, env: Env) {
    // Read parameters from the unified 'params' object
    const content = params.content;
    const title = params.title;

    if (!content || !title) {
        const responseBody = { msg: 'Missing required parameters: content, title' };
        return new Response(JSON.stringify(responseBody), {
            status: 400,
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
        const accessToken = await getStableWeChatToken(appid, secret);
        if (!accessToken) {
            const responseBody = { msg: 'Failed to get access token' };
            return new Response(JSON.stringify(responseBody), {
            status: 500,
            headers: { 'Content-Type': 'application/json; charset=utf-8' },
            });
        }

        const results = await Promise.all(user_list.map(userid =>
            sendWeChatMessage(accessToken, userid, template_id, base_url, title, content)
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
};

export { handleWeChat };