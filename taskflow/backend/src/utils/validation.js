import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().trim().min(2, 'Name must contain at least 2 characters').max(60),
  email: z.string().trim().email('Please provide a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters').max(128),
});

export const loginSchema = z.object({
  email: z.string().trim().email('Please provide a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters').max(128),
});

export const taskSchema = z.object({
  title: z.string().trim().min(2, 'Title is required').max(120),
  description: z.union([z.string().trim().max(2000), z.literal('')]).optional().default(''),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
  dueDate: z.union([z.string(), z.null()]).optional(),
});
