import z from 'zod';

import { UserRole } from '@/lib/enums/user-role.enum';

export const userColumnSchema = z.object({
  id: z.number(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string(),

  role: z.enum(UserRole),
  active: z.boolean(),
  verified: z.boolean(),
  
  avatar: z
    .object({
      path: z.string().optional(),
    })
    .nullable()
    .optional(),
  
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable(),
});
