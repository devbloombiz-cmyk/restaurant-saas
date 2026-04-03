import type { Request, Response } from "express";
import { PrintersService } from "@/modules/printers/printers.service";
import { getTenantContext } from "@/utils/tenant";
import { sendSuccess } from "@/utils/response";

export class PrintersController {
  private readonly printersService = new PrintersService();

  printKot = async (req: Request, res: Response): Promise<void> => {
    const data = await this.printersService.printKot(getTenantContext(req.context), String(req.params.orderId), req.body?.copies);
    sendSuccess(res, "KOT payload generated", data);
  };

  reprintLast = async (req: Request, res: Response): Promise<void> => {
    const data = await this.printersService.reprintLast(getTenantContext(req.context));
    sendSuccess(res, "Last order reprint payload generated", data);
  };

  getSettings = async (req: Request, res: Response): Promise<void> => {
    const data = await this.printersService.getSettings(getTenantContext(req.context));
    sendSuccess(res, "Printer settings fetched", data);
  };

  updateSettings = async (req: Request, res: Response): Promise<void> => {
    const data = await this.printersService.updateSettings(getTenantContext(req.context), req.body);
    sendSuccess(res, "Printer settings updated", data);
  };
}
