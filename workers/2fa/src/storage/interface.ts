// src/storage/interface.ts
// Unified key-value store interface.
// Implementations: CfKvStore (Cloudflare KV) and FileKvStore (Node.js JSON file).
// Both are async; KV I/O doesn't count toward CF CPU time.

export interface KvStore {
  get(key: string): Promise<string | null>;
  put(key: string, value: string): Promise<void>;
  delete(key: string): Promise<void>;
  /** Returns all keys with the given prefix, without the prefix. */
  list(prefix: string): Promise<string[]>;
}

// ── Cloudflare KV adapter ─────────────────────────────────────────────────────

export class CfKvStore implements KvStore {
  constructor(private readonly ns: KVNamespace) {}

  get(key: string) { return this.ns.get(key); }

  async put(key: string, value: string) {
    await this.ns.put(key, value);
  }

  async delete(key: string) {
    await this.ns.delete(key);
  }

  async list(prefix: string): Promise<string[]> {
    const result = await this.ns.list({ prefix });
    return result.keys.map(k => k.name.slice(prefix.length));
  }
}

// ── Node.js JSON-file adapter ─────────────────────────────────────────────────
// Lazy-loaded so CF bundle never references Node APIs.

export class FileKvStore implements KvStore {
  private data: Record<string, string> = {};
  private loaded = false;
  private writeQueue: Promise<void> = Promise.resolve();
  private writeSeq = 0;

  constructor(private readonly filePath: string) {}

  private async load(): Promise<void> {
    if (this.loaded) return;
    const { readFile } = await import("node:fs/promises");
    try {
      const raw = await readFile(this.filePath, "utf8");
      this.data = JSON.parse(raw) as Record<string, string>;
    } catch {
      this.data = {};
    }
    this.loaded = true;
  }

  private async persist(): Promise<void> {
    const { writeFile, mkdir } = await import("node:fs/promises");
    const { dirname } = await import("node:path");
    await mkdir(dirname(this.filePath), { recursive: true });
    // Atomic-ish: write to .tmp then rename
    const tmp = `${this.filePath}.${process.pid}.${++this.writeSeq}.tmp`;
    await writeFile(tmp, JSON.stringify(this.data, null, 2), "utf8");
    const { rename } = await import("node:fs/promises");
    await rename(tmp, this.filePath);
  }

  private async write(mutator: () => void): Promise<void> {
    const run = this.writeQueue.then(async () => {
      await this.load();
      mutator();
      await this.persist();
    });
    this.writeQueue = run.catch(() => {});
    await run;
  }

  async get(key: string): Promise<string | null> {
    await this.writeQueue;
    await this.load();
    return this.data[key] ?? null;
  }

  async put(key: string, value: string): Promise<void> {
    await this.write(() => {
      this.data[key] = value;
    });
  }

  async delete(key: string): Promise<void> {
    await this.write(() => {
      delete this.data[key];
    });
  }

  async list(prefix: string): Promise<string[]> {
    await this.writeQueue;
    await this.load();
    return Object.keys(this.data)
      .filter(k => k.startsWith(prefix))
      .map(k => k.slice(prefix.length));
  }
}
