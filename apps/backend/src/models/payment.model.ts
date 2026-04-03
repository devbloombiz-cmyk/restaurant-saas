import { model, Schema } from "mongoose";
import { baseFields, schemaOptions } from "@/models/base.schema";

const paymentSchema = new Schema(
  {
    ...baseFields,
    orderId: { type: Schema.Types.ObjectId, required: true, ref: "Order" },
    amount: { type: Number, required: true },
    method: { type: String, required: true }
  },
  schemaOptions
);

export const PaymentModel = model("Payment", paymentSchema, "payments");
