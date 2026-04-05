import { Router } from "express";
import { requireAuth, authorize } from "@/middlewares/auth";
import { USER_ROLES } from "@shared/types/roles";
import { ModifiersController } from "@/modules/modifiers/modifiers.controller";
import { asyncHandler } from "@/utils/asyncHandler";
import { validateRequest } from "@/middlewares/validateRequest";
import { createModifierSchema, modifierParamIdSchema, updateModifierSchema } from "@/validators/modifier.schema";

export const modifiersRouter = Router();
const modifiersController = new ModifiersController();

modifiersRouter.use(requireAuth);

modifiersRouter.post("/", authorize([USER_ROLES.SUPER_ADMIN, USER_ROLES.SHOP_ADMIN]), validateRequest(createModifierSchema), asyncHandler(modifiersController.createModifier));
modifiersRouter.get("/", authorize([USER_ROLES.SUPER_ADMIN, USER_ROLES.SHOP_ADMIN, USER_ROLES.CASHIER]), asyncHandler(modifiersController.getModifiers));
modifiersRouter.patch("/:id", authorize([USER_ROLES.SUPER_ADMIN, USER_ROLES.SHOP_ADMIN]), validateRequest(updateModifierSchema), asyncHandler(modifiersController.updateModifier));
modifiersRouter.delete("/:id", authorize([USER_ROLES.SUPER_ADMIN, USER_ROLES.SHOP_ADMIN]), validateRequest(modifierParamIdSchema), asyncHandler(modifiersController.deleteModifier));
