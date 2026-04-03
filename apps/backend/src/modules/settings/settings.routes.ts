import { Router } from "express";
import { requireAuth, authorize } from "@/middlewares/auth";
import { USER_ROLES } from "@shared/types/roles";
import { SettingsController } from "@/modules/settings/settings.controller";
import { asyncHandler } from "@/utils/asyncHandler";
import { validateRequest } from "@/middlewares/validateRequest";
import { updateShopSettingsSchema } from "@/validators/settings.schema";

export const settingsRouter = Router();
const settingsController = new SettingsController();

settingsRouter.use(requireAuth, authorize([USER_ROLES.SUPER_ADMIN, USER_ROLES.SHOP_ADMIN]));
settingsRouter.get("/shop", asyncHandler(settingsController.getShopSettings));
settingsRouter.patch("/shop", validateRequest(updateShopSettingsSchema), asyncHandler(settingsController.updateShopSettings));
