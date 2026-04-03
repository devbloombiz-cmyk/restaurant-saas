import { Router } from "express";
import { requireAuth, authorize } from "@/middlewares/auth";
import { USER_ROLES } from "@shared/types/roles";
import { PrintersController } from "@/modules/printers/printers.controller";
import { asyncHandler } from "@/utils/asyncHandler";
import { validateRequest } from "@/middlewares/validateRequest";
import { printOrderParamSchema, updatePrinterSettingsSchema } from "@/validators/printers.schema";

export const printersRouter = Router();
const printersController = new PrintersController();

printersRouter.use(requireAuth, authorize([USER_ROLES.SUPER_ADMIN, USER_ROLES.SHOP_ADMIN, USER_ROLES.CASHIER]));

printersRouter.post("/kot/:orderId", validateRequest(printOrderParamSchema), asyncHandler(printersController.printKot));
printersRouter.post("/reprint-last", asyncHandler(printersController.reprintLast));
printersRouter.get("/settings", asyncHandler(printersController.getSettings));
printersRouter.patch("/settings", validateRequest(updatePrinterSettingsSchema), asyncHandler(printersController.updateSettings));
