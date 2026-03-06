// Environment variables
export interface Env {
  API_TOKEN: string;

  // WeChat Parameters
  WX_APPID: string;
  WX_SECRET: string;
  WX_USERID: string;
  WX_BASE_URL: string;
  WX_TEMPLATE_ID: string;
}

// Request parameters
export type RequestParams = Record<string, string>;
