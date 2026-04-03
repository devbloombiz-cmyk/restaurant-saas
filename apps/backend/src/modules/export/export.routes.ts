import { Router } from "express";
import { requireAuth, authorize } from "@/middlewares/auth";
import { USER_ROLES } from "@shared/types/roles";
import { ExportController } from "@/modules/export/export.controller";
import { asyncHandler } from "@/utils/asyncHandler";

export const exportRouter = Router();
const exportController = new ExportController();

exportRouter.use(requireAuth, authorize([USER_ROLES.SUPER_ADMIN, USER_ROLES.SHOP_ADMIN]));
exportRouter.get("/orders", asyncHandler(exportController.exportOrders));
exportRouter.get("/reports", asyncHandler(exportController.exportReports));
exportRouter.get("/menu", asyncHandler(exportController.exportMenu));
