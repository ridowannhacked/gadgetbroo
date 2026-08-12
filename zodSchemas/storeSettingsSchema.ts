import { z } from "zod";

export const storeSettingsSchema = z.object({
  bannerUrl: z.string().url().nullable().optional(),
  faviconUrl: z.string().url().nullable().optional(),
  contactEmail: z.string().email("Invalid email address"),
  contactPhone: z.string().regex(/^(?:\+88)?01[3-9]\d{8}$/, "Must be a valid 11-digit Bangladeshi mobile number"),
  contactAddress: z.string().min(5, "Address must be at least 5 characters long"),
});

export type StoreSettingsInput = z.infer<typeof storeSettingsSchema>;
