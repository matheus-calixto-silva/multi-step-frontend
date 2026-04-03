import { z } from 'zod';

export const identificationSchema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres').trim(),
  email: z.string().email('E-mail inválido').trim(),
});

export type IdentificationData = z.infer<typeof identificationSchema>;
