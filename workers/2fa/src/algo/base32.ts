// src/algo/base32.ts
// RFC 4648 §6 — alphabet A-Z + 2-7
// Pure synchronous, ~1µs, no allocations beyond output buffer.

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

function val(c: string): number {
  const i = CHARS.indexOf(c);
  if (i < 0) throw new Error(`Invalid base32 char: "${c}"`);
  return i;
}

export function base32Decode(raw: string): Uint8Array {
  const s = raw.toUpperCase().replace(/[\s=]/g, "");
  if (!s) throw new Error("Empty base32 string");
  const out = new Uint8Array(Math.floor((s.length * 5) / 8));
  let buf = 0, bits = 0, idx = 0;
  for (const c of s) {
    buf = (buf << 5) | val(c);
    bits += 5;
    if (bits >= 8) { bits -= 8; out[idx++] = (buf >> bits) & 0xff; }
  }
  return out;
}

export function isValidBase32(s: string): boolean {
  try {
    const n = s.toUpperCase().replace(/[\s=]/g, "");
    if (n.length < 8) return false;
    for (const c of n) if (!CHARS.includes(c)) return false;
    return true;
  } catch { return false; }
}
