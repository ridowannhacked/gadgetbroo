// zodSchemas/categorySchema.ts
import { z } from "zod";

export const createCategorySchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(100, "Slug too long")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase letters, numbers and hyphens only"),
  description: z.string().max(500, "Description too long").optional(),
  image: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  // Explicit boolean — no .default() so the inferred *input* type stays `boolean`,
  // not `boolean | undefined`. Defaults are set in useForm({ defaultValues }).
  isActive: z.boolean(),
});

export const updateCategorySchema = createCategorySchema.partial();

export type CreateCategoryValues = z.infer<typeof createCategorySchema>;
export type UpdateCategoryValues = z.infer<typeof updateCategorySchema>;
