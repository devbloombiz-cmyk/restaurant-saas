export function decodeJwtExpiry(token: string): number | null {
  try {
    const payloadBase64 = token.split(".")[1];
    if (!payloadBase64) {
      return null;
    }

    const normalized = payloadBase64.replace(/-/g, "+").replace(/_/g, "/");
    const json = atob(normalized);
    const parsed = JSON.parse(json) as { exp?: number };

    return typeof parsed.exp === "number" ? parsed.exp : null;
  } catch {
    return null;
  }
}

export function isTokenNearExpiry(token: string, thresholdSeconds = 120): boolean {
  const exp = decodeJwtExpiry(token);

  if (!exp) {
    return false;
  }

  const now = Math.floor(Date.now() / 1000);
  return exp - now <= thresholdSeconds;
}
