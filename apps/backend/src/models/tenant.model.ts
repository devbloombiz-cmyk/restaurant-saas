import { model, Schema } from "mongoose";
import { schemaOptions } from "@/models/base.schema";

const tenantSchema = new Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true, lowercase: true, index: true },
    isActive: { type: Boolean, default: true }
  },
  schemaOptions
);

tenantSchema.index({ createdAt: -1 });

export const TenantModel = model("Tenant", tenantSchema, "tenants");
