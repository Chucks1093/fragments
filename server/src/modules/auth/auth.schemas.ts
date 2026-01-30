import { z } from 'zod';

export const CreateUserWithPasswordSchema = z.object({
   firstName: z.string(),
   lastName: z.string(),
   email: z.string().email(),

   password: z
      .string()
      .min(8, 'At least 8 characters')
      .regex(/[a-z]/, 'At least one lowercase')
      .regex(/[A-Z]/, 'At least one uppercase')
      .regex(/[0-9]/, 'At least one number'),
   phoneNumber: z.string().optional(),
});

export type CreateUserWithPasswordType = z.infer<
   typeof CreateUserWithPasswordSchema
>;
