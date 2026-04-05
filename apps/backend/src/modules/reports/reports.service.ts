import type { RequestContext } from "@/types/api";
import { ReportsRepository } from "@/modules/reports/reports.repository";
import { cacheService } from "@/services/cache.service";

export class ReportsService {
  private readonly reportsRepository = new ReportsRepository();

  private parseRange(input?: { from?: string; to?: string }): { start: Date; end: Date } {
    const today = new Date();
    const fallbackStart = new Date(today);
    fallbackStart.setHours(0, 0, 0, 0);
    const fallbackEnd = new Date(fallbackStart);
    fallbackEnd.setDate(fallbackEnd.getDate() + 1);

    if (!input?.from || !input?.to) {
      return { start: fallbackStart, end: fallbackEnd };
    }

    const start = new Date(input.from);
    const end = new Date(input.to);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return { start: fallbackStart, end: fallbackEnd };
    }

    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    return { start, end: new Date(end.getTime() + 1) };
  }

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

  async overviewReport(
    context: RequestContext,
    input: { from?: string; to?: string; page: number; limit: number; sortBy: string; sortOrder: string }
  ) {
    const { start, end } = this.parseRange({ from: input.from, to: input.to });
    const sortOrder = input.sortOrder === "asc" ? "asc" : "desc";

    const [summary, paymentRows, trendRows, table] = await Promise.all([
      this.reportsRepository.summaryAggregates(context.tenantId, context.shopId, start, end),
      this.reportsRepository.paymentAggregates(context.tenantId, context.shopId, start, end),
      this.reportsRepository.trendByDay(context.tenantId, context.shopId, start, end),
      this.reportsRepository.ordersTable(context.tenantId, context.shopId, start, end, {
        page: input.page,
        limit: input.limit,
        sortBy: input.sortBy,
        sortOrder
      })
    ]);

    return {
      range: {
        from: start.toISOString(),
        to: new Date(end.getTime() - 1).toISOString()
      },
      summary: {
        totalOrders: Number(summary.totalOrders ?? 0),
        totalSales: Number(summary.totalSales ?? 0),
        avgOrderValue: Number(summary.avgOrderValue ?? 0)
      },
      paymentBreakdown: paymentRows.map((row) => ({
        paymentMode: String(row._id),
        totalOrders: Number(row.totalOrders ?? 0),
        totalAmount: Number(row.totalAmount ?? 0)
      })),
      trend: trendRows.map((row) => ({
        date: String(row._id),
        totalOrders: Number(row.totalOrders ?? 0),
        totalSales: Number(row.totalSales ?? 0)
      })),
      orders: table
    };
  }
}
