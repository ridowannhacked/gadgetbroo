import { z } from "zod";

export const createCommentSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  body: z.string().min(1, "Comment body is required")
    .transform(val => val.replace(/<[^>]*>?/gm, '')),
});

export const updateCommentSchema = z.object({
  body: z.string().optional().transform(val => val ? val.replace(/<[^>]*>?/gm, '') : val),
  isPublic: z.boolean().optional(),
  adminReply: z.string().optional().transform(val => val ? val.replace(/<[^>]*>?/gm, '') : val),
});
