import { z } from "zod";

export const printOrderParamSchema = z.object({
  body: z.object({ copies: z.number().int().positive().optional() }).optional(),
  params: z.object({ orderId: z.string().min(1) }),
  query: z.object({}).optional()
});

export const updatePrinterSettingsSchema = z.object({
  body: z
    .object({
      printerName: z.string().min(1).optional(),
      printerType: z.enum(["thermal", "inkjet", "laser"]).optional(),
      connectionType: z.enum(["lan", "wifi", "usb"]).optional(),
      ipAddress: z.string().optional(),
      port: z.number().int().optional(),
      paperWidth: z.union([z.literal(58), z.literal(80)]).optional(),
      autoPrint: z.boolean().optional(),
      copies: z.number().int().positive().optional(),
      cutMode: z.enum(["none", "partial", "full"]).optional(),
      feedBeforeCutLines: z.number().int().min(0).max(10).optional(),
      isActive: z.boolean().optional()
    })
    .refine((value) => Object.keys(value).length > 0, "At least one field is required"),
  params: z.object({}).optional(),
  query: z.object({}).optional()
});
