import { model, Schema } from "mongoose";
import { schemaOptions } from "@/models/base.schema";

const auditLogSchema = new Schema(
  {
    tenantId: { type: String, required: true, index: true },
    shopId: { type: String, required: true, index: true },
    userId: { type: String, required: true, index: true },
    action: { type: String, required: true, index: true },
    module: { type: String, required: true, index: true },
    metadata: { type: Schema.Types.Mixed, default: {} },
    timestamp: { type: Date, default: Date.now, index: true }
  },
  {
    ...schemaOptions,
    timestamps: false
  }
);

export const AuditLogModel = model("AuditLog", auditLogSchema, "auditLogs");
