import type { Request, Response } from "express";
import { MenuService } from "@/modules/menu/menu.service";
import { getTenantContext } from "@/utils/tenant";
import { sendSuccess } from "@/utils/response";

export class MenuController {
  private readonly menuService = new MenuService();

  createCategory = async (req: Request, res: Response): Promise<void> => {
    const data = await this.menuService.createCategory(getTenantContext(req.context), req.body);
    sendSuccess(res, "Category created", data, 201);
  };

  getCategories = async (req: Request, res: Response): Promise<void> => {
    const data = await this.menuService.getCategories(getTenantContext(req.context));
    sendSuccess(res, "Categories fetched", data);
  };

  updateCategory = async (req: Request, res: Response): Promise<void> => {
    const data = await this.menuService.updateCategory(getTenantContext(req.context), String(req.params.id), req.body);
    sendSuccess(res, "Category updated", data);
  };

  deleteCategory = async (req: Request, res: Response): Promise<void> => {
    const data = await this.menuService.deleteCategory(getTenantContext(req.context), String(req.params.id));
    sendSuccess(res, "Category deleted", data);
  };

  createItem = async (req: Request, res: Response): Promise<void> => {
    const data = await this.menuService.createItem(getTenantContext(req.context), req.body);
    sendSuccess(res, "Menu item created", data, 201);
  };

  getItems = async (req: Request, res: Response): Promise<void> => {
    const data = await this.menuService.getItems(getTenantContext(req.context));
    sendSuccess(res, "Menu items fetched", data);
  };

  getItemById = async (req: Request, res: Response): Promise<void> => {
    const data = await this.menuService.getItemById(getTenantContext(req.context), String(req.params.id));
    sendSuccess(res, "Menu item fetched", data);
  };

  updateItem = async (req: Request, res: Response): Promise<void> => {
    const data = await this.menuService.updateItem(getTenantContext(req.context), String(req.params.id), req.body);
    sendSuccess(res, "Menu item updated", data);
  };

  deleteItem = async (req: Request, res: Response): Promise<void> => {
    const data = await this.menuService.deleteItem(getTenantContext(req.context), String(req.params.id));
    sendSuccess(res, "Menu item deleted", data);
  };
}
