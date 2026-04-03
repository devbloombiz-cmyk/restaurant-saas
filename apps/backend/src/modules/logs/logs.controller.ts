import type { Request, Response } from "express";
import { LogsService } from "@/modules/logs/logs.service";
import { getTenantContext } from "@/utils/tenant";
import { sendSuccess } from "@/utils/response";

export class LogsController {
  private readonly logsService = new LogsService();

  getLogs = async (req: Request, res: Response): Promise<void> => {
    const data = await this.logsService.getLogs(getTenantContext(req.context));
    sendSuccess(res, "Logs fetched", data);
  };

  getLogById = async (req: Request, res: Response): Promise<void> => {
    const data = await this.logsService.getLogById(getTenantContext(req.context), String(req.params.id));
    sendSuccess(res, "Log fetched", data);
  };
}
