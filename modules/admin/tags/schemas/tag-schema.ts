import z from 'zod';

export const CreateTagSchema = z.object({
  name: z.string().min(1, 'Please enter category name'),  
});

export type CreateTagFormValues = z.infer<typeof CreateTagSchema>;

export const UpdateTagSchema = z.object({
  name: z.string().optional(),
});

export type UpdateTagFormValues = z.infer<typeof UpdateTagSchema>;
