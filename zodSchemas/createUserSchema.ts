import { z } from 'zod';
import { passwordSchema } from './passwordSchema';

export const CreateUserSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  email: z.string().email("Please enter a valid email address"),
  password: passwordSchema,
  roleId: z.string().optional(),
});
