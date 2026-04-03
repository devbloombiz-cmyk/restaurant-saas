import { model, Schema } from "mongoose";
import { baseFields, schemaOptions } from "@/models/base.schema";

const roleSchema = new Schema(
  {
    ...baseFields,
    key: { type: String, required: true },
    permissions: { type: [String], default: [] }
  },
  schemaOptions
);

export const RoleModel = model("Role", roleSchema, "roles");
