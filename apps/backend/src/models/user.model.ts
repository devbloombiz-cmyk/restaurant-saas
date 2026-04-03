import { model, Schema } from "mongoose";
import { baseFields, schemaOptions } from "@/models/base.schema";
import { USER_ROLES } from "@shared/types/roles";

const userSchema = new Schema(
  {
    ...baseFields,
    name: { type: String, required: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: Object.values(USER_ROLES), required: true },
    isActive: { type: Boolean, default: true },
    refreshTokenHash: { type: String, default: null }
  },
  schemaOptions
);

userSchema.index({ tenantId: 1, email: 1 }, { unique: true });
userSchema.index({ tenantId: 1, shopId: 1, role: 1 });
userSchema.index({ email: 1 });

export const UserModel = model("User", userSchema, "users");
