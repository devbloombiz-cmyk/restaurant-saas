import { z } from "zod";

export const statusParamSchema = z.object({
  body: z.object({ isActive: z.boolean() }),
  params: z.object({ id: z.string().min(1) }),
  query: z.object({}).optional()
});
