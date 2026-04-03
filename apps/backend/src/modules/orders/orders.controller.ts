import type { Request, Response } from "express";
import { OrdersService } from "@/modules/orders/orders.service";
import { getTenantContext } from "@/utils/tenant";
import { sendSuccess } from "@/utils/response";

export class OrdersController {
  private readonly ordersService = new OrdersService();

  createOrder = async (req: Request, res: Response): Promise<void> => {
    const data = await this.ordersService.createOrder(getTenantContext(req.context), req.body);
    sendSuccess(res, "Order created", data, 201);
  };

  getOrders = async (req: Request, res: Response): Promise<void> => {
    const page = Number(req.query.page ?? 1);
    const limit = Number(req.query.limit ?? 50);
    const data = await this.ordersService.getOrders(getTenantContext(req.context), page, limit);
    sendSuccess(res, "Orders fetched", data);
  };

  getOrderById = async (req: Request, res: Response): Promise<void> => {
    const data = await this.ordersService.getOrderById(getTenantContext(req.context), String(req.params.id));
    sendSuccess(res, "Order fetched", data);
  };

  updateOrder = async (req: Request, res: Response): Promise<void> => {
    const data = await this.ordersService.updateOrder(getTenantContext(req.context), String(req.params.id), req.body);
    sendSuccess(res, "Order updated", data);
  };

  dailySummary = async (req: Request, res: Response): Promise<void> => {
    const data = await this.ordersService.getDailySummary(getTenantContext(req.context));
    sendSuccess(res, "Daily summary fetched", data);
  };
}
