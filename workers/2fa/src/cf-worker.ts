// src/cf-worker.ts
// Cloudflare Worker entry point.
// Wrangler bundles this file; it must have a default export with a fetch() method.

import { createApp, type AppLogger, type LogFields } from "./app.js";
import { CfKvStore } from "./storage/interface.js";
import { parseConfig, type CfEnv } from "./config.js";

function writeConsoleLog(level: "info" | "warn" | "error", message: string, fields: LogFields = {}) {
  const line = JSON.stringify({
    ts: new Date().toISOString(),
    level,
    message,
    ...fields,
  });
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
}

const logger: AppLogger = {
  info: (message, fields) => writeConsoleLog("info", message, fields),
  warn: (message, fields) => writeConsoleLog("warn", message, fields),
  error: (message, fields) => writeConsoleLog("error", message, fields),
};

export default {
  async fetch(req: Request, env: CfEnv): Promise<Response> {
    const store = new CfKvStore(env.KEYCHAIN);
    const config = parseConfig({
      ADMIN_API_KEY:    env.ADMIN_API_KEY,
      READONLY_API_KEYS: env.READONLY_API_KEYS,
      RATE_LIMIT_MAX:   env.RATE_LIMIT_MAX,
      RATE_LIMIT_TTL:   env.RATE_LIMIT_TTL,
      CORS_ORIGINS:     env.CORS_ORIGINS,
      APP_VERSION:      env.APP_VERSION,
    });
    // createApp() is fast — it just wires up a router; no I/O.
    // The heavy work (KV reads) happens inside handleRequest().
    const handleRequest = createApp({ store, config, logger });
    return handleRequest(req);
  },
};
