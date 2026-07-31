import { z } from 'zod';

export const memberProfileFormSchema = z.object({
  firstName: z.string().min(1, 'Enter your first name'),
  lastName: z.string(),
});

export type MemberProfileFormValues = z.infer<typeof memberProfileFormSchema>;
