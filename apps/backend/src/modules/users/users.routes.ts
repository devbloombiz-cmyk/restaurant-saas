import { Router } from "express";
import { requireAuth, authorize } from "@/middlewares/auth";
import { USER_ROLES } from "@shared/types/roles";
import { UsersController } from "@/modules/users/users.controller";
import { asyncHandler } from "@/utils/asyncHandler";
import { validateRequest } from "@/middlewares/validateRequest";
import { cashierParamSchema, createCashierSchema, updateCashierSchema } from "@/validators/users.schema";

export const usersRouter = Router();
const usersController = new UsersController();

usersRouter.use(requireAuth, authorize([USER_ROLES.SHOP_ADMIN, USER_ROLES.SUPER_ADMIN]));

usersRouter.post("/cashier", validateRequest(createCashierSchema), asyncHandler(usersController.createCashier));
usersRouter.get("/cashier", asyncHandler(usersController.getCashiers));
usersRouter.patch("/cashier/:id", validateRequest(updateCashierSchema), asyncHandler(usersController.updateCashier));
usersRouter.delete("/cashier/:id", validateRequest(cashierParamSchema), asyncHandler(usersController.deleteCashier));
