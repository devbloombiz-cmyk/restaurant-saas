import { Schema } from "mongoose";

export const baseFields = {
  tenantId: { type: String, required: true, index: true },
  shopId: { type: String, required: true, index: true }
} as const;

export const schemaOptions = {
  timestamps: true,
  versionKey: false as false
};
