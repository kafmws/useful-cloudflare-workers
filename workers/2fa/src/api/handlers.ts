// src/api/handlers.ts
// Pure request→response handlers. No side-effectful globals.

import { hotp, totp, totpSecondsRemaining } from "../algo/otp.js";
import { isValidBase32 } from "../algo/base32.js";
import { isOtpAuthUri, parseOtpAuthUri } from "../algo/otpauth.js";
import { Keychain } from "../storage/keychain.js";
import type { AppConfig } from "../config.js";
import { ok, E } from "./response.js";
import { extractApiKey, requireAnyKey, requireAdminKey } from "../middleware/index.js";
import type { Digits, OtpType } from "../algo/otp.js";

// ── Health ────────────────────────────────────────────────────────────────────

export async function handleHealth(
  _req: Request,
  _params: Record<string, string>,
  cfg: AppConfig,
  chain: Keychain,
): Promise<Response> {
  const keys = await chain.list();
  return ok({ status: "ok", version: cfg.appVersion, keychainEntries: keys.length });
}

// ── Key management (admin only) ───────────────────────────────────────────────

export async function handleAddKey(
  req: Request,
  _params: Record<string, string>,
  cfg: AppConfig,
  chain: Keychain,
): Promise<Response> {
  const auth = requireAdminKey(cfg, req);
  if (auth instanceof Response) return auth;

  let body: unknown;
  try { body = await req.json(); }
  catch { return E.badRequest("Request body must be valid JSON"); }

  const raw = body as Record<string, unknown>;
  let parsed: ReturnType<typeof parseOtpAuthUri> | null = null;
  if (typeof raw.secret === "string" && isOtpAuthUri(raw.secret)) {
    try {
      parsed = parseOtpAuthUri(raw.secret);
    } catch (e) {
      return E.badRequest(e instanceof Error ? e.message : "otpauth URI is invalid");
    }
  }

  const name = parsed?.name ?? raw.name;
  const secret = parsed?.secret ?? raw.secret;
  const otpType = raw.otpType ?? parsed?.otpType ?? "totp";
  const digits = raw.digits ?? parsed?.digits ?? 6;
  const counter = raw.counter ?? parsed?.counter;
  const counterValue = typeof counter === "number" ? counter : undefined;

  if (typeof name !== "string" || !name.trim()) {
    return E.badRequest("name must be a non-empty string");
  }
  if (typeof secret !== "string" || !isValidBase32(secret)) {
    return E.badRequest("secret must be a valid Base32 string (A-Z, 2-7, min 8 chars)");
  }
  if (otpType !== "totp" && otpType !== "hotp") {
    return E.badRequest("otpType must be 'totp' or 'hotp'");
  }
  if (digits !== 6 && digits !== 7 && digits !== 8) {
    return E.badRequest("digits must be 6, 7, or 8");
  }
  if (counter !== undefined && (counterValue === undefined || !Number.isInteger(counterValue) || counterValue < 0)) {
    return E.badRequest("counter must be a non-negative integer");
  }

  try {
    const entry = await chain.add({
      name: name.trim(),
      secret: secret.toUpperCase().replace(/\s/g, ""),
      otpType: otpType as OtpType,
      digits: digits as Digits,
      ...(counterValue !== undefined ? { counter: counterValue } : {}),
      ...(parsed ? { otpauthLabel: parsed.label } : {}),
      ...(parsed?.issuer ? { issuer: parsed.issuer } : {}),
      ...(parsed?.account ? { account: parsed.account } : {}),
    });
    const { secret: _s, ...safe } = entry;
    if (entry.otpType === "hotp") {
      const code = await hotp(entry.secret, entry.counter, entry.digits);
      return ok({ ...safe, code, counter: entry.counter }, 201);
    }
    const code = await totp(entry.secret, entry.digits);
    return ok({ ...safe, code, validForSeconds: totpSecondsRemaining() }, 201);
  } catch (e) {
    if (e instanceof Error && e.message.includes("already exists")) {
      return E.conflict(e.message);
    }
    throw e;
  }
}

export async function handleListKeys(
  req: Request,
  _params: Record<string, string>,
  cfg: AppConfig,
  chain: Keychain,
): Promise<Response> {
  const auth = requireAdminKey(cfg, req);
  if (auth instanceof Response) return auth;
  const keys = await chain.list();
  // Strip the secret from the list response
  const safe = keys.map(({ secret: _s, ...rest }) => rest);
  return ok({ keys: safe, total: safe.length });
}

export async function handleDeleteKey(
  req: Request,
  params: Record<string, string>,
  cfg: AppConfig,
  chain: Keychain,
): Promise<Response> {
  const auth = requireAdminKey(cfg, req);
  if (auth instanceof Response) return auth;
  const name = params["name"] ?? "";
  try {
    await chain.delete(name);
    return ok({ deleted: name, message: `Key "${name}" deleted` });
  } catch (e) {
    if (e instanceof Error && e.message.includes("not found")) return E.notFound(e.message);
    throw e;
  }
}

// ── OTP generation (any valid key) ────────────────────────────────────────────

export async function handleGetOtp(
  req: Request,
  params: Record<string, string>,
  cfg: AppConfig,
  chain: Keychain,
): Promise<Response> {
  const name = params["name"] ?? "";
  const entry = await chain.get(name);
  if (!entry) return E.notFound(`Key "${name}" not found`);
  const auth = requireAnyKey(cfg, req);
  if (auth instanceof Response && extractApiKey(req) !== entry.accessKey) return auth;

  if (entry.otpType === "hotp") {
    const code = await hotp(entry.secret, entry.counter, entry.digits);
    const newCounter = await chain.incrementCounter(name);
    return ok({ name, code, otpType: "hotp", digits: entry.digits, counter: newCounter });
  }

  const code = await totp(entry.secret, entry.digits);
  const validForSeconds = totpSecondsRemaining();
  return ok({ name, code, otpType: "totp", digits: entry.digits, validForSeconds });
}

export async function handleGetAllOtp(
  req: Request,
  _params: Record<string, string>,
  cfg: AppConfig,
  chain: Keychain,
): Promise<Response> {
  const auth = requireAnyKey(cfg, req);
  if (auth instanceof Response) return auth;

  const keys = await chain.list();
  const totpKeys = keys.filter(k => k.otpType === "totp");
  const validForSeconds = totpSecondsRemaining();

  const codes = await Promise.all(
    totpKeys.map(async k => ({
      name: k.name,
      code: await totp(k.secret, k.digits),
      otpType: "totp" as const,
      digits: k.digits,
      validForSeconds,
    }))
  );

  return ok({ codes, total: codes.length, validForSeconds });
}

// ── OpenAPI spec (self-documenting) ──────────────────────────────────────────

export function handleOpenApi(cfg: AppConfig): Response {
  const spec = {
    openapi: "3.0.3",
    info: {
      title: "2FA API",
      version: cfg.appVersion,
      description:
        "TOTP/HOTP key management and code generation. " +
        "Authenticate via `X-API-Key` header or `?api_key=` query param.",
    },
    components: {
      securitySchemes: {
        ApiKeyHeader: { type: "apiKey", in: "header", name: "X-API-Key" },
        ApiKeyQuery:  { type: "apiKey", in: "query",  name: "api_key"   },
      },
    },
    security: [{ ApiKeyHeader: [] }, { ApiKeyQuery: [] }],
    paths: {
      "/health": {
        get: {
          tags: ["System"],
          summary: "Health check",
          security: [],
          responses: { "200": { description: "Service is healthy" } },
        },
      },
      "/api/v1/keys": {
        get: {
          tags: ["Keys"],
          summary: "List all keys (admin)",
          responses: { "200": { description: "Key list" }, "403": { description: "Forbidden" } },
        },
        post: {
          tags: ["Keys"],
          summary: "Add a new key (admin)",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["secret"],
                  properties: {
                    name:    { type: "string", example: "ExampleService:demo-user", description: "Optional when secret is an otpauth:// URI" },
                    accessKey: {
                      type: "string",
                      readOnly: true,
                      description: "Generated per-entry read-only key for GET /api/v1/otp/{name}",
                    },
                    secret:  {
                      type: "string",
                      example: "JBSWY3DPEHPK3PXP",
                      description: "Base32 secret or otpauth:// URI",
                    },
                    otpType: { type: "string", enum: ["totp","hotp"], default: "totp" },
                    digits:  { type: "integer", enum: [6,7,8], default: 6 },
                    counter: { type: "integer", minimum: 0, description: "HOTP counter" },
                  },
                },
                examples: {
                  base32: {
                    value: { name: "ExampleService:demo-user", secret: "JBSWY3DPEHPK3PXP", otpType: "totp", digits: 6 },
                  },
                  otpauth: {
                    value: {
                      secret: "otpauth://totp/ExampleService%3Ademo-user?secret=JBSWY3DPEHPK3PXP&issuer=ExampleService",
                    },
                  },
                },
              },
            },
          },
          responses: {
            "201": { description: "Key created; response includes current OTP code" },
            "409": { description: "Key already exists" },
          },
        },
      },
      "/api/v1/keys/{name}": {
        delete: {
          tags: ["Keys"],
          summary: "Delete a key (admin)",
          parameters: [{ name: "name", in: "path", required: true, schema: { type: "string" } }],
          responses: { "200": { description: "Deleted" }, "404": { description: "Not found" } },
        },
      },
      "/api/v1/otp": {
        get: {
          tags: ["OTP"],
          summary: "Generate codes for all TOTP keys",
          responses: { "200": { description: "All TOTP codes" } },
        },
      },
      "/api/v1/otp/{name}": {
        get: {
          tags: ["OTP"],
          summary: "Generate code for a named key",
          parameters: [{ name: "name", in: "path", required: true, schema: { type: "string" } }],
          responses: { "200": { description: "OTP code" }, "404": { description: "Not found" } },
        },
      },
    },
  };
  return new Response(JSON.stringify(spec, null, 2), {
    headers: { "Content-Type": "application/json" },
  });
}
