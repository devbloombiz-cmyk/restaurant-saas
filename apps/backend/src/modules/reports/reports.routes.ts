import { Router } from "express";
import { requireAuth, authorize } from "@/middlewares/auth";
import { USER_ROLES } from "@shared/types/roles";
import { ReportsController } from "@/modules/reports/reports.controller";
import { asyncHandler } from "@/utils/asyncHandler";

export const reportsRouter = Router();
const reportsController = new ReportsController();

reportsRouter.use(requireAuth, authorize([USER_ROLES.SUPER_ADMIN, USER_ROLES.SHOP_ADMIN]));
reportsRouter.get("/daily", asyncHandler(reportsController.daily));
