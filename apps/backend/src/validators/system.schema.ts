import { z } from "zod";

export const restoreSchema = z.object({
  body: z
    .object({
      fileName: z.string().min(1)
    })
    .strict(),
  params: z.object({}).optional(),
  query: z.object({}).optional()
});

export const backupFileParamSchema = z.object({
  body: z.object({}).optional(),
  params: z
    .object({
      fileName: z.string().min(1)
    })
    .strict(),
  query: z.object({}).optional()
});
