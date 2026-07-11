import z from 'zod';

export const CreateUserSchema = z.object({
  firstName: z.string().min(1, 'Please, enter your first name'),
  lastName: z.string().min(1, 'Please, enter your last name'),
  email: z.email('Email invalid'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  role: z.string(),
});

export type CreateUserFormValues = z.infer<typeof CreateUserSchema>;

export const UpdateUserSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.email().optional(),
  password: z.string().optional(),
  role: z.string(),
});

export type UpdateUserFormValues = z.infer<typeof UpdateUserSchema>;