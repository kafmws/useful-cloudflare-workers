// src/node-server.ts
// Node.js server entry point. Uses built-in `node:http` + `node:crypto`
// (Web Crypto is globalThis.crypto on Node ≥18, no polyfill needed).
// Run: node --import tsx/esm src/node-server.ts
//  or: tsx src/node-server.ts

import { createServer } from "node:http";
import { appendFileSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import { createApp, type AppLogger, type LogFields } from "./app.js";
import { FileKvStore } from "./storage/interface.js";
import { parseConfig } from "./config.js";

// ── Load .env if present ─────────────────────────────────────────────────────

const __dir = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dir, "../.env");
if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq < 0) continue;
    const key = trimmed.slice(0, eq).trim();
    const val = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
    if (!(key in process.env)) process.env[key] = val;
  }
}

// ── Bootstrap ────────────────────────────────────────────────────────────────

const config = parseConfig(process.env as Record<string, string>);
const keychainPath = process.env["KEYCHAIN_PATH"] ?? "./data/keychain.json";
const logFilePath = process.env["LOG_FILE"] ?? "./data/2fa-worker.log";
const store = new FileKvStore(resolve(process.cwd(), keychainPath));
const logger = createNodeLogger(resolve(process.cwd(), logFilePath));
const handleRequest = createApp({ store, config, logger });

function createNodeLogger(filePath: string): AppLogger {
  mkdirSync(dirname(filePath), { recursive: true });

  const write = (level: "info" | "warn" | "error", message: string, fields: LogFields = {}) => {
    const entry = {
      ts: new Date().toISOString(),
      level,
      message,
      ...fields,
    };
    const line = JSON.stringify(entry);

    if (level === "error") console.error(line);
    else if (level === "warn") console.warn(line);
    else console.log(line);

    try {
      appendFileSync(filePath, line + "\n", "utf8");
    } catch (e) {
      console.error(JSON.stringify({
        ts: new Date().toISOString(),
        level: "error",
        message: "log_write_failed",
        filePath,
        error: e instanceof Error ? e.message : String(e),
      }));
    }
  };

  return {
    info: (message, fields) => write("info", message, fields),
    warn: (message, fields) => write("warn", message, fields),
    error: (message, fields) => write("error", message, fields),
  };
}

// ── Adapter: node:http IncomingMessage → Web Request → Response → node:http ──

const server = createServer(async (nodeReq, nodeRes) => {
  const proto = process.env["PROTO"] ?? "http";
  const host  = nodeReq.headers.host ?? "localhost";
  const url   = `${proto}://${host}${nodeReq.url ?? "/"}`;

  // Collect body
  const chunks: Buffer[] = [];
  for await (const chunk of nodeReq) chunks.push(chunk as Buffer);
  const body = chunks.length > 0 ? Buffer.concat(chunks) : null;

  // Build Web Request
  const headers = new Headers();
  for (const [k, v] of Object.entries(nodeReq.headers)) {
    if (v === undefined) continue;
    if (Array.isArray(v)) v.forEach(val => headers.append(k, val));
    else headers.set(k, v);
  }
  if (!headers.has("X-Forwarded-For") && nodeReq.socket.remoteAddress) {
    headers.set("X-Forwarded-For", nodeReq.socket.remoteAddress);
  }

  const webReq = new Request(url, {
    method: nodeReq.method ?? "GET",
    headers,
    body: body && body.length > 0 ? body : null,
    // @ts-expect-error — Node's Request accepts duplex
    duplex: "half",
  });

  // Handle
  const webRes = await handleRequest(webReq);

  // Write response
  nodeRes.statusCode = webRes.status;
  webRes.headers.forEach((v, k) => nodeRes.setHeader(k, v));
  const resBody = await webRes.arrayBuffer();
  nodeRes.end(Buffer.from(resBody));
});

const port = parseInt(process.env["PORT"] ?? "8000", 10);
const host = process.env["HOST"] ?? "0.0.0.0";

server.listen(port, host, () => {
  console.log(`2FA API (Node) — http://${host === "0.0.0.0" ? "localhost" : host}:${port}`);
  console.log(`  Frontend : http://localhost:${port}/`);
  console.log(`  API docs : http://localhost:${port}/openapi.json`);
  console.log(`  Health   : http://localhost:${port}/health`);
  console.log(`  Log file : ${resolve(process.cwd(), logFilePath)}`);
  logger.info("server_started", {
    host,
    port,
    frontend: `http://localhost:${port}/`,
    logFile: resolve(process.cwd(), logFilePath),
  });
});
