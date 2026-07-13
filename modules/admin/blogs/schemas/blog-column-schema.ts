import { UserRole } from '@/lib/enums/user-role.enum';
import z from 'zod';

export const blogColumnSchema = z.object({
  id: z.number(),
  title: z.string(),
  slug: z.string(),
  content: z.string(),
  publishedOn: z.date().nullable().optional(),
  status: z.enum(UserRole).optional().nullable(),
  thumbnail: z
    .object({
      path: z.string().optional(),
    })
    .nullable()
    .optional(),
  pictures: z
    .array(
      z.object({
        id: z.number(),
        name: z.string(),
        path: z.string(),
        size: z.string(),
        createdAt: z.date(),
        updatedAt: z.date(),
      }),
    )
    .optional()
    .nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().optional().nullable()
});
