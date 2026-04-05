import { MenuCategoryModel } from "@/models/menuCategory.model";
import { MenuItemModel } from "@/models/menuItem.model";

export class MenuRepository {
  async createCategory(payload: { tenantId: string; shopId: string; name: string; sortOrder: number; isActive: boolean }) {
    return MenuCategoryModel.create(payload);
  }

  async findCategories(tenantId: string, shopId: string) {
    return MenuCategoryModel.find({ tenantId, shopId })
      .select({ name: 1, sortOrder: 1, isActive: 1, createdAt: 1 })
      .sort({ sortOrder: 1, name: 1 })
      .lean();
  }

  async updateCategory(id: string, tenantId: string, shopId: string, payload: Record<string, unknown>) {
    return MenuCategoryModel.findOneAndUpdate({ _id: id, tenantId, shopId }, payload, { new: true });
  }

  async deleteCategory(id: string, tenantId: string, shopId: string) {
    await MenuItemModel.deleteMany({ categoryId: id, tenantId, shopId });
    return MenuCategoryModel.findOneAndDelete({ _id: id, tenantId, shopId });
  }

  async createItem(payload: {
    tenantId: string;
    shopId: string;
    categoryId: string;
    name: string;
    price: number;
    description: string;
    modifierEnabled: boolean;
    isAvailable: boolean;
    stockQty: number;
    lowStockThreshold: number;
    image: string;
    sortOrder: number;
  }) {
    return MenuItemModel.create(payload);
  }

  async findItems(tenantId: string, shopId: string) {
    return MenuItemModel.find({ tenantId, shopId })
      .select({ categoryId: 1, name: 1, price: 1, description: 1, modifierEnabled: 1, isAvailable: 1, stockQty: 1, lowStockThreshold: 1, image: 1, sortOrder: 1, createdAt: 1 })
      .sort({ sortOrder: 1, name: 1 })
      .lean();
  }

  async findItemById(id: string, tenantId: string, shopId: string) {
    return MenuItemModel.findOne({ _id: id, tenantId, shopId })
      .select({ categoryId: 1, name: 1, price: 1, description: 1, modifierEnabled: 1, isAvailable: 1, stockQty: 1, lowStockThreshold: 1, image: 1, sortOrder: 1, createdAt: 1 })
      .lean();
  }

  async findInventoryItems(tenantId: string, shopId: string) {
    return MenuItemModel.find({ tenantId, shopId })
      .select({ categoryId: 1, name: 1, isAvailable: 1, stockQty: 1, lowStockThreshold: 1, createdAt: 1 })
      .sort({ name: 1 })
      .lean();
  }

  async updateInventoryItem(id: string, tenantId: string, shopId: string, payload: { stockQty?: number; lowStockThreshold?: number; isAvailable?: boolean }) {
    return MenuItemModel.findOneAndUpdate({ _id: id, tenantId, shopId }, payload, { new: true });
  }

  async updateItem(id: string, tenantId: string, shopId: string, payload: Record<string, unknown>) {
    return MenuItemModel.findOneAndUpdate({ _id: id, tenantId, shopId }, payload, { new: true });
  }

  async deleteItem(id: string, tenantId: string, shopId: string) {
    return MenuItemModel.findOneAndDelete({ _id: id, tenantId, shopId });
  }
}
