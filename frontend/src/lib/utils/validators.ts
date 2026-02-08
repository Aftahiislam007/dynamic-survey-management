import { z } from 'zod';

export const emailSchema = z
  .string()
  .email('Invalid email address')
  .min(1, 'Email is required');

export const passwordSchema = z
  .string()
  .min(6, 'Password must be at least 6 characters')
  .max(100, 'Password is too long');

export const nameSchema = z
  .string()
  .min(2, 'Name must be at least 2 characters')
  .max(100, 'Name is too long');

export const surveyTitleSchema = z
  .string()
  .min(1, 'Title is required')
  .max(200, 'Title is too long');

export const fieldLabelSchema = z
  .string()
  .min(1, 'Label is required')
  .max(100, 'Label is too long');

export const optionsSchema = z
  .string()
  .refine(
    (val) => {
      if (!val) return true;
      const options = val.split(',').map(opt => opt.trim());
      return options.every(opt => opt.length > 0);
    },
    { message: 'Options must be comma-separated and non-empty' }
  );

export const createLoginSchema = (userType: string) => {
  return z.object({
    email: emailSchema,
    password: passwordSchema,
    userType: z.enum(['ADMIN', 'OFFICER']),
  });
};

export const createSurveySchema = z.object({
  title: surveyTitleSchema,
  description: z.string().max(500, 'Description is too long').optional(),
  status: z.enum(['DRAFT', 'ACTIVE', 'INACTIVE', 'ARCHIVED']).optional(),
});

export const createFieldSchema = z.object({
  label: fieldLabelSchema,
  type: z.enum(['TEXT', 'TEXTAREA', 'NUMBER', 'CHECKBOX', 'RADIO', 'SELECT']),
  required: z.boolean().default(false),
  options: optionsSchema.optional(),
  placeholder: z.string().max(100, 'Placeholder is too long').optional(),
  order: z.number().int().min(0),
});