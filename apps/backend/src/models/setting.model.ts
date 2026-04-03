import { model, Schema } from "mongoose";
import { baseFields, schemaOptions } from "@/models/base.schema";

const settingSchema = new Schema(
  {
    ...baseFields,
    key: { type: String, required: true },
    value: { type: Schema.Types.Mixed, required: true }
  },
  schemaOptions
);

export const SettingModel = model("Setting", settingSchema, "settings");
