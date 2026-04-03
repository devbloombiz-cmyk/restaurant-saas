import { OrderModel } from "@/models/order.model";

export class ReportsRepository {
  async dailyAggregates(tenantId: string, shopId: string, start: Date, end: Date) {
    return OrderModel.aggregate([
      {
        $match: {
          tenantId,
          shopId,
          createdAt: { $gte: start, $lt: end }
        }
      },
      {
        $group: {
          _id: "$paymentMode",
          totalAmount: { $sum: "$total" },
          totalOrders: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);
  }
}
