// src/storage/keychain.ts
// Key management on top of KvStore.
// KV schema:
//   key:<name>  →  JSON of KeyEntry

import type { KvStore } from "./interface.js";
import type { Digits, OtpType } from "../algo/otp.js";

const PREFIX = "key:";

export interface KeyEntry {
  name: string;
  secret: string;    // base32, stored without padding
  accessKey: string; // per-entry read-only key for fetching this OTP
  otpType: OtpType;
  digits: Digits;
  counter: number;   // HOTP only
  createdAt: string; // ISO 8601
  otpauthLabel?: string;
  issuer?: string;
  account?: string;
}

export class Keychain {
  constructor(private readonly store: KvStore) {}

  private k(name: string) { return PREFIX + name; }

  async add(entry: Omit<KeyEntry, "createdAt" | "counter" | "accessKey"> & { counter?: number; accessKey?: string }): Promise<KeyEntry> {
    const existing = await this.store.get(this.k(entry.name));
    if (existing) throw new Error(`Key "${entry.name}" already exists`);
    const full: KeyEntry = {
      ...entry,
      accessKey: entry.accessKey ?? generateAccessKey(),
      counter: entry.counter ?? 0,
      createdAt: new Date().toISOString(),
    };
    await this.store.put(this.k(entry.name), JSON.stringify(full));
    return full;
  }

  async get(name: string): Promise<KeyEntry | null> {
    const raw = await this.store.get(this.k(name));
    if (!raw) return null;
    return JSON.parse(raw) as KeyEntry;
  }

  async list(): Promise<KeyEntry[]> {
    const names = await this.store.list(PREFIX);
    const entries = await Promise.all(
      names.map(n => this.store.get(PREFIX + n))
    );
    return entries
      .filter((e): e is string => e !== null)
      .map(e => JSON.parse(e) as KeyEntry);
  }

  async delete(name: string): Promise<void> {
    const existing = await this.store.get(this.k(name));
    if (!existing) throw new Error(`Key "${name}" not found`);
    await this.store.delete(this.k(name));
  }

  /** Atomically increment HOTP counter. Returns new value. */
  async incrementCounter(name: string): Promise<number> {
    const raw = await this.store.get(this.k(name));
    if (!raw) throw new Error(`Key "${name}" not found`);
    const entry = JSON.parse(raw) as KeyEntry;
    entry.counter += 1;
    await this.store.put(this.k(name), JSON.stringify(entry));
    return entry.counter;
  }
}

function generateAccessKey(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, b => b.toString(16).padStart(2, "0")).join("");
}
