import { OrderModel } from "@/models/order.model";
import { MenuCategoryModel } from "@/models/menuCategory.model";
import { MenuItemModel } from "@/models/menuItem.model";

export class ExportRepository {
  async orders(tenantId: string, shopId: string) {
    return OrderModel.find({ tenantId, shopId }).sort({ createdAt: -1 }).lean();
  }

  async reports(tenantId: string, shopId: string) {
    return OrderModel.aggregate([
      { $match: { tenantId, shopId } },
      {
        $group: {
          _id: "$paymentMode",
          totalOrders: { $sum: 1 },
          totalSales: { $sum: "$total" }
        }
      }
    ]);
  }

  async menu(tenantId: string, shopId: string) {
    const [categories, items] = await Promise.all([
      MenuCategoryModel.find({ tenantId, shopId }).lean(),
      MenuItemModel.find({ tenantId, shopId }).lean()
    ]);

    return { categories, items };
  }
}
