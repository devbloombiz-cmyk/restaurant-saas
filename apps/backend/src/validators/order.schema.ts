import { z } from "zod";

const orderItemSchema = z
  .object({
    itemId: z.string().min(1),
    name: z.string().min(1),
    qty: z.number().int().positive(),
    unitPrice: z.number().nonnegative(),
    modifiers: z
      .array(
        z
          .object({
            modifierId: z.string().min(1),
            name: z.string().min(1),
            priceAdjustment: z.number()
          })
          .strict()
      )
      .optional()
  })
  .strict();

export const createOrderSchema = z.object({
  body: z
    .object({
      orderType: z.enum(["website", "takeaway", "eat_in"]),
      items: z.array(orderItemSchema).min(1),
      paymentMode: z.enum(["cash", "card", "pending"])
    })
    .strict(),
  params: z.object({}).optional(),
  query: z.object({}).optional()
});

export const updateOrderSchema = z.object({
  body: z
    .object({
      paymentMode: z.enum(["cash", "card", "pending"]).optional(),
      status: z.string().min(2).optional()
    })
    .strict()
    .refine((v) => Object.keys(v).length > 0, "At least one field is required"),
  params: z.object({ id: z.string().min(1) }),
  query: z.object({}).optional()
});

export const orderParamIdSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({ id: z.string().min(1) }),
  query: z.object({}).optional()
});
