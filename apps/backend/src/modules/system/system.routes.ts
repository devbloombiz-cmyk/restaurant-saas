import { Router } from "express";
import { asyncHandler } from "@/utils/asyncHandler";
import { SystemController } from "@/modules/system/system.controller";
import { requireAuth, authorize } from "@/middlewares/auth";
import { USER_ROLES } from "@shared/types/roles";
import { validateRequest } from "@/middlewares/validateRequest";
import { backupFileParamSchema, restoreSchema } from "@/validators/system.schema";

export const systemRouter = Router();
const systemController = new SystemController();

systemRouter.get("/health", asyncHandler(systemController.health));
systemRouter.get("/metrics", asyncHandler(systemController.metrics));
systemRouter.get("/diagnostics", asyncHandler(systemController.diagnostics));

systemRouter.post(
  "/backup",
  requireAuth,
  authorize([USER_ROLES.SUPER_ADMIN, USER_ROLES.SHOP_ADMIN]),
  asyncHandler(systemController.backup)
);
systemRouter.post(
  "/restore",
  requireAuth,
  authorize([USER_ROLES.SUPER_ADMIN, USER_ROLES.SHOP_ADMIN]),
  validateRequest(restoreSchema),
  asyncHandler(systemController.restore)
);
systemRouter.get(
  "/backups",
  requireAuth,
  authorize([USER_ROLES.SUPER_ADMIN, USER_ROLES.SHOP_ADMIN]),
  asyncHandler(systemController.listBackups)
);
systemRouter.get(
  "/backups/:fileName",
  requireAuth,
  authorize([USER_ROLES.SUPER_ADMIN, USER_ROLES.SHOP_ADMIN]),
  validateRequest(backupFileParamSchema),
  asyncHandler(systemController.downloadBackup)
);
