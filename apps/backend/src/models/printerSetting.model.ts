import { model, Schema } from "mongoose";
import { baseFields, schemaOptions } from "@/models/base.schema";

const printerSettingSchema = new Schema(
  {
    ...baseFields,
    printerName: { type: String, required: true },
    printerType: { type: String, enum: ["thermal", "inkjet", "laser"], default: "thermal" },
    connectionType: { type: String, enum: ["lan", "wifi", "usb"], required: true },
    ipAddress: { type: String, default: "" },
    port: { type: Number, default: 9100 },
    paperWidth: { type: Number, enum: [58, 80], default: 80 },
    autoPrint: { type: Boolean, default: true },
    copies: { type: Number, default: 1 },
    isActive: { type: Boolean, default: true }
  },
  schemaOptions
);

printerSettingSchema.index({ tenantId: 1, shopId: 1 }, { unique: true });

export const PrinterSettingModel = model("PrinterSetting", printerSettingSchema, "printerSettings");
