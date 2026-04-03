type CacheRecord<T> = {
  value: T;
  expiresAt: number;
};

class CacheService {
  private readonly store = new Map<string, CacheRecord<unknown>>();

  get<T>(key: string): T | null {
    const record = this.store.get(key);

    if (!record) {
      return null;
    }

    if (Date.now() > record.expiresAt) {
      this.store.delete(key);
      return null;
    }

    return record.value as T;
  }

  set<T>(key: string, value: T, ttlMs = 30_000): void {
    this.store.set(key, {
      value,
      expiresAt: Date.now() + ttlMs
    });
  }

  clear(key?: string): void {
    if (key) {
      this.store.delete(key);
      return;
    }

    this.store.clear();
  }
}

export const cacheService = new CacheService();
