export function formatCpf(doc: string) {
  return doc.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, "$1.$2.$3-$4");
}

export function formatCnpj(doc: string) {
  return doc.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");
}

export function formatDocument(doc: string | null, type: string | null) {
  if (!doc) return null;
  const digits = doc.replace(/\D/g, "");
  if (type === "CPF" && digits.length === 11) return formatCpf(digits);
  if (type === "CNPJ" && digits.length === 14) return formatCnpj(digits);
  return doc;
}

export function formatPhone(phone: string | null) {
  if (!phone) return null;
  return phone.replace(/^(\d{2})(\d{5})(\d{4})$/, "($1) $2-$3");
}

export function formatCep(cep: string | null) {
  if (!cep) return null;
  return cep.replace(/^(\d{5})(\d{3})$/, "$1-$2");
}