import jwt from "jsonwebtoken";
import { env } from "@/config/env";
import type { UserRole } from "@shared/types/roles";

export type JwtPayload = {
  userId: string;
  tenantId: string;
  shopId: string;
  role: UserRole;
};

export function signAccessToken(payload: JwtPayload): string {
  const expiresIn = env.JWT_ACCESS_EXPIRES_IN as jwt.SignOptions["expiresIn"];

  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn
  });
}

export function signRefreshToken(payload: JwtPayload): string {
  const expiresIn = env.JWT_REFRESH_EXPIRES_IN as jwt.SignOptions["expiresIn"];

  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn
  });
}

export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtPayload;
}

export function verifyRefreshToken(token: string): JwtPayload {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as JwtPayload;
}

export function issueTokenPair(payload: JwtPayload): { accessToken: string; refreshToken: string } {
  return {
    accessToken: signAccessToken(payload),
    refreshToken: signRefreshToken(payload)
  };
}
