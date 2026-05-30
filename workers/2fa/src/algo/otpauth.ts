import type { Digits, OtpType } from "./otp.js";

export interface ParsedOtpAuthUri {
  name: string;
  label: string;
  secret: string;
  otpType: OtpType;
  digits: Digits;
  counter?: number;
  issuer?: string;
  account?: string;
}

export function isOtpAuthUri(value: string): boolean {
  return value.trim().toLowerCase().startsWith("otpauth://");
}

export function normalizeKeyName(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_.-]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 80);
}

function parseDigits(raw: string | null): Digits {
  if (raw === null || raw === "") return 6;
  const n = Number(raw);
  if (n === 6 || n === 7 || n === 8) return n;
  throw new Error("otpauth digits must be 6, 7, or 8");
}

function parseCounter(raw: string | null): number | undefined {
  if (raw === null || raw === "") return undefined;
  const n = Number(raw);
  if (!Number.isInteger(n) || n < 0) throw new Error("otpauth counter must be a non-negative integer");
  return n;
}

export function parseOtpAuthUri(raw: string): ParsedOtpAuthUri {
  let url: URL;
  try {
    url = new URL(raw.trim());
  } catch {
    throw new Error("otpauth URI is invalid");
  }

  if (url.protocol !== "otpauth:") throw new Error("otpauth URI must use otpauth://");

  const otpType = url.hostname.toLowerCase();
  if (otpType !== "totp" && otpType !== "hotp") {
    throw new Error("otpauth type must be totp or hotp");
  }

  const label = decodeURIComponent(url.pathname.replace(/^\/+/, "")).trim();
  if (!label) throw new Error("otpauth URI label is required");
  const issuerParam = url.searchParams.get("issuer")?.trim() || undefined;
  const colon = label.indexOf(":");
  const labelIssuer = colon >= 0 ? label.slice(0, colon).trim() : undefined;
  const account = (colon >= 0 ? label.slice(colon + 1) : label).trim();
  const issuer = issuerParam ?? labelIssuer;
  const secret = url.searchParams.get("secret")?.trim().toUpperCase().replace(/\s/g, "");
  if (!secret) throw new Error("otpauth URI must include a secret");

  const name = labelIssuer || !issuer ? label : `${issuer}:${account}`;
  if (!name) throw new Error("otpauth URI label cannot produce a key name");

  const parsed: ParsedOtpAuthUri = {
    name,
    label,
    secret,
    otpType,
    digits: parseDigits(url.searchParams.get("digits")),
  };
  const counter = parseCounter(url.searchParams.get("counter"));
  if (counter !== undefined) parsed.counter = counter;
  if (issuer) parsed.issuer = issuer;
  if (account) parsed.account = account;
  return parsed;
}
