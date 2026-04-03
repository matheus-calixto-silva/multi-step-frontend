"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { FormInput } from "@/components/form-input";
import { SubmitButton } from "@/components/submit-button";
import { StepLayout } from "@/components/step-layout";
import { identificationSchema, type IdentificationData } from "@/schemas/identification";
import { useUpdateStep, type Registration } from "@/hooks/use-registration";
import { getApiErrorMessage, isValidationErrors } from "@/lib/errors";


interface IdentificationStepProps {
  registration: Registration;
  onMfaSent: () => void;
  onCancel?: () => void;
  isEditMode?: boolean;
}

export function IdentificationStep({
  registration,
  onMfaSent,
  onCancel,
  isEditMode,
}: IdentificationStepProps) {
  const mutation = useUpdateStep(registration.id);

  const { control, handleSubmit, setError } = useForm<IdentificationData>({
    resolver: zodResolver(identificationSchema),
    defaultValues: {
      name: registration.name ?? "",
      email: registration.email ?? "",
    },
  });

  function onSubmit(data: IdentificationData) {
    mutation.mutate(
      { step: "IDENTIFICATION", data },
      {
        onSuccess: () => onMfaSent(),
        onError: (error: unknown) => {
          const msg = getApiErrorMessage(error);
          if (msg && isValidationErrors(msg)) {
            msg.forEach((e) => {
              const field = e.property as keyof IdentificationData;
              setError(field, { message: Object.values(e.constraints)[0] });
            });
          } else {
            toast.error(typeof msg === "string" ? msg : "Erro ao enviar dados");
          }
        },
      },
    );
  }

  return (
    <StepLayout
      title={isEditMode ? "Editar identificação" : "Identificação"}
      currentStep={1}
      onBack={onCancel}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <FormInput
          name="name"
          label="Nome completo"
          control={control}
          placeholder="Seu nome"
          autoFocus
        />
        <FormInput
          name="email"
          label="E-mail"
          control={control}
          placeholder="seu@email.com"
          type="email"
          inputMode="email"
        />
        <SubmitButton isLoading={mutation.isPending}>
          {isEditMode ? "Salvar alterações" : "Continuar"}
        </SubmitButton>
      </form>
    </StepLayout>
  );
}
