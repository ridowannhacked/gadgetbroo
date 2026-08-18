import { z } from "zod";

export const createSiteMediaSchema = z.object({
  title: z.string().min(1, "Title is required"),
  url: z.string().url("Must be a valid URL"),
  fileId: z.string().min(1, "File ID is required"),
  placement: z.enum(["HERO_SLIDER", "PROMOTIONAL_BANNER", "CATEGORY_BANNER"]),
  linkUrl: z.string().nullable().optional(),
  isActive: z.boolean().default(true).optional(),
  sortOrder: z.number().default(0).optional(),
});

export const updateSiteMediaSchema = createSiteMediaSchema.partial();
