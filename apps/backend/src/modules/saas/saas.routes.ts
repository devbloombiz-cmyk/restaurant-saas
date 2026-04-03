import { Router } from "express";
import { requireAuth, authorize } from "@/middlewares/auth";
import { USER_ROLES } from "@shared/types/roles";
import { SaasController } from "@/modules/saas/saas.controller";
import { asyncHandler } from "@/utils/asyncHandler";
import { validateRequest } from "@/middlewares/validateRequest";
import { statusParamSchema } from "@/validators/saas.schema";

export const saasRouter = Router();
const saasController = new SaasController();

saasRouter.use(requireAuth, authorize([USER_ROLES.SUPER_ADMIN]));
saasRouter.get("/tenants", asyncHandler(saasController.getTenants));
saasRouter.get("/shops", asyncHandler(saasController.getShops));
saasRouter.patch("/tenant-status/:id", validateRequest(statusParamSchema), asyncHandler(saasController.updateTenantStatus));
saasRouter.patch("/shop-status/:id", validateRequest(statusParamSchema), asyncHandler(saasController.updateShopStatus));
saasRouter.get("/platform-summary", asyncHandler(saasController.platformSummary));
