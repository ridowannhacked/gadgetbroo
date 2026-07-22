import { z } from 'zod'

export const signInSchema = z.object({
  email: z.email({ message: "Please enter a valid email address" })
    .regex(/^[A-Za-z0-9._%+-]+@gmail\.com$/i, { message: "Only Gmail addresses are allowed", }),
  password: z.string().min(1, { message: "Password is required" }),
  rememberMe: z.boolean().optional(),
});
