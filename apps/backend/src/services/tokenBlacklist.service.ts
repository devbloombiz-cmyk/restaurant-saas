class TokenBlacklistService {
  private readonly store = new Map<string, number>();

  blacklist(token: string, ttlSeconds: number): void {
    const expiresAt = Date.now() + ttlSeconds * 1000;
    this.store.set(token, expiresAt);
  }

  isBlacklisted(token: string): boolean {
    const expiresAt = this.store.get(token);

    if (!expiresAt) {
      return false;
    }

    if (Date.now() > expiresAt) {
      this.store.delete(token);
      return false;
    }

    return true;
  }

  purgeExpired(): void {
    const now = Date.now();

    for (const [token, expiresAt] of this.store.entries()) {
      if (now > expiresAt) {
        this.store.delete(token);
      }
    }
  }
}

export const tokenBlacklistService = new TokenBlacklistService();
