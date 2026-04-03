import { randomUUID } from "node:crypto";
import { ShopModel } from "@/models/shop.model";

export class ShopsRepository {
  async create(payload: {
    tenantId: string;
    shopId?: string;
    name: string;
    location: string;
    printerConfig?: Record<string, unknown>;
    isActive?: boolean;
  }) {
    return ShopModel.create({
      tenantId: payload.tenantId,
      shopId: payload.shopId ?? `shop_${randomUUID().slice(0, 8)}`,
      name: payload.name,
      location: payload.location,
      printerConfig: payload.printerConfig ?? {},
      isActive: payload.isActive ?? true
    });
  }

  async findAll(tenantId: string) {
    return ShopModel.find({ tenantId }).sort({ createdAt: -1 });
  }

  async findById(id: string, tenantId: string) {
    return ShopModel.findOne({ _id: id, tenantId });
  }

  async updateById(id: string, tenantId: string, payload: Record<string, unknown>) {
    return ShopModel.findOneAndUpdate({ _id: id, tenantId }, payload, { new: true });
  }

  async deleteById(id: string, tenantId: string) {
    return ShopModel.findOneAndDelete({ _id: id, tenantId });
  }
}
