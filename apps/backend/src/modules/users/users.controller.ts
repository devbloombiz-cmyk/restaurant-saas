import type { Request, Response } from "express";
import { UsersService } from "@/modules/users/users.service";
import { getTenantContext } from "@/utils/tenant";
import { sendSuccess } from "@/utils/response";

export class UsersController {
  private readonly usersService = new UsersService();

  createCashier = async (req: Request, res: Response): Promise<void> => {
    const data = await this.usersService.createCashier(getTenantContext(req.context), req.body);
    sendSuccess(res, "Cashier created", data, 201);
  };

  getCashiers = async (req: Request, res: Response): Promise<void> => {
    const data = await this.usersService.getCashiers(getTenantContext(req.context));
    sendSuccess(res, "Cashiers fetched", data);
  };

  updateCashier = async (req: Request, res: Response): Promise<void> => {
    const data = await this.usersService.updateCashier(getTenantContext(req.context), String(req.params.id), req.body);
    sendSuccess(res, "Cashier updated", data);
  };

  deleteCashier = async (req: Request, res: Response): Promise<void> => {
    const data = await this.usersService.deleteCashier(getTenantContext(req.context), String(req.params.id));
    sendSuccess(res, "Cashier deleted", data);
  };
}
