import type { Request, Response } from "express";
import { SettingsService } from "@/modules/settings/settings.service";
import { getTenantContext } from "@/utils/tenant";
import { sendSuccess } from "@/utils/response";

export class SettingsController {
  private readonly settingsService = new SettingsService();

  getShopSettings = async (req: Request, res: Response): Promise<void> => {
    const data = await this.settingsService.getShopSettings(getTenantContext(req.context));
    sendSuccess(res, "Shop settings fetched", data);
  };

  updateShopSettings = async (req: Request, res: Response): Promise<void> => {
    const data = await this.settingsService.updateShopSettings(getTenantContext(req.context), req.body);
    sendSuccess(res, "Shop settings updated", data);
  };
}
