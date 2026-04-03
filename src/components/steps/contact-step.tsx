"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { MaskedFormInput } from "@/components/masked-form-input";
import { SubmitButton } from "@/components/submit-button";
import { StepLayout } from "@/components/step-layout";
import { contactSchema, type ContactData } from "@/schemas/contact";
import { useUpdateStep, type Registration } from "@/hooks/use-registration";
import { getApiErrorMessage, isValidationErrors } from "@/lib/errors";

interface ContactStepProps {
  registration: Registration;
  onCancel?: () => void;
  isEditMode?: boolean;
}

export function ContactStep({ registration, onCancel, isEditMode }: ContactStepProps) {
  const mutation = useUpdateStep(registration.id);

  const { control, handleSubmit, setError } = useForm<ContactData>({
    resolver: zodResolver(contactSchema),
    defaultValues: { phone: registration.phone ?? "" },
  });

  function onSubmit(data: ContactData) {
    const phone = data.phone.replace(/\D/g, "");
    mutation.mutate(
      { step: "CONTACT", data: { phone } },
      {
        onSuccess: () => { if (isEditMode && onCancel) onCancel(); },
        onError: (error: unknown) => {
          const msg = getApiErrorMessage(error);
          if (msg && isValidationErrors(msg)) {
            msg.forEach((e) => {
              const field = e.property as keyof ContactData;
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
      title={isEditMode ? "Editar contato" : "Contato"}
      currentStep={3}
      onBack={onCancel}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <MaskedFormInput
          name="phone"
          label="Telefone celular"
          control={control}
          mask="(00) 00000-0000"
          placeholder="(11) 99999-9999"
          inputMode="tel"
          autoFocus
        />
        <SubmitButton isLoading={mutation.isPending}>
          {isEditMode ? "Salvar alterações" : "Continuar"}
        </SubmitButton>
      </form>
    </StepLayout>
  );
}
