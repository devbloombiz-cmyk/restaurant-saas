import type { RequestContext } from "@/types/api";
import { ReportsRepository } from "@/modules/reports/reports.repository";
import { cacheService } from "@/services/cache.service";

export class ReportsService {
  private readonly reportsRepository = new ReportsRepository();

  async dailyReport(context: RequestContext) {
    const cacheKey = `daily-report:${context.tenantId}:${context.shopId}`;
    const cached = cacheService.get<{
      totalOrders: number;
      totalSales: number;
      cashTotal: number;
      cardTotal: number;
      pendingTotal: number;
    }>(cacheKey);

    if (cached) {
      return cached;
    }

    const start = new Date();
    start.setHours(0, 0, 0, 0);

    const end = new Date(start);
    end.setDate(end.getDate() + 1);

    const rows = await this.reportsRepository.dailyAggregates(context.tenantId, context.shopId, start, end);

    const report = {
      totalOrders: 0,
      totalSales: 0,
      cashTotal: 0,
      cardTotal: 0,
      pendingTotal: 0
    };

    for (const row of rows) {
      const amount = Number(row.totalAmount ?? 0);
      const count = Number(row.totalOrders ?? 0);
      report.totalOrders += count;
      report.totalSales += amount;

      if (row._id === "cash") {
        report.cashTotal = amount;
      }
      if (row._id === "card") {
        report.cardTotal = amount;
      }
      if (row._id === "pending") {
        report.pendingTotal = amount;
      }
    }

    cacheService.set(cacheKey, report, 15_000);
    return report;
  }
}
