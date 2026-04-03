"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { useCreateRegistration, useRegistration } from "@/hooks/use-registration";
import { EntryStep } from "@/components/steps/entry-step";
import { IdentificationStep } from "@/components/steps/identification-step";
import { MfaVerificationStep } from "@/components/steps/mfa-verification-step";
import { DocumentStep } from "@/components/steps/document-step";
import { ContactStep } from "@/components/steps/contact-step";
import { AddressStep } from "@/components/steps/address-step";
import { ReviewStep } from "@/components/steps/review-step";
import { SuccessStep } from "@/components/steps/success-step";
import { LoadingScreen } from "@/components/loading-screen";

type EditableStep = "IDENTIFICATION" | "DOCUMENT" | "CONTACT" | "ADDRESS";

export function RegisterFlow() {
  const searchParams = useSearchParams();
  const [registrationId, setRegistrationId] = useState<string | null>(
    searchParams.get("id"),
  );
  const [awaitingMfa, setAwaitingMfa] = useState(false);
  const [editStep, setEditStep] = useState<EditableStep | null>(null);

  const createMutation = useCreateRegistration();
  const { data: registration, isLoading, isError } = useRegistration(registrationId);
  const router = useRouter();

  if (!registrationId) {
    return (
      <EntryStep
        onStart={() => {
          createMutation.mutate(undefined, {
            onSuccess: ({ id }) => {
              setRegistrationId(id);
              router.replace(`/register?id=${id}`, { scroll: false });
            },
            onError: () => toast.error("Erro ao iniciar cadastro. Tente novamente."),
          });
        }}
        onRecover={(id) => {
          setRegistrationId(id);
          router.replace(`/register?id=${id}`, { scroll: false });
        }}
        isCreating={createMutation.isPending}
      />
    );
  }

  if (isError) {
    return (
      <div className="min-h-dvh bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md flex flex-col items-center gap-4 text-center">
          <p className="text-sm text-muted-foreground">
            Cadastro não encontrado. Verifique o link ou inicie um novo cadastro.
          </p>
          <button
            type="button"
            onClick={() => {
              setRegistrationId(null);
              router.replace("/register", { scroll: false });
            }}
            className="text-sm text-primary underline-offset-4 hover:underline"
          >
            Iniciar novo cadastro
          </button>
        </div>
      </div>
    );
  }

  if (isLoading || !registration) {
    return <LoadingScreen />;
  }

  const { currentStep } = registration;

  if (currentStep === "COMPLETED") {
    return <SuccessStep />;
  }

  // Edit mode: user clicked "Editar" from the review step
  if (currentStep === "REVIEW" && editStep) {
    const cancelEdit = () => setEditStep(null);

    if (editStep === "IDENTIFICATION") {
      return (
        <IdentificationStep
          registration={registration}
          onMfaSent={() => setEditStep(null)}
          onCancel={cancelEdit}
          isEditMode
        />
      );
    }
    if (editStep === "DOCUMENT") {
      return <DocumentStep registration={registration} onCancel={cancelEdit} isEditMode />;
    }
    if (editStep === "CONTACT") {
      return <ContactStep registration={registration} onCancel={cancelEdit} isEditMode />;
    }
    if (editStep === "ADDRESS") {
      return <AddressStep registration={registration} onCancel={cancelEdit} isEditMode />;
    }
  }

  if (awaitingMfa) {
    return (
      <MfaVerificationStep
        registrationId={registration.id}
        email={registration.email ?? ""}
        onVerified={() => setAwaitingMfa(false)}
      />
    );
  }

  if (currentStep === "IDENTIFICATION") {
    return (
      <IdentificationStep
        registration={registration}
        onMfaSent={() => setAwaitingMfa(true)}
      />
    );
  }

  if (currentStep === "DOCUMENT") {
    return <DocumentStep registration={registration} />;
  }

  if (currentStep === "CONTACT") {
    return <ContactStep registration={registration} />;
  }

  if (currentStep === "ADDRESS") {
    return <AddressStep registration={registration} />;
  }

  if (currentStep === "REVIEW") {
    return (
      <ReviewStep
        registration={registration}
        onEdit={(step) => setEditStep(step as EditableStep)}
      />
    );
  }

  return <LoadingScreen />;
}
