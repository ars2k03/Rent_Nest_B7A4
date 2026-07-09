import { z } from "zod";

export const userIdSchema = z.object({
  id: z.string().min(1),
});

export const updateUserStatusSchema = z.object({
  isDeleted: z.boolean(),
});

export const adminQuerySchema = z.object({
  role: z.enum(["TENANT", "LANDLORD", "ADMIN"]).optional(),
  isDeleted: z
    .enum(["true", "false"])
    .optional()
    .transform((value) => (value === undefined ? undefined : value === "true")),
  page: z.string().optional(),
  limit: z.string().optional(),
});
