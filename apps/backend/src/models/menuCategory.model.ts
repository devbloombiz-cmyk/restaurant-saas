import { model, Schema } from "mongoose";
import { baseFields, schemaOptions } from "@/models/base.schema";

const menuCategorySchema = new Schema(
  {
    ...baseFields,
    name: { type: String, required: true },
    sortOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true }
  },
  schemaOptions
);

menuCategorySchema.index({ tenantId: 1, shopId: 1, name: 1 }, { unique: true });
menuCategorySchema.index({ tenantId: 1, shopId: 1, createdAt: -1 });

export const MenuCategoryModel = model("MenuCategory", menuCategorySchema, "menuCategories");
