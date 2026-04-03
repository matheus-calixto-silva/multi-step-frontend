"use client";

import { Pencil } from "lucide-react";
import { toast } from "sonner";
import { StepLayout } from "@/components/step-layout";
import { useCompleteRegistration } from "@/hooks/use-registration";
import type { Registration, EditableStep } from "@/hooks/use-registration";
import { formatDocument, formatPhone, formatCep } from "@/lib/formatters";

interface ReviewStepProps {
  registration: Registration;
  onEdit: (step: EditableStep) => void;
}

function ReviewField({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm text-foreground">{value ?? "—"}</span>
    </div>
  );
}

function ReviewSection({
  title,
  onEdit,
  children,
}: {
  title: string;
  onEdit: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-foreground">{title}</h2>
        <button
          type="button"
          onClick={onEdit}
          className="flex items-center gap-1 text-xs text-primary hover:underline underline-offset-4"
        >
          <Pencil className="size-3" />
          Editar
        </button>
      </div>
      {children}
    </div>
  );
}

export function ReviewStep({ registration, onEdit }: ReviewStepProps) {
  const mutation = useCompleteRegistration(registration.id);

  function handleComplete() {
    mutation.mutate(undefined, {
      onError: () => toast.error("Erro ao concluir cadastro"),
    });
  }

  const addressLine = [
    registration.street,
    registration.number,
    registration.complement,
  ]
    .filter(Boolean)
    .join(", ");

  const cityLine = [registration.neighborhood, registration.city, registration.state]
    .filter(Boolean)
    .join(", ");

  return (
    <StepLayout title="Revisão" currentStep={5}>
      <div className="flex flex-col gap-3">
        <ReviewSection title="Identificação" onEdit={() => onEdit("IDENTIFICATION")}>
          <ReviewField label="Nome" value={registration.name} />
          <ReviewField label="E-mail" value={registration.email} />
        </ReviewSection>

        <ReviewSection title="Documento" onEdit={() => onEdit("DOCUMENT")}>
          <ReviewField label="Tipo" value={registration.documentType} />
          <ReviewField
            label="Número"
            value={formatDocument(registration.document, registration.documentType)}
          />
        </ReviewSection>

        <ReviewSection title="Contato" onEdit={() => onEdit("CONTACT")}>
          <ReviewField label="Telefone" value={formatPhone(registration.phone)} />
        </ReviewSection>

        <ReviewSection title="Endereço" onEdit={() => onEdit("ADDRESS")}>
          <ReviewField label="Endereço" value={addressLine || null} />
          <ReviewField label="Bairro / Cidade / UF" value={cityLine || null} />
          <ReviewField label="CEP" value={formatCep(registration.cep)} />
        </ReviewSection>
      </div>

      <button
        type="button"
        onClick={handleComplete}
        disabled={mutation.isPending}
        className="w-full h-11 rounded-lg bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50 transition-colors hover:bg-primary/90"
      >
        {mutation.isPending ? "Concluindo..." : "Concluir cadastro"}
      </button>
    </StepLayout>
  );
}
