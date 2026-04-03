import { AuthRepository } from "@/modules/auth/auth.repository";
import { issueTokenPair, verifyRefreshToken } from "@/utils/jwt";
import { ApiError } from "@/utils/ApiError";
import { compareHash, hashValue } from "@/utils/crypto";
import { USER_ROLES } from "@shared/types/roles";
import { randomUUID } from "node:crypto";
import type { RequestContext } from "@/types/api";
import { AuditLogService } from "@/services/auditLog.service";
import { tokenBlacklistService } from "@/services/tokenBlacklist.service";
import { env } from "@/config/env";

export class AuthService {
  private readonly authRepository = new AuthRepository();
  private readonly auditLogService = new AuditLogService();

  async login(payload: {
    email: string;
    password: string;
    tenantId: string;
    shopId?: string;
  }): Promise<{ accessToken: string; refreshToken: string; user: Record<string, unknown> }> {
    const user = await this.authRepository.findUserForLogin(payload.email, payload.tenantId, payload.shopId);

    if (!user) {
      throw new ApiError(401, "Invalid credentials");
    }

    const isPasswordValid = await compareHash(payload.password, user.password);

    if (!isPasswordValid) {
      throw new ApiError(401, "Invalid credentials");
    }

    const jwtPayload = {
      userId: user.id,
      tenantId: user.tenantId,
      shopId: user.shopId,
      role: user.role
    };

    const tokens = issueTokenPair(jwtPayload);
    const refreshTokenHash = await hashValue(tokens.refreshToken);
    await this.authRepository.updateRefreshTokenHash(user.id, refreshTokenHash);

    await this.auditLogService.log({
      tenantId: user.tenantId,
      shopId: user.shopId,
      userId: user.id,
      action: "login_success",
      module: "auth",
      metadata: { email: user.email, role: user.role }
    });

    return {
      ...tokens,
      user: {
        userId: user.id,
        tenantId: user.tenantId,
        shopId: user.shopId,
        name: user.name,
        email: user.email,
        role: user.role
      }
    };
  }

  async registerShopAdmin(payload: {
    tenantName: string;
    tenantSlug: string;
    shopName: string;
    shopLocation: string;
    adminName: string;
    adminEmail: string;
    adminPassword: string;
  }): Promise<Record<string, unknown>> {
    const existingTenant = await this.authRepository.findTenantBySlug(payload.tenantSlug);

    if (existingTenant) {
      throw new ApiError(409, "Tenant slug already exists");
    }

    const tenant = await this.authRepository.createTenant({
      name: payload.tenantName,
      slug: payload.tenantSlug
    });

    const shopId = `shop_${randomUUID().slice(0, 8)}`;

    const shop = await this.authRepository.createShop({
      tenantId: tenant.id,
      shopId,
      name: payload.shopName,
      location: payload.shopLocation
    });

    const existingAdmin = await this.authRepository.findByEmailInTenant(payload.adminEmail, tenant.id);

    if (existingAdmin) {
      throw new ApiError(409, "Shop admin email already exists for this tenant");
    }

    const hashedPassword = await hashValue(payload.adminPassword);

    const user = await this.authRepository.createUser({
      tenantId: tenant.id,
      shopId: shop.shopId,
      name: payload.adminName,
      email: payload.adminEmail,
      password: hashedPassword,
      role: USER_ROLES.SHOP_ADMIN
    });

    await this.auditLogService.log({
      tenantId: tenant.id,
      shopId: shop.shopId,
      userId: user.id,
      action: "shop_admin_registered",
      module: "auth",
      metadata: { tenantSlug: tenant.slug, adminEmail: user.email }
    });

    return {
      tenantId: tenant.id,
      tenantName: tenant.name,
      tenantSlug: tenant.slug,
      shopId: shop.shopId,
      shopName: shop.name,
      adminUserId: user.id,
      adminEmail: user.email,
      role: user.role
    };
  }

  async registerCashier(context: RequestContext, payload: { name: string; email: string; password: string }): Promise<Record<string, unknown>> {
    const existingCashier = await this.authRepository.findByEmailInTenant(payload.email, context.tenantId);

    if (existingCashier) {
      throw new ApiError(409, "Cashier email already exists for this tenant");
    }

    const hashedPassword = await hashValue(payload.password);

    const user = await this.authRepository.createUser({
      tenantId: context.tenantId,
      shopId: context.shopId,
      name: payload.name,
      email: payload.email,
      password: hashedPassword,
      role: USER_ROLES.CASHIER
    });

    await this.auditLogService.log({
      tenantId: context.tenantId,
      shopId: context.shopId,
      userId: context.userId,
      action: "cashier_registered",
      module: "auth",
      metadata: { cashierId: user.id, cashierEmail: user.email }
    });

    return {
      userId: user.id,
      tenantId: user.tenantId,
      shopId: user.shopId,
      name: user.name,
      email: user.email,
      role: user.role
    };
  }

  async profile(context: RequestContext): Promise<Record<string, unknown>> {
    const user = await this.authRepository.findById(context.userId);

    if (!user || !user.isActive) {
      throw new ApiError(404, "User not found");
    }

    return {
      userId: user.id,
      tenantId: user.tenantId,
      shopId: user.shopId,
      name: user.name,
      email: user.email,
      role: user.role
    };
  }

  async refreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    const decoded = verifyRefreshToken(refreshToken);
    const user = await this.authRepository.findById(decoded.userId);

    if (!user || !user.refreshTokenHash || !user.isActive) {
      throw new ApiError(401, "Invalid credentials");
    }

    const isTokenValid = await compareHash(refreshToken, user.refreshTokenHash);

    if (!isTokenValid) {
      throw new ApiError(401, "Invalid refresh token");
    }

    const tokens = issueTokenPair({
      userId: user.id,
      tenantId: user.tenantId,
      shopId: user.shopId,
      role: user.role
    });

    const refreshTokenHash = await hashValue(tokens.refreshToken);
    await this.authRepository.updateRefreshTokenHash(user.id, refreshTokenHash);

    return tokens;
  }

  async logout(accessToken: string, refreshToken: string): Promise<{ loggedOut: true }> {
    const decoded = verifyRefreshToken(refreshToken);
    await this.authRepository.clearRefreshTokenHash(decoded.userId);

    if (env.JWT_BLACKLIST_ENABLED) {
      tokenBlacklistService.blacklist(accessToken, 60 * 60);
      tokenBlacklistService.blacklist(refreshToken, 7 * 24 * 60 * 60);
    }

    return { loggedOut: true };
  }
}
