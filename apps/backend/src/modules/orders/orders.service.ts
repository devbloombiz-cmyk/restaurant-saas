import { ApiError } from "@/utils/ApiError";
import type { RequestContext } from "@/types/api";
import { OrdersRepository } from "@/modules/orders/orders.repository";
import { AuditLogService } from "@/services/auditLog.service";

function calculateOrderTotal(items: Array<Record<string, unknown>>): number {
  return items.reduce((total, item) => {
    const qty = Number(item.qty ?? 0);
    const unitPrice = Number(item.unitPrice ?? 0);
    const modifiers = Array.isArray(item.modifiers) ? item.modifiers : [];
    const modifierTotal = modifiers.reduce((sum: number, modifier: Record<string, unknown>) => {
      return sum + Number(modifier.priceAdjustment ?? 0);
    }, 0);

    return total + qty * (unitPrice + modifierTotal);
  }, 0);
}

export class OrdersService {
  private readonly ordersRepository = new OrdersRepository();
  private readonly auditLogService = new AuditLogService();

  async createOrder(context: RequestContext, body: Record<string, unknown>) {
    const currentCount = await this.ordersRepository.countOrders(context.tenantId, context.shopId);
    const orderNumber = `ORD-${1001 + currentCount}`;
    const items = body.items as Array<Record<string, unknown>>;
    const total = calculateOrderTotal(items);

    const order = await this.ordersRepository.create({
      tenantId: context.tenantId,
      shopId: context.shopId,
      orderNumber,
      orderType: body.orderType as "website" | "takeaway" | "eat_in",
      items,
      paymentMode: body.paymentMode as "cash" | "card" | "pending",
      total,
      createdBy: context.userId
    });

    await this.auditLogService.log({
      tenantId: context.tenantId,
      shopId: context.shopId,
      userId: context.userId,
      action: "order_created",
      module: "orders",
      metadata: { orderId: order.id, orderNumber: order.orderNumber, total: order.total }
    });

    return order;
  }

  async getOrders(context: RequestContext, page?: number, limit?: number) {
    return this.ordersRepository.findAll(context.tenantId, context.shopId, { page, limit });
  }

  async getOrderById(context: RequestContext, id: string) {
    const order = await this.ordersRepository.findById(id, context.tenantId, context.shopId);

    if (!order) {
      throw new ApiError(404, "Order not found");
    }

    return order;
  }

  async updateOrder(context: RequestContext, id: string, body: Record<string, unknown>) {
    const order = await this.ordersRepository.updateById(id, context.tenantId, context.shopId, body);

    if (!order) {
      throw new ApiError(404, "Order not found");
    }

    await this.auditLogService.log({
      tenantId: context.tenantId,
      shopId: context.shopId,
      userId: context.userId,
      action: "order_updated",
      module: "orders",
      metadata: { orderId: order.id, updates: body }
    });

    return order;
  }

  async getDailySummary(context: RequestContext) {
    const start = new Date();
    start.setHours(0, 0, 0, 0);

    const end = new Date(start);
    end.setDate(end.getDate() + 1);

    const summary = await this.ordersRepository.aggregateDailySummary(context.tenantId, context.shopId, start, end);

    const result = {
      totalOrders: 0,
      totalSales: 0,
      cashTotal: 0,
      cardTotal: 0,
      pendingTotal: 0
    };

    for (const row of summary) {
      const totalAmount = Number(row.totalAmount ?? 0);
      const orders = Number(row.totalOrders ?? 0);

      result.totalOrders += orders;
      result.totalSales += totalAmount;

      if (row._id === "cash") {
        result.cashTotal = totalAmount;
      }
      if (row._id === "card") {
        result.cardTotal = totalAmount;
      }
      if (row._id === "pending") {
        result.pendingTotal = totalAmount;
      }
    }

    return result;
  }
}
