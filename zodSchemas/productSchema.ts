// zodSchemas/productSchema.ts
import { z } from "zod";

export const productVariantSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Variant name is required"), // "256GB Black", "Default"
  sku: z.string().min(1, "SKU is required"),
  price: z.coerce.number().min(1, "Price must be greater than 0"),
  stock: z.coerce.number().min(0, "Stock cannot be negative"),
  color: z.string().optional(),
  storage: z.string().optional(),
  size: z.string().optional(),
  // Explicit boolean — no .default() so the inferred *input* type stays `boolean`,
  // not `boolean | undefined`. Defaults are set in useForm({ defaultValues }).
  isActive: z.boolean(),
});

export const createProductSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase with hyphens"),
  description: z.string().min(1, "Description is required"),
  brand: z.string().min(1, "Brand is required"),
  categoryId: z.string().min(1, "Category is required"),
  isActive: z.boolean(),
  isFeatured: z.boolean(),
  variants: z.array(productVariantSchema).min(1, "At least one variant is required"),
});

export const updateProductSchema = createProductSchema.partial();

export type CreateProductValues = z.infer<typeof createProductSchema>;
export type UpdateProductValues = z.infer<typeof updateProductSchema>;
export type ProductVariantValues = z.infer<typeof productVariantSchema>;
