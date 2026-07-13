import z from 'zod';

export const CreateBlogSchema = z.object({
  title: z.string().min(2, 'Title is required'),
  category: z.number().nullable(),
});

export type CreateBlogFormValues = z.infer<typeof CreateBlogSchema>;

export const UpdateBlogSchema = z.object({
  title: z.string().optional().nullable(),
  category: z.number().optional().nullable(),
});

export type UpdateBlogFormValues = z.infer<typeof UpdateBlogSchema>;
