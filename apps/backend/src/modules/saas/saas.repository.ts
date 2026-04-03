import { TenantModel } from "@/models/tenant.model";
import { ShopModel } from "@/models/shop.model";
import { OrderModel } from "@/models/order.model";
import { UserModel } from "@/models/user.model";

export class SaasRepository {
  async getTenants() {
    return TenantModel.find().sort({ createdAt: -1 });
  }

  async getShops() {
    return ShopModel.find().sort({ createdAt: -1 });
  }

  async updateTenantStatus(id: string, isActive: boolean) {
    return TenantModel.findByIdAndUpdate(id, { isActive }, { new: true });
  }

  async updateShopStatus(id: string, isActive: boolean) {
    return ShopModel.findByIdAndUpdate(id, { isActive }, { new: true });
  }

  async platformSummary() {
    const [totalTenants, totalShops, totalOrders, activeCashiers, revenue] = await Promise.all([
      TenantModel.countDocuments(),
      ShopModel.countDocuments(),
      OrderModel.countDocuments(),
      UserModel.countDocuments({ role: "cashier", isActive: true }),
      OrderModel.aggregate([{ $group: { _id: null, total: { $sum: "$total" } } }])
    ]);

    return {
      totalTenants,
      totalShops,
      totalOrders,
      activeCashiers,
      revenueSnapshot: Number(revenue[0]?.total ?? 0)
    };
  }
}
