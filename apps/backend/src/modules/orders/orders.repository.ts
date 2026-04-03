import { OrderModel } from "@/models/order.model";
import { normalizePagination } from "@/utils/pagination";

export class OrdersRepository {
  async countOrders(tenantId: string, shopId: string) {
    return OrderModel.countDocuments({ tenantId, shopId });
  }

  async create(payload: {
    tenantId: string;
    shopId: string;
    orderNumber: string;
    orderType: "website" | "takeaway" | "eat_in";
    items: Array<Record<string, unknown>>;
    paymentMode: "cash" | "card" | "pending";
    total: number;
    createdBy: string;
  }) {
    return OrderModel.create(payload);
  }

  async findAll(tenantId: string, shopId: string, input?: { page?: number; limit?: number }) {
    const { page, limit, skip } = normalizePagination(input ?? {});
    const query = { tenantId, shopId };

    const [items, total] = await Promise.all([
      OrderModel.find(query)
        .select({ orderNumber: 1, orderType: 1, paymentMode: 1, total: 1, status: 1, createdAt: 1, items: 1 })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      OrderModel.countDocuments(query)
    ]);

    return {
      items,
      total,
      page,
      limit
    };
  }

  async findById(id: string, tenantId: string, shopId: string) {
    return OrderModel.findOne({ _id: id, tenantId, shopId })
      .select({ orderNumber: 1, orderType: 1, paymentMode: 1, total: 1, status: 1, createdAt: 1, items: 1, createdBy: 1 })
      .lean();
  }

  async updateById(id: string, tenantId: string, shopId: string, payload: Record<string, unknown>) {
    return OrderModel.findOneAndUpdate({ _id: id, tenantId, shopId }, payload, { new: true });
  }

  async aggregateDailySummary(tenantId: string, shopId: string, start: Date, end: Date) {
    const result = await OrderModel.aggregate([
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

    return result;
  }
}
