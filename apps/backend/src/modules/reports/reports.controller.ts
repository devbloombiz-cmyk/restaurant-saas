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
}
