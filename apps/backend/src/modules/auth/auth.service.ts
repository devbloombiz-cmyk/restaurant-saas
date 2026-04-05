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
import { ShopSettingModel } from "@/models/shopSetting.model";

const ROLE_PERMISSIONS: Record<string, string[]> = {
  [USER_ROLES.SUPER_ADMIN]: ["tenant:manage", "shop:manage", "user:manage", "audit:read", "system:diagnostics", "backup:manage"],
  [USER_ROLES.SHOP_ADMIN]: ["menu:manage", "settings:manage", "reports:read", "cashier:manage", "orders:manage", "diagnostics:read"],
  [USER_ROLES.CASHIER]: ["pos:checkout", "orders:create", "orders:read", "orders:update"]
};

export class AuthService {
  private readonly authRepository = new AuthRepository();
  private readonly auditLogService = new AuditLogService();

  private async buildSessionDetails(userId: string): Promise<Record<string, unknown>> {
    const user = await this.authRepository.findById(userId);

    if (!user || !user.isActive) {
      throw new ApiError(404, "User not found");
    }

    const [tenant, activeShop, accessibleShops, shopSettings] = await Promise.all([
      this.authRepository.findTenantById(user.tenantId),
      this.authRepository.findShopByTenantAndShopId(user.tenantId, user.shopId),
      this.authRepository.findShopsByTenant(user.tenantId),
      ShopSettingModel.findOne({ tenantId: user.tenantId, shopId: user.shopId }).select({ currency: 1 }).lean()
    ]);

    const activeShopCurrency =
      typeof shopSettings?.currency === "string" && shopSettings.currency.trim().length > 0
        ? shopSettings.currency.toUpperCase()
        : "INR";

    return {
      user: {
        userId: user.id,
        tenantId: user.tenantId,
        shopId: user.shopId,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive
      },
      tenant: tenant
        ? {
            tenantId: tenant.id,
            name: tenant.name,
            slug: tenant.slug,
            isActive: tenant.isActive
          }
        : null,
      activeShop: activeShop
        ? {
            shopId: activeShop.shopId,
            name: activeShop.name,
            location: activeShop.location,
            isActive: activeShop.isActive,
            currency: activeShopCurrency
          }
        : null,
      accessibleShops: accessibleShops.map((shop) => ({
        shopId: shop.shopId,
        name: shop.name,
        location: shop.location,
        isActive: shop.isActive
      })),
      permissions: ROLE_PERMISSIONS[user.role] ?? []
    };
  }

  async login(payload: {
    email: string;
    password: string;
    tenantId: string;
    shopId?: string;
  }): Promise<{ accessToken: string; refreshToken: string; user: Record<string, unknown>; session?: Record<string, unknown> }> {
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
      },
      session: await this.buildSessionDetails(user.id)
    };
  }

  async loginWithCredentials(payload: { email: string; password: string }): Promise<{ accessToken: string; refreshToken: string; user: Record<string, unknown>; session: Record<string, unknown> }> {
    const candidates = await this.authRepository.findActiveUsersByEmail(payload.email);

    if (candidates.length === 0) {
      throw new ApiError(401, "Invalid credentials");
    }

    if (candidates.length > 1) {
      throw new ApiError(409, "Multiple accounts found for this email. Contact support to complete account disambiguation.");
    }

    const user = candidates[0];
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
      action: "login_success_2field",
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
      },
      session: await this.buildSessionDetails(user.id)
    };
  }

  async registerShopAdmin(payload: {
    tenantName: string;
    tenantSlug: string;
    shopName: string;
    shopLocation: string;
    currency?: "INR" | "GBP" | "USD" | "EUR";
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

    await ShopSettingModel.findOneAndUpdate(
      { tenantId: tenant.id, shopId: shop.shopId },
      {
        $set: {
          shopName: shop.name,
          currency: payload.currency ?? "INR",
          currencyLocked: true
        },
        $setOnInsert: {
          tenantId: tenant.id,
          shopId: shop.shopId
        }
      },
      { upsert: true, new: true }
    );

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
      currency: payload.currency ?? "INR",
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
    const session = await this.buildSessionDetails(context.userId);
    const user = session.user as {
      userId: string;
      tenantId: string;
      shopId: string;
      name: string;
      email: string;
      role: string;
    };

    return {
      userId: user.userId,
      tenantId: user.tenantId,
      shopId: user.shopId,
      name: user.name,
      email: user.email,
      role: user.role,
      session
    };
  }

  async session(context: RequestContext): Promise<Record<string, unknown>> {
    return this.buildSessionDetails(context.userId);
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
