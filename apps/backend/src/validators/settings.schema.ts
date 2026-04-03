import { z } from "zod";

export const updateShopSettingsSchema = z.object({
  body: z
    .object({
      shopName: z.string().min(2).optional(),
      currency: z.string().min(2).optional(),
      timezone: z.string().min(2).optional(),
      taxRate: z.number().min(0).optional(),
      receiptFooter: z.string().optional(),
      printerDefaults: z.record(z.any()).optional(),
      logo: z.string().optional(),
      supportNumber: z.string().optional()
    })
    .refine((value) => Object.keys(value).length > 0, "At least one field is required"),
  params: z.object({}).optional(),
  query: z.object({}).optional()
});
