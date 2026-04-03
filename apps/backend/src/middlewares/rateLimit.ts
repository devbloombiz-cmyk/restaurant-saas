import type { NextFunction, Request, Response } from "express";
import { ApiError } from "@/utils/ApiError";
import { env } from "@/config/env";

type Bucket = {
  count: number;
  resetAt: number;
};

function createLimiter(maxRequests: number, windowMs: number) {
  const buckets = new Map<string, Bucket>();

  return (req: Request, _res: Response, next: NextFunction): void => {
    const key = String(req.ip ?? req.headers["x-forwarded-for"] ?? "unknown-ip");
    const now = Date.now();
    const existing = buckets.get(key);

    if (!existing || now > existing.resetAt) {
      buckets.set(key, { count: 1, resetAt: now + windowMs });
      next();
      return;
    }

    if (existing.count >= maxRequests) {
      throw new ApiError(429, "Too many requests. Please retry shortly.");
    }

    existing.count += 1;
    buckets.set(key, existing);
    next();
  };
}

export const ipRateLimit = createLimiter(env.RATE_LIMIT_MAX_REQUESTS, env.RATE_LIMIT_WINDOW_MS);
export const loginThrottle = createLimiter(env.LOGIN_RATE_LIMIT_MAX, env.RATE_LIMIT_WINDOW_MS);
