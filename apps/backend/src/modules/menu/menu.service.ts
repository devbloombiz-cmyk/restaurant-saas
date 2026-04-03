import { ApiError } from "@/utils/ApiError";
import { MenuRepository } from "@/modules/menu/menu.repository";
import type { RequestContext } from "@/types/api";
import { AuditLogService } from "@/services/auditLog.service";
import { cacheService } from "@/services/cache.service";

export class MenuService {
  private readonly menuRepository = new MenuRepository();
  private readonly auditLogService = new AuditLogService();

  async createCategory(context: RequestContext, body: Record<string, unknown>) {
    const category = await this.menuRepository.createCategory({
      tenantId: context.tenantId,
      shopId: context.shopId,
      name: String(body.name),
      sortOrder: typeof body.sortOrder === "number" ? body.sortOrder : 0,
      isActive: typeof body.isActive === "boolean" ? body.isActive : true
    });

    await this.auditLogService.log({
      tenantId: context.tenantId,
      shopId: context.shopId,
      userId: context.userId,
      action: "menu_category_created",
      module: "menu",
      metadata: { categoryId: category.id, categoryName: category.name }
    });

    cacheService.clear(`menu-categories:${context.tenantId}:${context.shopId}`);

    return category;
  }

  async getCategories(context: RequestContext) {
    const cacheKey = `menu-categories:${context.tenantId}:${context.shopId}`;
    const cached = cacheService.get<Array<Record<string, unknown>>>(cacheKey);

    if (cached) {
      return cached;
    }

    const categories = await this.menuRepository.findCategories(context.tenantId, context.shopId);
    cacheService.set(cacheKey, categories, 30_000);
    return categories;
  }

  async updateCategory(context: RequestContext, id: string, body: Record<string, unknown>) {
    const category = await this.menuRepository.updateCategory(id, context.tenantId, context.shopId, body);

    if (!category) {
      throw new ApiError(404, "Category not found");
    }

    await this.auditLogService.log({
      tenantId: context.tenantId,
      shopId: context.shopId,
      userId: context.userId,
      action: "menu_category_updated",
      module: "menu",
      metadata: { categoryId: category.id, updates: body }
    });

    cacheService.clear(`menu-categories:${context.tenantId}:${context.shopId}`);

    return category;
  }

  async deleteCategory(context: RequestContext, id: string) {
    const category = await this.menuRepository.deleteCategory(id, context.tenantId, context.shopId);

    if (!category) {
      throw new ApiError(404, "Category not found");
    }

    await this.auditLogService.log({
      tenantId: context.tenantId,
      shopId: context.shopId,
      userId: context.userId,
      action: "menu_category_deleted",
      module: "menu",
      metadata: { categoryId: category.id }
    });

    cacheService.clear(`menu-categories:${context.tenantId}:${context.shopId}`);
    cacheService.clear(`menu-items:${context.tenantId}:${context.shopId}`);

    return { id: category.id };
  }

  async createItem(context: RequestContext, body: Record<string, unknown>) {
    const item = await this.menuRepository.createItem({
      tenantId: context.tenantId,
      shopId: context.shopId,
      categoryId: String(body.categoryId),
      name: String(body.name),
      price: Number(body.price),
      description: typeof body.description === "string" ? body.description : "",
      modifierEnabled: typeof body.modifierEnabled === "boolean" ? body.modifierEnabled : false,
      isAvailable: typeof body.isAvailable === "boolean" ? body.isAvailable : true,
      image: typeof body.image === "string" ? body.image : "",
      sortOrder: typeof body.sortOrder === "number" ? body.sortOrder : 0
    });

    await this.auditLogService.log({
      tenantId: context.tenantId,
      shopId: context.shopId,
      userId: context.userId,
      action: "menu_item_created",
      module: "menu",
      metadata: { itemId: item.id, itemName: item.name, price: item.price }
    });

    cacheService.clear(`menu-items:${context.tenantId}:${context.shopId}`);

    return item;
  }

  async getItems(context: RequestContext) {
    const cacheKey = `menu-items:${context.tenantId}:${context.shopId}`;
    const cached = cacheService.get<Array<Record<string, unknown>>>(cacheKey);

    if (cached) {
      return cached;
    }

    const items = await this.menuRepository.findItems(context.tenantId, context.shopId);
    cacheService.set(cacheKey, items, 30_000);
    return items;
  }

  async getItemById(context: RequestContext, id: string) {
    const item = await this.menuRepository.findItemById(id, context.tenantId, context.shopId);

    if (!item) {
      throw new ApiError(404, "Menu item not found");
    }

    return item;
  }

  async updateItem(context: RequestContext, id: string, body: Record<string, unknown>) {
    const item = await this.menuRepository.updateItem(id, context.tenantId, context.shopId, body);

    if (!item) {
      throw new ApiError(404, "Menu item not found");
    }

    await this.auditLogService.log({
      tenantId: context.tenantId,
      shopId: context.shopId,
      userId: context.userId,
      action: "menu_item_updated",
      module: "menu",
      metadata: { itemId: item.id, updates: body }
    });

    if (typeof body.price === "number") {
      await this.auditLogService.log({
        tenantId: context.tenantId,
        shopId: context.shopId,
        userId: context.userId,
        action: "price_changed",
        module: "menu",
        metadata: { itemId: item.id, newPrice: body.price }
      });
    }

    cacheService.clear(`menu-items:${context.tenantId}:${context.shopId}`);

    return item;
  }

  async deleteItem(context: RequestContext, id: string) {
    const item = await this.menuRepository.deleteItem(id, context.tenantId, context.shopId);

    if (!item) {
      throw new ApiError(404, "Menu item not found");
    }

    await this.auditLogService.log({
      tenantId: context.tenantId,
      shopId: context.shopId,
      userId: context.userId,
      action: "menu_item_deleted",
      module: "menu",
      metadata: { itemId: item.id }
    });

    cacheService.clear(`menu-items:${context.tenantId}:${context.shopId}`);

    return { id: item.id };
  }
}
