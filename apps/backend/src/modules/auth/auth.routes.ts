import { Router } from "express";
import { AuthController } from "@/modules/auth/auth.controller";
import { validateRequest } from "@/middlewares/validateRequest";
import {
	loginSchema,
	logoutSchema,
	refreshTokenSchema,
	registerCashierSchema,
	registerShopAdminSchema
} from "@/validators/auth.schema";
import { requireAuth, authorize } from "@/middlewares/auth";
import { USER_ROLES } from "@shared/types/roles";
import { asyncHandler } from "@/utils/asyncHandler";
import { loginThrottle } from "@/middlewares/rateLimit";

export const authRouter = Router();

const authController = new AuthController();

authRouter.post("/login", loginThrottle, validateRequest(loginSchema), asyncHandler(authController.login));
authRouter.post("/refresh-token", validateRequest(refreshTokenSchema), asyncHandler(authController.refreshToken));
authRouter.post("/logout", validateRequest(logoutSchema), asyncHandler(authController.logout));
authRouter.post(
	"/register-shop-admin",
	requireAuth,
	authorize([USER_ROLES.SUPER_ADMIN]),
	validateRequest(registerShopAdminSchema),
	asyncHandler(authController.registerShopAdmin)
);
authRouter.post(
	"/register-cashier",
	requireAuth,
	authorize([USER_ROLES.SHOP_ADMIN]),
	validateRequest(registerCashierSchema),
	asyncHandler(authController.registerCashier)
);
authRouter.get("/profile", requireAuth, asyncHandler(authController.profile));
