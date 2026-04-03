import { z } from "zod";

export const createModifierSchema = z.object({
  body: z.object({
    itemId: z.string().min(1),
    name: z.string().min(2),
    priceAdjustment: z.number(),
    type: z.enum(["add", "remove"])
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional()
});

export const updateModifierSchema = z.object({
  body: z
    .object({
      itemId: z.string().min(1).optional(),
      name: z.string().min(2).optional(),
      priceAdjustment: z.number().optional(),
      type: z.enum(["add", "remove"]).optional()
    })
    .refine((v) => Object.keys(v).length > 0, "At least one field is required"),
  params: z.object({ id: z.string().min(1) }),
  query: z.object({}).optional()
});

export const modifierParamIdSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({ id: z.string().min(1) }),
  query: z.object({}).optional()
});
