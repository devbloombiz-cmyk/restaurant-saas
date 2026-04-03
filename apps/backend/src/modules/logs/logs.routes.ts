import { Router } from "express";
import { requireAuth, authorize } from "@/middlewares/auth";
import { USER_ROLES } from "@shared/types/roles";
import { LogsController } from "@/modules/logs/logs.controller";
import { asyncHandler } from "@/utils/asyncHandler";
import { validateRequest } from "@/middlewares/validateRequest";
import { logParamSchema } from "@/validators/logs.schema";

export const logsRouter = Router();
const logsController = new LogsController();

logsRouter.use(requireAuth, authorize([USER_ROLES.SUPER_ADMIN, USER_ROLES.SHOP_ADMIN]));
logsRouter.get("/", asyncHandler(logsController.getLogs));
logsRouter.get("/:id", validateRequest(logParamSchema), asyncHandler(logsController.getLogById));
