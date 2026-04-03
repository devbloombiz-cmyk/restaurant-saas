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
  updateMenuCategorySchema,
  updateMenuItemSchema
} from "@/validators/menu.schema";

export const menuRouter = Router();
const menuController = new MenuController();

menuRouter.use(requireAuth, authorize([USER_ROLES.SUPER_ADMIN, USER_ROLES.SHOP_ADMIN]));

menuRouter.post("/categories", validateRequest(createMenuCategorySchema), asyncHandler(menuController.createCategory));
menuRouter.get("/categories", asyncHandler(menuController.getCategories));
menuRouter.patch("/categories/:id", validateRequest(updateMenuCategorySchema), asyncHandler(menuController.updateCategory));
menuRouter.delete("/categories/:id", validateRequest(menuParamIdSchema), asyncHandler(menuController.deleteCategory));

menuRouter.post("/items", validateRequest(createMenuItemSchema), asyncHandler(menuController.createItem));
menuRouter.get("/items", asyncHandler(menuController.getItems));
menuRouter.get("/items/:id", validateRequest(menuParamIdSchema), asyncHandler(menuController.getItemById));
menuRouter.patch("/items/:id", validateRequest(updateMenuItemSchema), asyncHandler(menuController.updateItem));
menuRouter.delete("/items/:id", validateRequest(menuParamIdSchema), asyncHandler(menuController.deleteItem));
