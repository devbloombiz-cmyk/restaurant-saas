import { model, Schema } from "mongoose";
import { baseFields, schemaOptions } from "@/models/base.schema";

const menuItemSchema = new Schema(
  {
    ...baseFields,
    categoryId: { type: Schema.Types.ObjectId, required: true, ref: "MenuCategory" },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    description: { type: String, default: "" },
    modifierEnabled: { type: Boolean, default: false },
    isAvailable: { type: Boolean, default: true },
    image: { type: String, default: "" },
    sortOrder: { type: Number, default: 0 }
  },
  schemaOptions
);

menuItemSchema.index({ tenantId: 1, shopId: 1, categoryId: 1, name: 1 }, { unique: true });
menuItemSchema.index({ tenantId: 1, shopId: 1, createdAt: -1 });

export const MenuItemModel = model("MenuItem", menuItemSchema, "menuItems");
