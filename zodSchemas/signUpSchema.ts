import { z } from 'zod'
import { passwordSchema } from './passwordSchema';

export const signUpSchema = z
  .object({
    name: z.string().min(1, { message: "Name is required" }),
    email: z.email({ message: "Please enter a valid email address" })
      .regex(/^[A-Za-z0-9._%+-]+@gmail\.com$/i, { message: "Only Gmail addresses are allowed", }),

    password: passwordSchema,
    passwordConfirmation: z
      .string()
      .min(1, { message: "Please confirm password" }),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: "Passwords do not match",
    path: ["passwordConfirmation"],
  });
