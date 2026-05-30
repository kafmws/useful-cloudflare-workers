// src/app.ts
// The main request pipeline — completely runtime-agnostic.
// Both the CF Worker and the Node server call createApp() and pass a Request,
// getting back a Response. No globals, no singletons.

import { Router } from "./api/router.js";
import { corsHeaders, handlePreflight, checkRateLimit, extractApiKey } from "./middleware/index.js";
import {
  handleHealth,
  handleAddKey, handleListKeys, handleDeleteKey,
  handleGetOtp, handleGetAllOtp,
  handleOpenApi,
} from "./api/handlers.js";
import { Keychain } from "./storage/keychain.js";
import type { KvStore } from "./storage/interface.js";
import type { AppConfig } from "./config.js";
import { FRONTEND_HTML } from "./frontend/index.js";

export type LogFields = Record<string, unknown>;

export interface AppLogger {
  info(message: string, fields?: LogFields): void;
  warn(message: string, fields?: LogFields): void;
  error(message: string, fields?: LogFields): void;
}

export interface AppDeps {
  store: KvStore;
  config: AppConfig;
  logger?: AppLogger;
}

export function createApp(deps: AppDeps) {
  const { store, config: cfg, logger } = deps;
  const chain = new Keychain(store);

  const router = new Router();

  // ── System ──────────────────────────────────────────────────────────────
  router.get("/health",      (req, p) => handleHealth(req, p, cfg, chain));
  router.get("/openapi.json",(req, _p) => Promise.resolve(handleOpenApi(cfg)));

  // ── Keys ────────────────────────────────────────────────────────────────
  router.post(  "/api/v1/keys",        (req, p) => handleAddKey(req, p, cfg, chain));
  router.get(   "/api/v1/keys",        (req, p) => handleListKeys(req, p, cfg, chain));
  router.delete("/api/v1/keys/:name",  (req, p) => handleDeleteKey(req, p, cfg, chain));

  // ── OTP ─────────────────────────────────────────────────────────────────
  router.get("/api/v1/otp",       (req, p) => handleGetAllOtp(req, p, cfg, chain));
  router.get("/api/v1/otp/:name", (req, p) => handleGetOtp(req, p, cfg, chain));

  return async function handleRequest(req: Request): Promise<Response> {
    const startedAt = Date.now();
    const url = new URL(req.url);
    const origin = req.headers.get("Origin");
    const requestFields = {
      method: req.method,
      path: url.pathname,
      apiKey: extractApiKey(req) ? "present" : "missing",
      ip: req.headers.get("CF-Connecting-IP")
        ?? req.headers.get("X-Forwarded-For")?.split(",")[0]?.trim()
        ?? "unknown",
    };

    const finish = (res: Response): Response => {
      const durationMs = Date.now() - startedAt;
      const fields = { ...requestFields, status: res.status, durationMs };
      if (res.status >= 500) logger?.error("request", fields);
      else if (res.status >= 400) logger?.warn("request", fields);
      else logger?.info("request", fields);
      return res;
    };

    // ── CORS preflight ─────────────────────────────────────────────────
    const preflight = handlePreflight(cfg, req);
    if (preflight) return finish(preflight);

    const cors = corsHeaders(cfg, origin);

    const addCors = (res: Response): Response => {
      const next = new Response(res.body, res);
      Object.entries(cors).forEach(([k, v]) => next.headers.set(k, v));
      return next;
    };

    try {
      // ── Frontend & docs ─────────────────────────────────────────────
      if (req.method === "GET" && (url.pathname === "/" || url.pathname === "")) {
        return finish(addCors(new Response(FRONTEND_HTML, {
          headers: {
            "Content-Type": "text/html;charset=utf-8",
            "Cache-Control": "no-store",
          },
        })));
      }

      // ── Rate limiting ───────────────────────────────────────────────
      const identifier = extractApiKey(req) ?? req.headers.get("CF-Connecting-IP") ?? "anon";
      const rlResponse = await checkRateLimit(store, cfg, identifier);
      if (rlResponse) return finish(addCors(rlResponse));

      // ── Route ───────────────────────────────────────────────────────
      const response = await router.handle(req);
      if (response) return finish(addCors(response));

      return finish(addCors(new Response(JSON.stringify({ error: "Not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      })));
    } catch (e) {
      logger?.error("unhandled_error", {
        ...requestFields,
        error: e instanceof Error ? e.message : String(e),
        stack: e instanceof Error ? e.stack : undefined,
      });
      return finish(addCors(new Response(
        JSON.stringify({ error: "Internal server error" }), {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      )));
    }
  };
}
