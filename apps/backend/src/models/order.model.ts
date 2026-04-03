import { model, Schema } from "mongoose";
import { baseFields, schemaOptions } from "@/models/base.schema";

const orderSchema = new Schema(
  {
    ...baseFields,
    orderNumber: { type: String, required: true },
    orderType: { type: String, enum: ["website", "takeaway", "eat_in"], required: true },
    items: { type: [Schema.Types.Mixed], default: [] },
    paymentMode: { type: String, enum: ["cash", "card", "pending"], required: true },
    total: { type: Number, required: true },
    createdBy: { type: Schema.Types.ObjectId, required: true, ref: "User" },
    status: { type: String, default: "placed" }
  },
  schemaOptions
);

orderSchema.index({ tenantId: 1, shopId: 1, orderNumber: 1 }, { unique: true });
orderSchema.index({ tenantId: 1, shopId: 1, createdAt: -1 });
orderSchema.index({ tenantId: 1, shopId: 1, paymentMode: 1, createdAt: -1 });

export const OrderModel = model("Order", orderSchema, "orders");
