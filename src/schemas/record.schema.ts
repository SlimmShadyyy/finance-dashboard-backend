import { z } from 'zod';

export const CreateRecordSchema = z.object({
  body: z.object({
    amount: z.number().positive("Amount must be positive"),
    type: z.enum(['INCOME', 'EXPENSE']),
    category: z.string().min(1, "Category is required"),
    notes: z.string().optional(),
  })
});