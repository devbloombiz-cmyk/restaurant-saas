import { model, Schema } from "mongoose";
import { baseFields, schemaOptions } from "@/models/base.schema";

const shopSettingSchema = new Schema(
  {
    ...baseFields,
    shopName: { type: String, required: true },
    currency: { type: String, default: "INR" },
    currencyLocked: { type: Boolean, default: false },
    timezone: { type: String, default: "Asia/Kolkata" },
    taxRate: { type: Number, default: 0 },
    receiptFooter: { type: String, default: "Thank you for visiting" },
    printerDefaults: { type: Schema.Types.Mixed, default: {} },
    logo: { type: String, default: "" },
    supportNumber: { type: String, default: "" }
  },
  schemaOptions
);

shopSettingSchema.index({ tenantId: 1, shopId: 1 }, { unique: true });

export const ShopSettingModel = model("ShopSetting", shopSettingSchema, "shopSettings");
