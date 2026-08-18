import { z } from "zod";

export const createReviewSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  rating: z.coerce.number().min(1).max(5),
  title: z.string().optional().transform(val => val ? val.replace(/<[^>]*>?/gm, '') : val),
  content: z.string().optional().transform(val => val ? val.replace(/<[^>]*>?/gm, '') : val),
});

export const updateReviewVisibilitySchema = z.object({
  isVisible: z.boolean()
});
