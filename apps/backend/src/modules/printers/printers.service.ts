import { ApiError } from "@/utils/ApiError";
import type { RequestContext } from "@/types/api";
import { PrintersRepository } from "@/modules/printers/printers.repository";
import { buildKotHtml } from "@/services/kotTemplate.service";
import { AuditLogService } from "@/services/auditLog.service";

export class PrintersService {
  private readonly printersRepository = new PrintersRepository();
  private readonly auditLogService = new AuditLogService();

  async printKot(context: RequestContext, orderId: string, copies?: number) {
    const order = await this.printersRepository.findOrderById(orderId, context.tenantId, context.shopId);

    if (!order) {
      await this.auditLogService.log({
        tenantId: context.tenantId,
        shopId: context.shopId,
        userId: context.userId,
        action: "print_failure",
        module: "printers",
        metadata: { orderId }
      });
      throw new ApiError(404, "Order not found");
    }

    const settings = await this.printersRepository.getSettings(context.tenantId, context.shopId);
    const orderCreatedAt = (order as { createdAt?: Date | string }).createdAt;

    const html = buildKotHtml({
      orderNumber: order.orderNumber,
      orderType: order.orderType,
      paymentMode: order.paymentMode,
      createdAt: orderCreatedAt ? new Date(orderCreatedAt).toLocaleString() : new Date().toLocaleString(),
      items: (order.items as Array<Record<string, unknown>>).map((item) => ({
        name: String(item.name ?? "Item"),
        qty: Number(item.qty ?? 1),
        modifiers: Array.isArray(item.modifiers)
          ? (item.modifiers as Array<Record<string, unknown>>).map((modifier) => ({ name: String(modifier.name ?? "") }))
          : [],
        notes: typeof item.notes === "string" ? item.notes : undefined
      }))
    });

    await this.auditLogService.log({
      tenantId: context.tenantId,
      shopId: context.shopId,
      userId: context.userId,
      action: "print_kot",
      module: "printers",
      metadata: { orderId, copies: copies ?? settings?.copies ?? 1 }
    });

    return {
      orderId: order.id,
      orderNumber: order.orderNumber,
      copies: copies ?? settings?.copies ?? 1,
      paperWidth: settings?.paperWidth ?? 80,
      html
    };
  }

  async reprintLast(context: RequestContext) {
    const lastOrder = await this.printersRepository.findLastOrder(context.tenantId, context.shopId);

    if (!lastOrder) {
      throw new ApiError(404, "No orders available for reprint");
    }

    return this.printKot(context, lastOrder.id);
  }

  async getSettings(context: RequestContext) {
    const settings = await this.printersRepository.getSettings(context.tenantId, context.shopId);

    if (!settings) {
      return {
        printerName: "Main Thermal Printer",
        printerType: "thermal",
        connectionType: "lan",
        ipAddress: "",
        port: 9100,
        paperWidth: 80,
        autoPrint: true,
        copies: 1,
        isActive: true
      };
    }

    return settings;
  }

  async updateSettings(context: RequestContext, payload: Record<string, unknown>) {
    const settings = await this.printersRepository.upsertSettings(context.tenantId, context.shopId, payload);

    await this.auditLogService.log({
      tenantId: context.tenantId,
      shopId: context.shopId,
      userId: context.userId,
      action: "printer_settings_updated",
      module: "printers",
      metadata: payload
    });

    return settings;
  }
}
