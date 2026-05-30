// src/algo/otp.ts
// Self-contained HOTP (RFC 4226) + TOTP (RFC 6238) using Web Crypto API only.
// Web Crypto is available in both CF Workers and Node ≥18 (globalThis.crypto).
// CPU cost: one HMAC-SHA1 per code = well under 1ms.

import { base32Decode } from "./base32.js";

// ── HMAC-SHA1 ────────────────────────────────────────────────────────────────

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
}

async function hmacSha1(keyBytes: Uint8Array, data: Uint8Array): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey(
    "raw", toArrayBuffer(keyBytes),
    { name: "HMAC", hash: "SHA-1" },
    false, ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, toArrayBuffer(data));
  return new Uint8Array(sig);
}

// ── Dynamic truncation (RFC 4226 §5.3) ───────────────────────────────────────

function truncate(mac: Uint8Array): number {
  const offset = (mac[19]!) & 0x0f;
  return (
    ((mac[offset]!     & 0x7f) << 24) |
    ((mac[offset + 1]! & 0xff) << 16) |
    ((mac[offset + 2]! & 0xff) <<  8) |
     (mac[offset + 3]! & 0xff)
  );
}

// ── Counter → 8-byte big-endian ───────────────────────────────────────────────

function counterBytes(counter: number): Uint8Array {
  // counter is a safe JS integer (< 2^53); we only use the low 48 bits for
  // practical purposes, but fill all 8 bytes correctly.
  const buf = new Uint8Array(8);
  let c = counter;
  for (let i = 7; i >= 0; i--) {
    buf[i] = c & 0xff;
    c = Math.floor(c / 256);
  }
  return buf;
}

// ── HOTP (RFC 4226) ──────────────────────────────────────────────────────────

export async function hotp(
  secret: string,  // base32-encoded
  counter: number,
  digits: 6 | 7 | 8 = 6,
): Promise<string> {
  const keyBytes = base32Decode(secret);
  const mac = await hmacSha1(keyBytes, counterBytes(counter));
  const code = truncate(mac) % (10 ** digits);
  return String(code).padStart(digits, "0");
}

// ── TOTP (RFC 6238) ──────────────────────────────────────────────────────────

const STEP = 30; // seconds

export async function totp(
  secret: string,
  digits: 6 | 7 | 8 = 6,
  nowMs?: number,  // injectable for tests
): Promise<string> {
  const t = Math.floor((nowMs ?? Date.now()) / 1000 / STEP);
  return hotp(secret, t, digits);
}

export function totpSecondsRemaining(nowMs?: number): number {
  const now = (nowMs ?? Date.now()) / 1000;
  return STEP - Math.floor(now % STEP);
}

// ── Types ─────────────────────────────────────────────────────────────────────

export type OtpType = "totp" | "hotp";
export type Digits  = 6 | 7 | 8;
