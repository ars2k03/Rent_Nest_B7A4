import { z } from "zod";

export const createRentalSchema = z.object({
  propertyId: z.string().min(1),
  moveInDate: z.coerce.date(),
  message: z.string().optional(),
});

export const rentalIdSchema = z.object({
  id: z.string().min(1),
});

export const updateRentalStatusSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED", "COMPLETED"]),
});

export const rentalQuerySchema = z.object({
  status: z
    .enum(["PENDING", "APPROVED", "REJECTED", "ACTIVE", "COMPLETED"])
    .optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
});
