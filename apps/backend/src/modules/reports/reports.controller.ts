import type { Request, Response } from "express";
import { ReportsService } from "@/modules/reports/reports.service";
import { getTenantContext } from "@/utils/tenant";
import { sendSuccess } from "@/utils/response";

export class ReportsController {
  private readonly reportsService = new ReportsService();

  daily = async (req: Request, res: Response): Promise<void> => {
    const data = await this.reportsService.dailyReport(getTenantContext(req.context));
    sendSuccess(res, "Daily report fetched", data);
  };

  overview = async (req: Request, res: Response): Promise<void> => {
    const data = await this.reportsService.overviewReport(getTenantContext(req.context), {
      from: typeof req.query.from === "string" ? req.query.from : undefined,
      to: typeof req.query.to === "string" ? req.query.to : undefined,
      page: Number(req.query.page ?? 1),
      limit: Number(req.query.limit ?? 20),
      sortBy: typeof req.query.sortBy === "string" ? req.query.sortBy : "createdAt",
      sortOrder: typeof req.query.sortOrder === "string" ? req.query.sortOrder : "desc"
    });

    sendSuccess(res, "Report overview fetched", data);
  };
}
