// src/api/response.ts

export function json(data: unknown, status = 200, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...headers },
  });
}

export function ok(data: unknown, status = 200) { return json(data, status); }

export function err(message: string, status: number, detail?: unknown): Response {
  return json({ error: message, ...(detail ? { detail } : {}) }, status);
}

export const E = {
  badRequest:    (msg: string)  => err(msg, 400),
  unauthorized:  ()             => err("Invalid or missing API key", 401,
                                    { hint: "Pass key via X-API-Key header or ?api_key= query param" }),
  forbidden:     ()             => err("Admin API key required", 403),
  notFound:      (msg: string)  => err(msg, 404),
  conflict:      (msg: string)  => err(msg, 409),
  tooMany:       ()             => err("Rate limit exceeded", 429),
  internal:      (msg: string)  => err("Internal error: " + msg, 500),
};
