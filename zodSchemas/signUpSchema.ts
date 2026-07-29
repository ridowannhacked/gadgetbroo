import { z } from 'zod'
import { passwordSchema } from './passwordSchema';

export const signUpSchema = z
  .object({
    name: z.string().min(1, { message: "Name is required" }),
    email: z.email("Please enter a valid email address"),

    password: passwordSchema,
    passwordConfirmation: z
      .string()
      .min(1, { message: "Please confirm password" }),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: "Passwords do not match",
    path: ["passwordConfirmation"],
  });
