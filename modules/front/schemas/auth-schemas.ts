import { z } from 'zod';

// sign in
export const SignInSchema = z.object({
  email: z.email('Email invalid'),
  password: z.string().min(1, 'Please, enter your password'),
});

export type SignInFormValues = z.infer<typeof SignInSchema>;

// sign up
export const SignUpSchema = z.object({
  firstName: z.string().min(1, 'Please, enter your first name'),
  email: z.email('Email invalid'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
});

export const SignUpExtendSchema = SignUpSchema.extend({
  confirmPassword: z.string().min(1, 'Please, confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Password mismatch',
  path: ['confirmPassword'],
});

export type SignUpFormValues = z.infer<typeof SignUpExtendSchema>;