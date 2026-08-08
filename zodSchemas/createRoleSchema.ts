import { z } from "zod";

export const createRoleSchema = z.object({
  name: z
    .string()
    .min(3, "Role name must be at least 3 characters")
    .max(50),

  description: z
    .string()
    .max(255),
});

export type CreateRoleInput = z.infer<typeof createRoleSchema>;
