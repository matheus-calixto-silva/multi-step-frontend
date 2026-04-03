"use client";

import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { FormInput } from "@/components/form-input";
import { MaskedFormInput } from "@/components/masked-form-input";
import { SubmitButton } from "@/components/submit-button";
import { StepLayout } from "@/components/step-layout";
import { addressSchema, type AddressData } from "@/schemas/address";
import { useUpdateStep, useCepLookup } from "@/hooks/use-registration";
import type { Registration } from "@/hooks/use-registration";
import { getApiErrorMessage, isValidationErrors } from "@/lib/errors";

interface AddressStepProps {
  registration: Registration;
  onCancel?: () => void;
  isEditMode?: boolean;
}

export function AddressStep({ registration, onCancel, isEditMode }: AddressStepProps) {
  const mutation = useUpdateStep(registration.id);

  const { control, handleSubmit, setValue, setError } = useForm<AddressData>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      cep: registration.cep ?? "",
      street: registration.street ?? "",
      number: registration.number ?? "",
      complement: registration.complement ?? "",
      neighborhood: registration.neighborhood ?? "",
      city: registration.city ?? "",
      state: registration.state ?? "",
    },
  });

  const cepValue = useWatch({ control, name: "cep" });
  const rawCep = cepValue?.replace(/\D/g, "") ?? "";

  const { data: cepData, isFetching: isCepLoading, isError: isCepError } = useCepLookup(rawCep);

  useEffect(() => {
    if (cepData) {
      setValue("street", cepData.street, { shouldValidate: true });
      setValue("neighborhood", cepData.neighborhood, { shouldValidate: true });
      setValue("city", cepData.city, { shouldValidate: true });
      setValue("state", cepData.state, { shouldValidate: true });
    }
  }, [cepData, setValue]);

  function onSubmit(data: AddressData) {
    const rawCepClean = data.cep.replace(/\D/g, "");
    mutation.mutate(
      { step: "ADDRESS", data: { ...data, cep: rawCepClean } },
      {
        onSuccess: () => { if (isEditMode && onCancel) onCancel(); },
        onError: (error: unknown) => {
          const msg = getApiErrorMessage(error);
          if (msg && isValidationErrors(msg)) {
            msg.forEach((e) => {
              const field = e.property as keyof AddressData;
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
      title={isEditMode ? "Editar endereço" : "Endereço"}
      currentStep={4}
      onBack={onCancel}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <MaskedFormInput
          name="cep"
          label="CEP"
          control={control}
          mask="00000-000"
          placeholder="00000-000"
          inputMode="numeric"
          autoFocus
        />
        {isCepLoading && rawCep.length === 8 && (
          <p className="text-xs text-muted-foreground">Buscando endereço...</p>
        )}
        {isCepError && rawCep.length === 8 && (
          <p className="text-xs text-destructive">CEP não encontrado. Preencha o endereço manualmente.</p>
        )}
        <FormInput name="street" label="Rua" control={control} placeholder="Nome da rua" />
        <div className="grid grid-cols-2 gap-3">
          <FormInput
            name="number"
            label="Número"
            control={control}
            placeholder="123"
            inputMode="numeric"
          />
          <FormInput
            name="complement"
            label="Complemento"
            control={control}
            placeholder="Apto 4"
          />
        </div>
        <FormInput
          name="neighborhood"
          label="Bairro"
          control={control}
          placeholder="Nome do bairro"
        />
        <div className="grid grid-cols-2 gap-3">
          <FormInput name="city" label="Cidade" control={control} placeholder="Cidade" />
          <FormInput name="state" label="Estado (UF)" control={control} placeholder="SP" />
        </div>
        <SubmitButton isLoading={mutation.isPending}>
          {isEditMode ? "Salvar alterações" : "Continuar"}
        </SubmitButton>
      </form>
    </StepLayout>
  );
}
