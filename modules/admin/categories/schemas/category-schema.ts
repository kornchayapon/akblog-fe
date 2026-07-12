import z from 'zod';

export const CreateCategorySchema = z.object({
  name: z.string().min(1, 'Please enter category name'),  
  description: z.string().optional(),
});

export type CreateCategoryFormValues = z.infer<typeof CreateCategorySchema>;

export const UpdateCategorySchema = z.object({
  name: z.string().optional(),  
  description: z.string().optional(),
});

export type UpdateCategoryFormValues = z.infer<typeof UpdateCategorySchema>;
