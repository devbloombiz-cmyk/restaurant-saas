import { z } from "zod";

export const createShopSchema = z.object({
  body: z.object({
    tenantId: z.string().min(1).optional(),
    shopId: z.string().min(2).optional(),
    name: z.string().min(2),
    location: z.string().min(2),
    printerConfig: z.record(z.any()).optional(),
    isActive: z.boolean().optional()
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional()
});

export const updateShopSchema = z.object({
  body: z
    .object({
      name: z.string().min(2).optional(),
      location: z.string().min(2).optional(),
      printerConfig: z.record(z.any()).optional(),
      isActive: z.boolean().optional()
    })
    .refine((v) => Object.keys(v).length > 0, "At least one field is required"),
  params: z.object({ id: z.string().min(1) }),
  query: z.object({}).optional()
});

export const shopIdParamSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({ id: z.string().min(1) }),
  query: z.object({}).optional()
});
