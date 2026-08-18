import { z } from "zod";

export const addressSchema = z.object({
  fullName: z.string().min(1, "Full name is required").max(100),
  phone: z.string().min(10, "Phone number is invalid").max(20),
  line1: z.string().min(1, "Address is required").max(255),
  line2: z.string().max(255).optional().nullable(),
  city: z.string().min(1, "City is required").max(100),
  state: z.string().min(1, "State/Division is required").max(100),
  postalCode: z.string().max(20).optional().nullable(),
  country: z.string().default("BD"),
  isDefault: z.boolean().optional(),
});
