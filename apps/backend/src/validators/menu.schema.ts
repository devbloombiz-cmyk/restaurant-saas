import { z } from "zod";

export const createMenuCategorySchema = z.object({
  body: z.object({
    name: z.string().min(2),
    sortOrder: z.number().int().optional(),
    isActive: z.boolean().optional()
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional()
});

export const updateMenuCategorySchema = z.object({
  body: z
    .object({
      name: z.string().min(2).optional(),
      sortOrder: z.number().int().optional(),
      isActive: z.boolean().optional()
    })
    .refine((v) => Object.keys(v).length > 0, "At least one field is required"),
  params: z.object({ id: z.string().min(1) }),
  query: z.object({}).optional()
});

export const createMenuItemSchema = z.object({
  body: z.object({
    categoryId: z.string().min(1),
    name: z.string().min(2),
    price: z.number().nonnegative(),
    description: z.string().optional(),
    modifierEnabled: z.boolean().optional(),
    isAvailable: z.boolean().optional(),
    image: z.string().optional(),
    sortOrder: z.number().int().optional()
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional()
});

export const updateMenuItemSchema = z.object({
  body: z
    .object({
      categoryId: z.string().min(1).optional(),
      name: z.string().min(2).optional(),
      price: z.number().nonnegative().optional(),
      description: z.string().optional(),
      modifierEnabled: z.boolean().optional(),
      isAvailable: z.boolean().optional(),
      image: z.string().optional(),
      sortOrder: z.number().int().optional()
    })
    .refine((v) => Object.keys(v).length > 0, "At least one field is required"),
  params: z.object({ id: z.string().min(1) }),
  query: z.object({}).optional()
});

export const menuParamIdSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({ id: z.string().min(1) }),
  query: z.object({}).optional()
});
