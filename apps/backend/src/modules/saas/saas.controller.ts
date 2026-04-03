import type { Request, Response } from "express";
import { SaasService } from "@/modules/saas/saas.service";
import { sendSuccess } from "@/utils/response";

export class SaasController {
  private readonly saasService = new SaasService();

  getTenants = async (_req: Request, res: Response): Promise<void> => {
    const data = await this.saasService.getTenants();
    sendSuccess(res, "Tenants fetched", data);
  };

  getShops = async (_req: Request, res: Response): Promise<void> => {
    const data = await this.saasService.getShops();
    sendSuccess(res, "Shops fetched", data);
  };

  updateTenantStatus = async (req: Request, res: Response): Promise<void> => {
    const data = await this.saasService.updateTenantStatus(String(req.params.id), Boolean(req.body.isActive));
    sendSuccess(res, "Tenant status updated", data);
  };

  updateShopStatus = async (req: Request, res: Response): Promise<void> => {
    const data = await this.saasService.updateShopStatus(String(req.params.id), Boolean(req.body.isActive));
    sendSuccess(res, "Shop status updated", data);
  };

  platformSummary = async (_req: Request, res: Response): Promise<void> => {
    const data = await this.saasService.platformSummary();
    sendSuccess(res, "Platform summary fetched", data);
  };
}
