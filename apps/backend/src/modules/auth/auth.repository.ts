import { UserModel } from "@/models/user.model";
import { TenantModel } from "@/models/tenant.model";
import { ShopModel } from "@/models/shop.model";
import type { UserRole } from "@shared/types/roles";

export class AuthRepository {
  async findUserForLogin(email: string, tenantId: string, shopId?: string) {
    const query = {
      email: email.toLowerCase(),
      tenantId,
      ...(shopId ? { shopId } : {}),
      isActive: true
    };

    return UserModel.findOne(query);
  }

  async findById(userId: string) {
    return UserModel.findById(userId);
  }

  async findTenantBySlug(slug: string) {
    return TenantModel.findOne({ slug: slug.toLowerCase() });
  }

  async createTenant(payload: { name: string; slug: string }) {
    return TenantModel.create({
      name: payload.name,
      slug: payload.slug.toLowerCase(),
      isActive: true
    });
  }

  async createShop(payload: {
    tenantId: string;
    shopId: string;
    name: string;
    location: string;
    printerConfig?: Record<string, unknown>;
  }) {
    return ShopModel.create({
      tenantId: payload.tenantId,
      shopId: payload.shopId,
      name: payload.name,
      location: payload.location,
      printerConfig: payload.printerConfig ?? {},
      isActive: true
    });
  }

  async createUser(payload: {
    tenantId: string;
    shopId: string;
    name: string;
    email: string;
    password: string;
    role: UserRole;
  }) {
    return UserModel.create({
      tenantId: payload.tenantId,
      shopId: payload.shopId,
      name: payload.name,
      email: payload.email.toLowerCase(),
      password: payload.password,
      role: payload.role,
      isActive: true
    });
  }

  async updateRefreshTokenHash(userId: string, refreshTokenHash: string) {
    return UserModel.findByIdAndUpdate(userId, { refreshTokenHash }, { new: true });
  }

  async clearRefreshTokenHash(userId: string) {
    return UserModel.findByIdAndUpdate(userId, { refreshTokenHash: null }, { new: true });
  }

  async findByEmailInTenant(email: string, tenantId: string) {
    return UserModel.findOne({
      email: email.toLowerCase(),
      tenantId
    });
  }
}
