import { z } from "zod";

export const checkoutSchema = z.object({
  items: z.array(z.object({
    variantId: z.string().min(1),
    productId: z.string().min(1),
    quantity: z.number().min(1),
    price: z.number().min(0)
  })).min(1, "Cart cannot be empty"),
  addressId: z.string().optional(),
  saveAddress: z.boolean().optional(),
  fullName: z.string().optional().transform(val => val ? val.replace(/<[^>]*>?/gm, '') : val),
  phone: z.string().optional(),
  line1: z.string().optional().transform(val => val ? val.replace(/<[^>]*>?/gm, '') : val),
  line2: z.string().optional().transform(val => val ? val.replace(/<[^>]*>?/gm, '') : val),
  city: z.string().optional(),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().default("Bangladesh"),
  paymentMethod: z.string(),
});
