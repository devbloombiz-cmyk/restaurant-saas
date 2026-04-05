import { Router } from "express";
import { requireAuth, authorize } from "@/middlewares/auth";
import { USER_ROLES } from "@shared/types/roles";
import { MenuController } from "@/modules/menu/menu.controller";
import { asyncHandler } from "@/utils/asyncHandler";
import { validateRequest } from "@/middlewares/validateRequest";
import {
  createMenuCategorySchema,
  createMenuItemSchema,
  menuParamIdSchema,
  updateInventoryItemSchema,
  updateMenuCategorySchema,
  updateMenuItemSchema
} from "@/validators/menu.schema";

export const menuRouter = Router();
const menuController = new MenuController();

menuRouter.use(requireAuth);

menuRouter.post("/categories", authorize([USER_ROLES.SUPER_ADMIN, USER_ROLES.SHOP_ADMIN]), validateRequest(createMenuCategorySchema), asyncHandler(menuController.createCategory));
menuRouter.get("/categories", authorize([USER_ROLES.SUPER_ADMIN, USER_ROLES.SHOP_ADMIN, USER_ROLES.CASHIER]), asyncHandler(menuController.getCategories));
menuRouter.patch("/categories/:id", authorize([USER_ROLES.SUPER_ADMIN, USER_ROLES.SHOP_ADMIN]), validateRequest(updateMenuCategorySchema), asyncHandler(menuController.updateCategory));
menuRouter.delete("/categories/:id", authorize([USER_ROLES.SUPER_ADMIN, USER_ROLES.SHOP_ADMIN]), validateRequest(menuParamIdSchema), asyncHandler(menuController.deleteCategory));

menuRouter.post("/items", authorize([USER_ROLES.SUPER_ADMIN, USER_ROLES.SHOP_ADMIN]), validateRequest(createMenuItemSchema), asyncHandler(menuController.createItem));
menuRouter.get("/items", authorize([USER_ROLES.SUPER_ADMIN, USER_ROLES.SHOP_ADMIN, USER_ROLES.CASHIER]), asyncHandler(menuController.getItems));
menuRouter.get("/inventory", authorize([USER_ROLES.SUPER_ADMIN, USER_ROLES.SHOP_ADMIN]), asyncHandler(menuController.getInventory));
menuRouter.get("/items/:id", authorize([USER_ROLES.SUPER_ADMIN, USER_ROLES.SHOP_ADMIN, USER_ROLES.CASHIER]), validateRequest(menuParamIdSchema), asyncHandler(menuController.getItemById));
menuRouter.patch("/items/:id", authorize([USER_ROLES.SUPER_ADMIN, USER_ROLES.SHOP_ADMIN]), validateRequest(updateMenuItemSchema), asyncHandler(menuController.updateItem));
menuRouter.patch("/inventory/:id", authorize([USER_ROLES.SUPER_ADMIN, USER_ROLES.SHOP_ADMIN]), validateRequest(updateInventoryItemSchema), asyncHandler(menuController.updateInventoryItem));
menuRouter.delete("/items/:id", authorize([USER_ROLES.SUPER_ADMIN, USER_ROLES.SHOP_ADMIN]), validateRequest(menuParamIdSchema), asyncHandler(menuController.deleteItem));
