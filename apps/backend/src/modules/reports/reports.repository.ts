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

  async paymentAggregates(tenantId: string, shopId: string, start: Date, end: Date) {
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

  async summaryAggregates(tenantId: string, shopId: string, start: Date, end: Date) {
    const [row] = await OrderModel.aggregate([
      {
        $match: {
          tenantId,
          shopId,
          createdAt: { $gte: start, $lt: end }
        }
      },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalSales: { $sum: "$total" },
          avgOrderValue: { $avg: "$total" }
        }
      }
    ]);

    return row ?? { totalOrders: 0, totalSales: 0, avgOrderValue: 0 };
  }

  async trendByDay(tenantId: string, shopId: string, start: Date, end: Date) {
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
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
          },
          totalSales: { $sum: "$total" },
          totalOrders: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);
  }

  async ordersTable(
    tenantId: string,
    shopId: string,
    start: Date,
    end: Date,
    options: { page: number; limit: number; sortBy: string; sortOrder: "asc" | "desc" }
  ) {
    const page = Math.max(1, options.page);
    const limit = Math.min(100, Math.max(1, options.limit));
    const skip = (page - 1) * limit;
    const sortDirection = options.sortOrder === "asc" ? 1 : -1;
    const sortField = ["orderNumber", "paymentMode", "total", "createdAt", "status"].includes(options.sortBy) ? options.sortBy : "createdAt";

    const query = {
      tenantId,
      shopId,
      createdAt: { $gte: start, $lt: end }
    };

    const [items, total] = await Promise.all([
      OrderModel.find(query)
        .select({ orderNumber: 1, paymentMode: 1, total: 1, status: 1, createdAt: 1, orderType: 1 })
        .sort({ [sortField]: sortDirection })
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
}
