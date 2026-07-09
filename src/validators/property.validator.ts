import { z } from "zod";

export const createPropertySchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  location: z.string().min(2),
  price: z.coerce.number().positive(),
  bedrooms: z.coerce.number().int().min(0),
  bathrooms: z.coerce.number().int().min(0),
  image: z.string().url().optional(),
  amenities: z.array(z.string()).default([]),
  isAvailable: z.boolean().optional(),
  categoryId: z.string().min(1),
});

export const updatePropertySchema = createPropertySchema.partial();

export const propertyIdSchema = z.object({
  id: z.string().min(1),
});

export const propertyQuerySchema = z.object({
  location: z.string().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  categoryId: z.string().optional(),
  amenities: z.string().optional(),
  search: z.string().optional(),
  isAvailable: z
    .enum(["true", "false"])
    .optional()
    .transform((value) => (value === undefined ? undefined : value === "true")),
  page: z.string().optional(),
  limit: z.string().optional(),
});

export type CreatePropertyInput = z.infer<typeof createPropertySchema>;
export type UpdatePropertyInput = z.infer<typeof updatePropertySchema>;
export type PropertyIdParams = z.infer<typeof propertyIdSchema>;
export type PropertyQueryInput = z.infer<typeof propertyQuerySchema>;
