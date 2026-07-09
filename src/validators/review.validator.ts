import { z } from "zod";

export const createReviewSchema = z.object({
  propertyId: z.string().min(1),
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().min(5),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
