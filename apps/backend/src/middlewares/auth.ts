import type { NextFunction, Request, Response } from "express";
import { verifyAccessToken } from "@/utils/jwt";
import { ApiError } from "@/utils/ApiError";
import type { UserRole } from "@shared/types/roles";
import { tokenBlacklistService } from "@/services/tokenBlacklist.service";
import { env } from "@/config/env";

export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    throw new ApiError(401, "Missing authorization token");
  }

  const token = authHeader.split(" ")[1];

  if (env.JWT_BLACKLIST_ENABLED && tokenBlacklistService.isBlacklisted(token)) {
    throw new ApiError(401, "Token has been revoked");
  }

  const payload = verifyAccessToken(token);

  req.context = {
    userId: payload.userId,
    tenantId: payload.tenantId,
    shopId: payload.shopId,
    role: payload.role
  };

  next();
}

export function authorize(roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.context || !roles.includes(req.context.role)) {
      throw new ApiError(403, "Forbidden");
    }

    next();
  };
}
