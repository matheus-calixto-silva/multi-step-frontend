import { z } from 'zod';

export const documentSchema = z.object({
  documentType: z.enum(['CPF', 'CNPJ']),
  document: z.string().min(11, 'Documento inválido'),
});

export type DocumentData = z.infer<typeof documentSchema>;
