import type { Request, Response } from "express";
import { ShopsService } from "@/modules/shops/shops.service";
import { getTenantContext } from "@/utils/tenant";
import { sendSuccess } from "@/utils/response";

export class ShopsController {
  private readonly shopsService = new ShopsService();

  createShop = async (req: Request, res: Response): Promise<void> => {
    const data = await this.shopsService.createShop(getTenantContext(req.context), req.body);
    sendSuccess(res, "Shop created", data, 201);
  };

  getShops = async (req: Request, res: Response): Promise<void> => {
    const data = await this.shopsService.getShops(getTenantContext(req.context));
    sendSuccess(res, "Shops fetched", data);
  };

  getShopById = async (req: Request, res: Response): Promise<void> => {
    const data = await this.shopsService.getShopById(getTenantContext(req.context), String(req.params.id));
    sendSuccess(res, "Shop fetched", data);
  };

  updateShop = async (req: Request, res: Response): Promise<void> => {
    const data = await this.shopsService.updateShop(getTenantContext(req.context), String(req.params.id), req.body);
    sendSuccess(res, "Shop updated", data);
  };

  deleteShop = async (req: Request, res: Response): Promise<void> => {
    const data = await this.shopsService.deleteShop(getTenantContext(req.context), String(req.params.id));
    sendSuccess(res, "Shop deleted", data);
  };
}
