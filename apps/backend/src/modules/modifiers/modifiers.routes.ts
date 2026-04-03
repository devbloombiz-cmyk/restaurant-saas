import { Router } from "express";
import { requireAuth, authorize } from "@/middlewares/auth";
import { USER_ROLES } from "@shared/types/roles";
import { ModifiersController } from "@/modules/modifiers/modifiers.controller";
import { asyncHandler } from "@/utils/asyncHandler";
import { validateRequest } from "@/middlewares/validateRequest";
import { createModifierSchema, modifierParamIdSchema, updateModifierSchema } from "@/validators/modifier.schema";

export const modifiersRouter = Router();
const modifiersController = new ModifiersController();

modifiersRouter.use(requireAuth, authorize([USER_ROLES.SUPER_ADMIN, USER_ROLES.SHOP_ADMIN]));

modifiersRouter.post("/", validateRequest(createModifierSchema), asyncHandler(modifiersController.createModifier));
modifiersRouter.get("/", asyncHandler(modifiersController.getModifiers));
modifiersRouter.patch("/:id", validateRequest(updateModifierSchema), asyncHandler(modifiersController.updateModifier));
modifiersRouter.delete("/:id", validateRequest(modifierParamIdSchema), asyncHandler(modifiersController.deleteModifier));
