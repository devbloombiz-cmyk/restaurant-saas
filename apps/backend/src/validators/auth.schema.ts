import { z } from "zod";

export const loginSchema = z.object({
  body: z
    .object({
      email: z.string().email(),
      password: z.string().min(8),
      tenantId: z.string().min(1),
      shopId: z.string().min(1).optional()
    })
    .strict(),
  params: z.object({}).optional(),
  query: z.object({}).optional()
});

export const registerShopAdminSchema = z.object({
  body: z
    .object({
      tenantName: z.string().min(2),
      tenantSlug: z.string().min(2).regex(/^[a-z0-9-]+$/),
      shopName: z.string().min(2),
      shopLocation: z.string().min(2),
      adminName: z.string().min(2),
      adminEmail: z.string().email(),
      adminPassword: z.string().min(8)
    })
    .strict(),
  params: z.object({}).optional(),
  query: z.object({}).optional()
});

export const registerCashierSchema = z.object({
  body: z
    .object({
      name: z.string().min(2),
      email: z.string().email(),
      password: z.string().min(8)
    })
    .strict(),
  params: z.object({}).optional(),
  query: z.object({}).optional()
});

export const refreshTokenSchema = z.object({
  body: z
    .object({
      refreshToken: z.string().min(20)
    })
    .strict(),
  params: z.object({}).optional(),
  query: z.object({}).optional()
});

export const logoutSchema = z.object({
  body: z
    .object({
      accessToken: z.string().min(20),
      refreshToken: z.string().min(20)
    })
    .strict(),
  params: z.object({}).optional(),
  query: z.object({}).optional()
});
