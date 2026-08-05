import { z } from 'zod';

const userSchema = z.object({
  id: z.number(),
  firstName: z.string(),
  lastName: z.string().nullable(),
});

export const adminCommentColumnSchema = z.object({
  id: z.number(),
  content: z.string(),
  isReply: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
  deletedAt: z.string().nullable().optional(),
  /** Backend-provided slug used to open the public blog page. */
  blogSlug: z.string().nullable().optional(),
  user: userSchema,
  replyUser: userSchema.nullable().optional(),
  parentId: z
    .object({
      id: z.number(),
      content: z.string(),
      isReply: z.boolean(),
      user: userSchema,
    })
    .nullable()
    .optional(),
});
