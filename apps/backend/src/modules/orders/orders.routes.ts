import { Router } from "express";
import { requireAuth, authorize } from "@/middlewares/auth";
import { USER_ROLES } from "@shared/types/roles";
import { OrdersController } from "@/modules/orders/orders.controller";
import { asyncHandler } from "@/utils/asyncHandler";
import { validateRequest } from "@/middlewares/validateRequest";
import { createOrderSchema, orderParamIdSchema, updateOrderSchema } from "@/validators/order.schema";

export const ordersRouter = Router();
const ordersController = new OrdersController();

ordersRouter.use(requireAuth, authorize([USER_ROLES.SUPER_ADMIN, USER_ROLES.SHOP_ADMIN, USER_ROLES.CASHIER]));

ordersRouter.post("/", validateRequest(createOrderSchema), asyncHandler(ordersController.createOrder));
ordersRouter.get("/", asyncHandler(ordersController.getOrders));
ordersRouter.get("/daily-summary", asyncHandler(ordersController.dailySummary));
ordersRouter.get("/:id", validateRequest(orderParamIdSchema), asyncHandler(ordersController.getOrderById));
ordersRouter.patch("/:id", validateRequest(updateOrderSchema), asyncHandler(ordersController.updateOrder));
