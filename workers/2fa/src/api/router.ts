// src/api/router.ts
// Zero-dependency fetch-based router.
// Pattern syntax: /path/:param  (no wildcards needed)

export type Handler = (req: Request, params: Record<string, string>) => Promise<Response>;

interface Route {
  method: string;
  pattern: string[];  // segments, e.g. ["api","v1","otp",":name"]
  handler: Handler;
}

export class Router {
  private routes: Route[] = [];

  on(method: string, path: string, handler: Handler): this {
    this.routes.push({
      method: method.toUpperCase(),
      pattern: path.split("/").filter(Boolean),
      handler,
    });
    return this;
  }

  get(path: string, h: Handler)    { return this.on("GET",    path, h); }
  post(path: string, h: Handler)   { return this.on("POST",   path, h); }
  delete(path: string, h: Handler) { return this.on("DELETE", path, h); }

  match(method: string, pathname: string): { handler: Handler; params: Record<string, string> } | null {
    const segments = pathname.split("/").filter(Boolean);
    for (const route of this.routes) {
      if (route.method !== method.toUpperCase()) continue;
      if (route.pattern.length !== segments.length) continue;
      const params: Record<string, string> = {};
      let ok = true;
      for (let i = 0; i < route.pattern.length; i++) {
        const p = route.pattern[i]!;
        const s = segments[i]!;
        if (p.startsWith(":")) {
          params[p.slice(1)] = decodeURIComponent(s);
        } else if (p !== s) {
          ok = false; break;
        }
      }
      if (ok) return { handler: route.handler, params };
    }
    return null;
  }

  async handle(req: Request): Promise<Response | null> {
    const url = new URL(req.url);
    const match = this.match(req.method, url.pathname);
    if (!match) return null;
    return match.handler(req, match.params);
  }
}
