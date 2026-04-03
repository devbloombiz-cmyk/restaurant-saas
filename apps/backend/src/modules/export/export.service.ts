import type { RequestContext } from "@/types/api";
import { ExportRepository } from "@/modules/export/export.repository";
import { toCsv } from "@/utils/csv";

export class ExportService {
  private readonly exportRepository = new ExportRepository();

  async exportOrders(context: RequestContext): Promise<string> {
    const rows = await this.exportRepository.orders(context.tenantId, context.shopId);
    return toCsv(rows as Array<Record<string, unknown>>);
  }

  async exportReports(context: RequestContext): Promise<string> {
    const rows = await this.exportRepository.reports(context.tenantId, context.shopId);
    return toCsv(rows as Array<Record<string, unknown>>);
  }

  async exportMenu(context: RequestContext): Promise<string> {
    const data = await this.exportRepository.menu(context.tenantId, context.shopId);
    const rows = [
      ...data.categories.map((category: Record<string, unknown>) => ({ type: "category", ...category })),
      ...data.items.map((item: Record<string, unknown>) => ({ type: "item", ...item }))
    ];

    return toCsv(rows);
  }
}
