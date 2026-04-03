import { ShopSettingModel } from "@/models/shopSetting.model";

export class SettingsRepository {
  async getShopSettings(tenantId: string, shopId: string) {
    return ShopSettingModel.findOne({ tenantId, shopId });
  }

  async upsertShopSettings(tenantId: string, shopId: string, payload: Record<string, unknown>) {
    return ShopSettingModel.findOneAndUpdate(
      { tenantId, shopId },
      { $set: payload, $setOnInsert: { tenantId, shopId, shopName: payload.shopName ?? shopId } },
      { upsert: true, new: true }
    );
  }
}
