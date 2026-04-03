import { model, Schema } from "mongoose";
import { baseFields, schemaOptions } from "@/models/base.schema";

const shopSchema = new Schema(
  {
    ...baseFields,
    name: { type: String, required: true },
    location: { type: String, required: true },
    printerConfig: { type: Schema.Types.Mixed, default: {} },
    isActive: { type: Boolean, default: true }
  },
  schemaOptions
);

shopSchema.index({ tenantId: 1, shopId: 1 }, { unique: true });

export const ShopModel = model("Shop", shopSchema, "shops");
