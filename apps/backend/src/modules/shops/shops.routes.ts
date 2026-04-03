import { Router } from "express";
import { requireAuth, authorize } from "@/middlewares/auth";
import { USER_ROLES } from "@shared/types/roles";
import { ShopsController } from "@/modules/shops/shops.controller";
import { asyncHandler } from "@/utils/asyncHandler";
import { validateRequest } from "@/middlewares/validateRequest";
import { createShopSchema, shopIdParamSchema, updateShopSchema } from "@/validators/shops.schema";

export const shopsRouter = Router();
const shopsController = new ShopsController();

shopsRouter.use(requireAuth, authorize([USER_ROLES.SUPER_ADMIN, USER_ROLES.SHOP_ADMIN]));

shopsRouter.post("/", validateRequest(createShopSchema), asyncHandler(shopsController.createShop));
shopsRouter.get("/", asyncHandler(shopsController.getShops));
shopsRouter.get("/:id", validateRequest(shopIdParamSchema), asyncHandler(shopsController.getShopById));
shopsRouter.patch("/:id", validateRequest(updateShopSchema), asyncHandler(shopsController.updateShop));
shopsRouter.delete("/:id", validateRequest(shopIdParamSchema), asyncHandler(shopsController.deleteShop));
