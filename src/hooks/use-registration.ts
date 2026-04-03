"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

// Tipos

export type EditableStep = "IDENTIFICATION" | "DOCUMENT" | "CONTACT" | "ADDRESS";

type RegistrationStep =
  | "IDENTIFICATION"
  | "DOCUMENT"
  | "CONTACT"
  | "ADDRESS"
  | "REVIEW"
  | "COMPLETED";

type DocumentType = "CPF" | "CNPJ";

export interface Registration {
  id: string;
  name: string | null;
  email: string | null;
  documentType: DocumentType | null;
  document: string | null;
  phone: string | null;
  cep: string | null;
  street: string | null;
  number: string | null;
  complement: string | null;
  neighborhood: string | null;
  city: string | null;
  state: string | null;
  currentStep: RegistrationStep;
  mfaVerifiedAt: string | null;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
}

interface CepResponse {
  cep: string;
  street: string;
  neighborhood: string;
  city: string;
  state: string;
}

type StepPayload =
  | { step: "IDENTIFICATION"; data: { name: string; email: string } }
  | { step: "DOCUMENT"; data: { documentType: "CPF" | "CNPJ"; document: string } }
  | { step: "CONTACT"; data: { phone: string } }
  | {
    step: "ADDRESS"; data: {
      cep: string; street: string; number: string;
      complement?: string; neighborhood: string; city: string; state: string;
    }
  };

export function useCreateRegistration() {
  return useMutation({
    mutationFn: () =>
      api.post<{ id: string }>("/registrations").then((r) => r.data),
  });
}

export function useRegistration(id: string | null) {
  return useQuery({
    queryKey: ["registration", id],
    queryFn: () =>
      api.get<Registration>(`/registrations/${id}`).then((r) => r.data),
    enabled: !!id,
  });
}

export function useUpdateStep(id: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: StepPayload) =>
      api
        .patch<Registration | { requiresMfa: true }>(
          `/registrations/${id}/steps/${payload.step}`,
          payload.data,
        )
        .then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["registration", id] });
    },
  });
}

export function useVerifyMfa(id: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (code: string) =>
      api
        .post<Registration>(`/registrations/${id}/verify-mfa`, { code })
        .then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["registration", id] });
    },
  });
}

export function useResendMfa(id: string | null) {
  return useMutation({
    mutationFn: () => api.post(`/registrations/${id}/resend-mfa`),
  });
}

export function useCompleteRegistration(id: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () =>
      api
        .post<Registration>(`/registrations/${id}/complete`)
        .then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["registration", id] });
    },
  });
}

export function useCepLookup(cep: string) {
  return useQuery({
    queryKey: ["cep", cep],
    queryFn: () =>
      api.get<CepResponse>(`/cep/${cep}`).then((r) => r.data),
    enabled: cep.length === 8,
    retry: false,
  });
}

export function useRecoverRegistration() {
  return useMutation({
    mutationFn: (email: string) =>
      api
        .get<Registration>(
          `/registrations/recover?email=${encodeURIComponent(email)}`,
        )
        .then((r) => r.data),
  });
}
