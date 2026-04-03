import { model, Schema } from "mongoose";
import { baseFields, schemaOptions } from "@/models/base.schema";

const modifierSchema = new Schema(
  {
    ...baseFields,
    itemId: { type: Schema.Types.ObjectId, required: true, ref: "MenuItem" },
    name: { type: String, required: true },
    priceAdjustment: { type: Number, required: true, default: 0 },
    type: { type: String, enum: ["add", "remove"], required: true }
  },
  schemaOptions
);

modifierSchema.index({ tenantId: 1, shopId: 1, itemId: 1, name: 1 }, { unique: true });

export const ModifierModel = model("Modifier", modifierSchema, "modifiers");
