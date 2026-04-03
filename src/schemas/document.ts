import { z } from 'zod';

export function isValidCPF(cpf: string): boolean {
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;

  let sum = 0;
  let remainder;

  for (let i = 1; i <= 9; i++)
    sum += parseInt(cpf.substring(i - 1, i)) * (11 - i);
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cpf.substring(9, 10))) return false;

  sum = 0;
  for (let i = 1; i <= 10; i++)
    sum += parseInt(cpf.substring(i - 1, i)) * (12 - i);
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cpf.substring(10, 11))) return false;

  return true;
}

export function isValidCNPJ(cnpj: string): boolean {
  if (cnpj.length !== 14 || /^(\d)\1{13}$/.test(cnpj)) return false;

  let size = cnpj.length - 2;
  let numbers = cnpj.substring(0, size);
  const digits = cnpj.substring(size);
  let sum = 0;
  let pos = size - 7;

  for (let i = size; i >= 1; i--) {
    sum += parseInt(numbers.charAt(size - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(digits.charAt(0))) return false;

  size += 1;
  numbers = cnpj.substring(0, size);
  sum = 0;
  pos = size - 7;
  for (let i = size; i >= 1; i--) {
    sum += parseInt(numbers.charAt(size - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(digits.charAt(1))) return false;

  return true;
}

export const documentSchema = z
  .object({
    documentType: z.enum(['CPF', 'CNPJ']),
    document: z.string(),
  })
  .superRefine((data, ctx) => {
    const digits = data.document.replace(/\D/g, '');

    if (data.documentType === 'CPF') {
      if (digits.length !== 11) {
        ctx.addIssue({
          code: 'custom',
          message: 'O CPF deve conter exatamente 11 dígitos',
          path: ['document'],
        });
      } else if (!isValidCPF(digits)) {
        ctx.addIssue({
          code: 'custom',
          message: 'CPF inválido',
          path: ['document'],
        });
      }
    }

    if (data.documentType === 'CNPJ') {
      if (digits.length !== 14) {
        ctx.addIssue({
          code: 'custom',
          message: 'O CNPJ deve conter exatamente 14 dígitos',
          path: ['document'],
        });
      } else if (!isValidCNPJ(digits)) {
        ctx.addIssue({
          code: 'custom',
          message: 'CNPJ inválido',
          path: ['document'],
        });
      }
    }
  });

export type DocumentData = z.infer<typeof documentSchema>;
