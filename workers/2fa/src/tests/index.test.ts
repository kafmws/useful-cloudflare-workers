// src/tests/index.test.ts
import { describe, it, expect, beforeEach } from "vitest";
import { base32Decode, isValidBase32 } from "../algo/base32.js";
import { hotp, totp, totpSecondsRemaining } from "../algo/otp.js";
import { parseOtpAuthUri } from "../algo/otpauth.js";
import { FileKvStore } from "../storage/interface.js";
import { Keychain } from "../storage/keychain.js";
import { createApp } from "../app.js";
import { parseConfig } from "../config.js";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { randomBytes } from "node:crypto";

// ── Base32 ───────────────────────────────────────────────────────────────────

describe("base32", () => {
  it("decodes canonical RFC test vector", () => {
    // "foobar" in base32 = MZXW6YTBOI
    const out = base32Decode("MZXW6YTBOI");
    expect(out).toEqual(new Uint8Array([0x66, 0x6f, 0x6f, 0x62, 0x61, 0x72]));
  });

  it("handles lowercase + padding", () => {
    expect(() => base32Decode("nzxxiidb==")).not.toThrow();
  });

  it("rejects invalid chars", () => {
    expect(() => base32Decode("INVALID!")).toThrow();
  });

  it("isValidBase32 rejects short strings", () => {
    expect(isValidBase32("ABC")).toBe(false);
  });

  it("isValidBase32 accepts valid secret", () => {
    expect(isValidBase32("NZXXIIDBEBVWK6JB")).toBe(true);
  });
});

// ── HOTP RFC 4226 Appendix D test vectors ────────────────────────────────────

describe("hotp — RFC 4226 test vectors", () => {
  // Secret: 12345678901234567890 (ASCII) → base32 = GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ
  const SECRET = "GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ";
  const EXPECTED = ["755224","287082","359152","969429","338314","254676","287922","162583","399871","520489"];

  EXPECTED.forEach((code, counter) => {
    it(`counter=${counter} → ${code}`, async () => {
      expect(await hotp(SECRET, counter, 6)).toBe(code);
    });
  });
});

// ── TOTP ─────────────────────────────────────────────────────────────────────

describe("totp", () => {
  // RFC 6238 test vector: T=0x0000000023523EC0 (Unix=1111111109), SHA1, secret=12345678901234567890
  const SECRET = "GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ";

  it("matches RFC 6238 vector at T=1111111109", async () => {
    const code = await totp(SECRET, 8, 1111111109 * 1000);
    expect(code).toBe("07081804");
  });

  it("totpSecondsRemaining is in [1, 30]", () => {
    const s = totpSecondsRemaining();
    expect(s).toBeGreaterThanOrEqual(1);
    expect(s).toBeLessThanOrEqual(30);
  });

  it("produces 6-digit code for known secret", async () => {
    const code = await totp("NZXXIIDBEBVWK6JB", 6);
    expect(code).toMatch(/^\d{6}$/);
  });
});

// ── otpauth URI ──────────────────────────────────────────────────────────────

describe("otpauth", () => {
  it("parses TOTP URI label, issuer, secret, and defaults", () => {
    const parsed = parseOtpAuthUri(
      "otpauth://totp/testService%3Adev_zezdukxt0s%40test.org?secret=NZXXIIDBEBVWK6JB&issuer=testService",
    );
    expect(parsed).toMatchObject({
      name: "testService:dev_zezdukxt0s@test.org",
      label: "testService:dev_zezdukxt0s@test.org",
      secret: "NZXXIIDBEBVWK6JB",
      otpType: "totp",
      digits: 6,
      issuer: "testService",
      account: "dev_zezdukxt0s@test.org",
    });
  });

  it("parses HOTP URI counter and digits", () => {
    const parsed = parseOtpAuthUri("otpauth://hotp/example?secret=NZXXIIDBEBVWK6JB&counter=7&digits=8");
    expect(parsed.otpType).toBe("hotp");
    expect(parsed.counter).toBe(7);
    expect(parsed.digits).toBe(8);
  });

  it("uses issuer plus account as name when label has no issuer prefix", () => {
    const a = parseOtpAuthUri("otpauth://totp/dev%40test.org?secret=NZXXIIDBEBVWK6JB&issuer=serviceA");
    const b = parseOtpAuthUri("otpauth://totp/dev%40test.org?secret=NZXXIIDBEBVWK6JB&issuer=serviceB");
    expect(a.name).toBe("serviceA:dev@test.org");
    expect(b.name).toBe("serviceB:dev@test.org");
  });
});

// ── FileKvStore ───────────────────────────────────────────────────────────────

describe("FileKvStore", () => {
  const mkStore = () => new FileKvStore(join(tmpdir(), `kv-${randomBytes(4).toString("hex")}.json`));

  it("get returns null for missing key", async () => {
    expect(await mkStore().get("x")).toBeNull();
  });

  it("put + get roundtrip", async () => {
    const s = mkStore();
    await s.put("hello", "world");
    expect(await s.get("hello")).toBe("world");
  });

  it("delete removes key", async () => {
    const s = mkStore();
    await s.put("k", "v");
    await s.delete("k");
    expect(await s.get("k")).toBeNull();
  });

  it("list returns keys with prefix stripped", async () => {
    const s = mkStore();
    await s.put("key:alpha", "1");
    await s.put("key:beta",  "2");
    await s.put("other:x",   "3");
    const names = await s.list("key:");
    expect(names.sort()).toEqual(["alpha", "beta"]);
  });

  it("serializes concurrent writes", async () => {
    const s = mkStore();
    await Promise.all(
      Array.from({ length: 10 }, (_, i) => s.put(`key:${i}`, String(i))),
    );
    const names = await s.list("key:");
    expect(names.sort()).toEqual(["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"]);
  });
});

// ── Keychain ──────────────────────────────────────────────────────────────────

describe("Keychain", () => {
  const mkChain = () =>
    new Keychain(new FileKvStore(join(tmpdir(), `kc-${randomBytes(4).toString("hex")}.json`)));

  it("add + get roundtrip", async () => {
    const c = mkChain();
    const e = await c.add({ name: "gh", secret: "NZXXIIDBEBVWK6JB", otpType: "totp", digits: 6 });
    expect(e.name).toBe("gh");
    expect(e.accessKey).toMatch(/^[a-f0-9]{64}$/);
    const got = await c.get("gh");
    expect(got?.secret).toBe("NZXXIIDBEBVWK6JB");
    expect(got?.accessKey).toBe(e.accessKey);
  });

  it("add duplicate throws", async () => {
    const c = mkChain();
    await c.add({ name: "x", secret: "NZXXIIDBEBVWK6JB", otpType: "totp", digits: 6 });
    await expect(c.add({ name: "x", secret: "NZXXIIDBEBVWK6JB", otpType: "totp", digits: 6 }))
      .rejects.toThrow("already exists");
  });

  it("delete removes key", async () => {
    const c = mkChain();
    await c.add({ name: "y", secret: "NZXXIIDBEBVWK6JB", otpType: "totp", digits: 6 });
    await c.delete("y");
    expect(await c.get("y")).toBeNull();
  });

  it("delete missing throws", async () => {
    await expect(mkChain().delete("nope")).rejects.toThrow("not found");
  });

  it("incrementCounter increments", async () => {
    const c = mkChain();
    await c.add({ name: "h", secret: "NZXXIIDBEBVWK6JB", otpType: "hotp", digits: 6 });
    expect(await c.incrementCounter("h")).toBe(1);
    expect(await c.incrementCounter("h")).toBe(2);
  });

  it("list returns all entries", async () => {
    const c = mkChain();
    await c.add({ name: "a", secret: "NZXXIIDBEBVWK6JB", otpType: "totp", digits: 6 });
    await c.add({ name: "b", secret: "NZXXIIDBEBVWK6JB", otpType: "hotp", digits: 8 });
    const all = await c.list();
    expect(all.map(e => e.name).sort()).toEqual(["a","b"]);
  });
});

// ── App (integration) ─────────────────────────────────────────────────────────

const SECRET = "NZXXIIDBEBVWK6JB";

function makeApp() {
  const store = new FileKvStore(join(tmpdir(), `app-${randomBytes(4).toString("hex")}.json`));
  const config = parseConfig({
    ADMIN_API_KEY:     "admin-key",
    READONLY_API_KEYS: "ro-key",
    RATE_LIMIT_MAX:    "0",  // disable rate limit for tests
    APP_VERSION:       "test",
  });
  const handle = createApp({ store, config });
  const req = (method: string, path: string, body?: unknown, key = "admin-key") =>
    handle(new Request("http://localhost" + path, {
      method,
      headers: { "X-API-Key": key, "Content-Type": "application/json" },
      ...(body ? { body: JSON.stringify(body) } : {}),
    }));
  return { req };
}

describe("App — health", () => {
  it("GET /health returns 200", async () => {
    const { req } = makeApp();
    const r = await req("GET", "/health");
    expect(r.status).toBe(200);
    expect((await r.json() as any).status).toBe("ok");
  });
});

describe("App — auth", () => {
  it("no key → 401", async () => {
    const { req } = makeApp();
    const r = await (async () => {
      const store = new FileKvStore(join(tmpdir(), "x.json"));
      const config = parseConfig({ ADMIN_API_KEY: "admin-key", RATE_LIMIT_MAX: "0" });
      return createApp({ store, config })(new Request("http://localhost/api/v1/otp"));
    })();
    expect(r.status).toBe(401);
  });

  it("wrong key → 401", async () => {
    const { req } = makeApp();
    const r = await req("GET", "/api/v1/otp", undefined, "bad");
    expect(r.status).toBe(401);
  });

  it("ro key → 403 on admin route", async () => {
    const { req } = makeApp();
    const r = await req("GET", "/api/v1/keys", undefined, "ro-key");
    expect(r.status).toBe(403);
  });

  it("ro key → 200 on otp route", async () => {
    const { req } = makeApp();
    // add key first with admin
    await req("POST", "/api/v1/keys", { name: "gh", secret: SECRET, otpType: "totp", digits: 6 });
    const r = await req("GET", "/api/v1/otp", undefined, "ro-key");
    expect(r.status).toBe(200);
  });
});

describe("App — keys CRUD", () => {
  it("POST /api/v1/keys → 201", async () => {
    const { req } = makeApp();
    const r = await req("POST", "/api/v1/keys", { name: "github", secret: SECRET, otpType: "totp", digits: 6 });
    expect(r.status).toBe(201);
    const body = await r.json() as any;
    expect(body.name).toBe("github");
    expect(body.accessKey).toMatch(/^[a-f0-9]{64}$/);
    expect(body.secret).toBeUndefined(); // secret must not leak in list
  });

  it("POST /api/v1/keys accepts otpauth URI and returns current TOTP", async () => {
    const { req } = makeApp();
    const uri = "otpauth://totp/testService%3Adev_zezdukxt0s%40test.org?secret=" + SECRET + "&issuer=testService";
    const r = await req("POST", "/api/v1/keys", { secret: uri });
    expect(r.status).toBe(201);
    const body = await r.json() as any;
    expect(body.name).toBe("testService:dev_zezdukxt0s@test.org");
    expect(body.otpauthLabel).toBe("testService:dev_zezdukxt0s@test.org");
    expect(body.issuer).toBe("testService");
    expect(body.account).toBe("dev_zezdukxt0s@test.org");
    expect(JSON.stringify(body)).not.toContain("otpauth://");
    expect(body.otpType).toBe("totp");
    expect(body.code).toMatch(/^\d{6}$/);
    expect(body.validForSeconds).toBeGreaterThanOrEqual(1);
  });

  it("otpauth URI name overrides a stale submitted name", async () => {
    const { req } = makeApp();
    const uri = "otpauth://totp/testService%3Adev_zezdukxt0s%40test.org?secret=" + SECRET + "&issuer=testService";
    const r = await req("POST", "/api/v1/keys", { name: "dev_zezdukxt0s_test.org", secret: uri });
    expect(r.status).toBe(201);
    const body = await r.json() as any;
    expect(body.name).toBe("testService:dev_zezdukxt0s@test.org");
  });

  it("supports ':' and '@' in key names for add, lookup, and delete", async () => {
    const { req } = makeApp();
    const name = "testService:dev_zezdukxt0s@test.org";
    const add = await req("POST", "/api/v1/keys", { name, secret: SECRET });
    expect(add.status).toBe(201);

    const get = await req("GET", "/api/v1/otp/" + encodeURIComponent(name));
    expect(get.status).toBe(200);
    expect((await get.json() as any).name).toBe(name);

    const del = await req("DELETE", "/api/v1/keys/" + encodeURIComponent(name));
    expect(del.status).toBe(200);
  });

  it("duplicate key → 409", async () => {
    const { req } = makeApp();
    await req("POST", "/api/v1/keys", { name: "dup", secret: SECRET });
    const r = await req("POST", "/api/v1/keys", { name: "dup", secret: SECRET });
    expect(r.status).toBe(409);
  });

  it("invalid base32 → 400", async () => {
    const { req } = makeApp();
    const r = await req("POST", "/api/v1/keys", { name: "bad", secret: "!!!NOTBASE32!!!" });
    expect(r.status).toBe(400);
  });

  it("GET /api/v1/keys lists keys", async () => {
    const { req } = makeApp();
    await req("POST", "/api/v1/keys", { name: "k1", secret: SECRET });
    await req("POST", "/api/v1/keys", { name: "k2", secret: SECRET });
    const r = await req("GET", "/api/v1/keys");
    expect(r.status).toBe(200);
    const body = await r.json() as any;
    expect(body.total).toBe(2);
    // secret must not appear in list
    body.keys.forEach((k: any) => expect(k.secret).toBeUndefined());
    body.keys.forEach((k: any) => expect(k.accessKey).toMatch(/^[a-f0-9]{64}$/));
  });

  it("per-entry accessKey can fetch only its own OTP", async () => {
    const { req } = makeApp();
    const addA = await req("POST", "/api/v1/keys", { name: "a", secret: SECRET });
    const addB = await req("POST", "/api/v1/keys", { name: "b", secret: SECRET });
    const a = await addA.json() as any;
    const b = await addB.json() as any;

    const own = await req("GET", "/api/v1/otp/a", undefined, a.accessKey);
    expect(own.status).toBe(200);
    expect((await own.json() as any).name).toBe("a");

    const other = await req("GET", "/api/v1/otp/b", undefined, a.accessKey);
    expect(other.status).toBe(401);

    const all = await req("GET", "/api/v1/otp", undefined, a.accessKey);
    expect(all.status).toBe(401);

    const bOwn = await req("GET", "/api/v1/otp/b", undefined, b.accessKey);
    expect(bOwn.status).toBe(200);
  });

  it("DELETE removes key", async () => {
    const { req } = makeApp();
    await req("POST", "/api/v1/keys", { name: "del", secret: SECRET });
    const r = await req("DELETE", "/api/v1/keys/del");
    expect(r.status).toBe(200);
  });

  it("DELETE missing → 404", async () => {
    const { req } = makeApp();
    expect((await req("DELETE", "/api/v1/keys/ghost")).status).toBe(404);
  });
});

describe("App — OTP generation", () => {
  it("GET /api/v1/otp/:name returns 6-digit code", async () => {
    const { req } = makeApp();
    await req("POST", "/api/v1/keys", { name: "totp1", secret: SECRET, otpType: "totp", digits: 6 });
    const r = await req("GET", "/api/v1/otp/totp1");
    expect(r.status).toBe(200);
    const body = await r.json() as any;
    expect(body.code).toMatch(/^\d{6}$/);
    expect(body.validForSeconds).toBeGreaterThanOrEqual(1);
  });

  it("GET /api/v1/otp returns all TOTP codes", async () => {
    const { req } = makeApp();
    await req("POST", "/api/v1/keys", { name: "a", secret: SECRET });
    await req("POST", "/api/v1/keys", { name: "b", secret: SECRET });
    const r = await req("GET", "/api/v1/otp");
    expect(r.status).toBe(200);
    const body = await r.json() as any;
    expect(body.total).toBe(2);
  });

  it("HOTP increments counter each call", async () => {
    const { req } = makeApp();
    await req("POST", "/api/v1/keys", { name: "h", secret: SECRET, otpType: "hotp", digits: 6 });
    const r1 = await (await req("GET", "/api/v1/otp/h")).json() as any;
    const r2 = await (await req("GET", "/api/v1/otp/h")).json() as any;
    expect(r1.counter).toBe(1);
    expect(r2.counter).toBe(2);
    expect(r1.code).not.toBe(r2.code);
  });

  it("unknown key → 404", async () => {
    const { req } = makeApp();
    expect((await req("GET", "/api/v1/otp/ghost")).status).toBe(404);
  });
});

describe("App — CORS", () => {
  it("OPTIONS preflight returns 204", async () => {
    const store = new FileKvStore(join(tmpdir(), "cors.json"));
    const config = parseConfig({ ADMIN_API_KEY: "k", RATE_LIMIT_MAX: "0" });
    const handle = createApp({ store, config });
    const r = await handle(new Request("http://localhost/api/v1/otp", {
      method: "OPTIONS",
      headers: { "Origin": "http://example.com", "Access-Control-Request-Method": "GET" },
    }));
    expect(r.status).toBe(204);
    expect(r.headers.get("Access-Control-Allow-Origin")).toBeTruthy();
  });
});

describe("App — frontend", () => {
  it("GET / returns HTML", async () => {
    const store = new FileKvStore(join(tmpdir(), "fe.json"));
    const config = parseConfig({ ADMIN_API_KEY: "k", RATE_LIMIT_MAX: "0" });
    const handle = createApp({ store, config });
    const r = await handle(new Request("http://localhost/"));
    expect(r.status).toBe(200);
    expect(r.headers.get("Content-Type")).toContain("text/html");
  });
});
