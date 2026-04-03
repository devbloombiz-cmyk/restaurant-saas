import { ApiError } from "@/utils/ApiError";
import { ShopsRepository } from "@/modules/shops/shops.repository";
import type { RequestContext } from "@/types/api";
import { USER_ROLES } from "@shared/types/roles";

export class ShopsService {
  private readonly shopsRepository = new ShopsRepository();

  async createShop(context: RequestContext, body: Record<string, unknown>) {
    const tenantId =
      context.role === USER_ROLES.SUPER_ADMIN && typeof body.tenantId === "string"
        ? body.tenantId
        : context.tenantId;

    const shopId =
      context.role === USER_ROLES.SUPER_ADMIN && typeof body.shopId === "string"
        ? body.shopId
        : undefined;

    return this.shopsRepository.create({
      tenantId,
      shopId,
      name: String(body.name),
      location: String(body.location),
      printerConfig: (body.printerConfig as Record<string, unknown>) ?? {},
      isActive: typeof body.isActive === "boolean" ? body.isActive : true
    });
  }

  async getShops(context: RequestContext) {
    return this.shopsRepository.findAll(context.tenantId);
  }

  async getShopById(context: RequestContext, id: string) {
    const shop = await this.shopsRepository.findById(id, context.tenantId);

    if (!shop) {
      throw new ApiError(404, "Shop not found");
    }

    return shop;
  }

  async updateShop(context: RequestContext, id: string, body: Record<string, unknown>) {
    const shop = await this.shopsRepository.updateById(id, context.tenantId, body);

    if (!shop) {
      throw new ApiError(404, "Shop not found");
    }

    return shop;
  }

  async deleteShop(context: RequestContext, id: string) {
    const shop = await this.shopsRepository.deleteById(id, context.tenantId);

    if (!shop) {
      throw new ApiError(404, "Shop not found");
    }

    return { id: shop.id };
  }
}
