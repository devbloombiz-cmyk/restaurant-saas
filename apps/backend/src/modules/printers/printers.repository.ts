import { PrinterSettingModel } from "@/models/printerSetting.model";
import { OrderModel } from "@/models/order.model";

export class PrintersRepository {
  async getSettings(tenantId: string, shopId: string) {
    return PrinterSettingModel.findOne({ tenantId, shopId });
  }

  async upsertSettings(tenantId: string, shopId: string, payload: Record<string, unknown>) {
    return PrinterSettingModel.findOneAndUpdate(
      { tenantId, shopId },
      { $set: payload, $setOnInsert: { tenantId, shopId } },
      { new: true, upsert: true }
    );
  }

  async findOrderById(orderId: string, tenantId: string, shopId: string) {
    return OrderModel.findOne({ _id: orderId, tenantId, shopId });
  }

  async findLastOrder(tenantId: string, shopId: string) {
    return OrderModel.findOne({ tenantId, shopId }).sort({ createdAt: -1 });
  }
}
