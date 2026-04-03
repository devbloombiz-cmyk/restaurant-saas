import type { Request, Response } from "express";
import { SystemService } from "@/modules/system/system.service";
import { sendSuccess } from "@/utils/response";
import { getTenantContext } from "@/utils/tenant";

export class SystemController {
  private readonly systemService = new SystemService();

  health = async (_req: Request, res: Response): Promise<void> => {
    const data = await this.systemService.health();
    sendSuccess(res, "System health fetched", data);
  };

  metrics = async (_req: Request, res: Response): Promise<void> => {
    const data = await this.systemService.metrics();
    sendSuccess(res, "System metrics fetched", data);
  };

  diagnostics = async (_req: Request, res: Response): Promise<void> => {
    const data = await this.systemService.diagnostics();
    sendSuccess(res, "System diagnostics fetched", data);
  };

  backup = async (req: Request, res: Response): Promise<void> => {
    const data = await this.systemService.backup(getTenantContext(req.context));
    sendSuccess(res, "Backup created", data, 201);
  };

  restore = async (req: Request, res: Response): Promise<void> => {
    const data = await this.systemService.restore(getTenantContext(req.context), String(req.body.fileName));
    sendSuccess(res, "Restore completed", data);
  };

  listBackups = async (_req: Request, res: Response): Promise<void> => {
    const data = await this.systemService.listBackups();
    sendSuccess(res, "Backups fetched", data);
  };

  downloadBackup = async (req: Request, res: Response): Promise<void> => {
    const fileName = String(req.params.fileName);
    const path = await this.systemService.getBackupFilePath(fileName);
    res.download(path, fileName);
  };
}
