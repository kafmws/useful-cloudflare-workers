// src/middleware/index.ts
// All middleware is stateless per-request; rate-limit state lives in KvStore.

import type { AppConfig } from "../config.js";
import type { KvStore }   from "../storage/interface.js";
import { isAdminKey, isValidKey } from "../config.js";
import { E } from "../api/response.js";

// ── Auth ─────────────────────────────────────────────────────────────────────

export function extractApiKey(req: Request): string | null {
  const header = req.headers.get("X-API-Key");
  if (header) return header.trim();
  const url = new URL(req.url);
  return url.searchParams.get("api_key");
}

export function requireAnyKey(cfg: AppConfig, req: Request): string | Response {
  const key = extractApiKey(req);
  if (!key || !isValidKey(cfg, key)) return E.unauthorized();
  return key;
}

export function requireAdminKey(cfg: AppConfig, req: Request): string | Response {
  const key = extractApiKey(req);
  if (!key || !isValidKey(cfg, key)) return E.unauthorized();
  if (!isAdminKey(cfg, key)) return E.forbidden();
  return key;
}

// ── Rate limiting ─────────────────────────────────────────────────────────────
// Uses KvStore so it works in both runtimes.
// For CF Workers, this uses KV (eventually consistent — good enough for rate limiting).
// For Node, it uses the file store (in-process, precise).
//
// Schema: rl:<key>:<windowStart>  →  count

const RL_PREFIX = "rl:";

export async function checkRateLimit(
  store: KvStore,
  cfg: AppConfig,
  identifier: string,
): Promise<Response | null> {
  if (cfg.rateLimitMax <= 0) return null;

  const window = Math.floor(Date.now() / 1000 / cfg.rateLimitTtl);
  const rlKey = `${RL_PREFIX}${identifier}:${window}`;

  const raw = await store.get(rlKey);
  const count = raw ? parseInt(raw, 10) : 0;

  if (count >= cfg.rateLimitMax) return E.tooMany();

  // Fire-and-forget the increment — don't await so it doesn't add latency
  store.put(rlKey, String(count + 1)).catch(() => {/* ignore */});

  return null;
}

// ── CORS ──────────────────────────────────────────────────────────────────────

export function corsHeaders(cfg: AppConfig, reqOrigin: string | null): Record<string, string> {
  const allowed = cfg.corsOrigins;
  let origin = "null";
  if (allowed.includes("*")) {
    origin = "*";
  } else if (reqOrigin && allowed.includes(reqOrigin)) {
    origin = reqOrigin;
  }
  return {
    "Access-Control-Allow-Origin":  origin,
    "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-API-Key",
    "Access-Control-Max-Age":       "86400",
  };
}

export function handlePreflight(cfg: AppConfig, req: Request): Response | null {
  if (req.method !== "OPTIONS") return null;
  return new Response(null, {
    status: 204,
    headers: corsHeaders(cfg, req.headers.get("Origin")),
  });
}
