import type { Request, Response } from "express";
import { ExportService } from "@/modules/export/export.service";
import { getTenantContext } from "@/utils/tenant";

export class ExportController {
  private readonly exportService = new ExportService();

  exportOrders = async (req: Request, res: Response): Promise<void> => {
    const csv = await this.exportService.exportOrders(getTenantContext(req.context));
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=orders.csv");
    res.status(200).send(csv);
  };

  exportReports = async (req: Request, res: Response): Promise<void> => {
    const csv = await this.exportService.exportReports(getTenantContext(req.context));
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=reports.csv");
    res.status(200).send(csv);
  };

  exportMenu = async (req: Request, res: Response): Promise<void> => {
    const csv = await this.exportService.exportMenu(getTenantContext(req.context));
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=menu.csv");
    res.status(200).send(csv);
  };
}
