import { z } from 'zod';

export const contactSchema = z.object({
  phone: z.string().regex(/^\([0-9]{2}\) 9[0-9]{4}-[0-9]{4}$/, 'Telefone inválido'),
});

export type ContactData = z.infer<typeof contactSchema>;
