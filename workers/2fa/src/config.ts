// src/config.ts
// Unified configuration that works for both runtimes.
// CF Workers inject bindings via the `env` object passed to fetch().
// Node.js reads process.env (loaded from .env via --env-file or dotenv).

export interface AppConfig {
  adminApiKey: string;
  readonlyApiKeys: Set<string>;
  rateLimitMax: number;
  rateLimitTtl: number;  // seconds
  corsOrigins: string[]; // ["*"] means all
  appVersion: string;
}

/** CF Worker env shape — all secrets + vars declared in wrangler.toml */
export interface CfEnv {
  KEYCHAIN: KVNamespace;
  ADMIN_API_KEY: string;
  READONLY_API_KEYS?: string;
  RATE_LIMIT_MAX?: string;
  RATE_LIMIT_TTL?: string;
  CORS_ORIGINS?: string;
  APP_VERSION?: string;
}

/** Parse config from a flat string map (works for both CF env and Node process.env) */
export function parseConfig(env: Record<string, string | undefined>): AppConfig {
  const adminKey = env["ADMIN_API_KEY"] ?? "";
  if (!adminKey || adminKey === "change-me") {
    throw new Error("ADMIN_API_KEY is not set or is still the default value");
  }

  const roRaw = env["READONLY_API_KEYS"] ?? "";
  const readonlyKeys = new Set(
    roRaw.split(",").map(k => k.trim()).filter(Boolean)
  );

  const corsRaw = env["CORS_ORIGINS"] ?? "*";
  const corsOrigins = corsRaw.trim() === "*"
    ? ["*"]
    : corsRaw.split(",").map(o => o.trim()).filter(Boolean);

  return {
    adminApiKey: adminKey,
    readonlyApiKeys: readonlyKeys,
    rateLimitMax: parseInt(env["RATE_LIMIT_MAX"] ?? "60", 10),
    rateLimitTtl: parseInt(env["RATE_LIMIT_TTL"] ?? "60", 10),
    corsOrigins,
    appVersion: env["APP_VERSION"] ?? "1.0.0",
  };
}

export function isAdminKey(cfg: AppConfig, key: string): boolean {
  return key === cfg.adminApiKey;
}

export function isValidKey(cfg: AppConfig, key: string): boolean {
  return key === cfg.adminApiKey || cfg.readonlyApiKeys.has(key);
}
