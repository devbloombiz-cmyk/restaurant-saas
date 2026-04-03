import { ModifierModel } from "@/models/modifier.model";

export class ModifiersRepository {
  async create(payload: {
    tenantId: string;
    shopId: string;
    itemId: string;
    name: string;
    priceAdjustment: number;
    type: "add" | "remove";
  }) {
    return ModifierModel.create(payload);
  }

  async findAll(tenantId: string, shopId: string) {
    return ModifierModel.find({ tenantId, shopId }).sort({ createdAt: -1 });
  }

  async updateById(id: string, tenantId: string, shopId: string, payload: Record<string, unknown>) {
    return ModifierModel.findOneAndUpdate({ _id: id, tenantId, shopId }, payload, { new: true });
  }

  async deleteById(id: string, tenantId: string, shopId: string) {
    return ModifierModel.findOneAndDelete({ _id: id, tenantId, shopId });
  }
}
