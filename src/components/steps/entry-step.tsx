"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ChevronLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/form-input";
import { SubmitButton } from "@/components/submit-button";
import { useRecoverRegistration } from "@/hooks/use-registration";

const recoverSchema = z.object({
  email: z.string().email("E-mail inválido"),
});
type RecoverData = z.infer<typeof recoverSchema>;

interface EntryStepProps {
  onStart: () => void;
  onRecover: (id: string) => void;
  isCreating: boolean;
}

export function EntryStep({ onStart, onRecover, isCreating }: EntryStepProps) {
  const [showRecover, setShowRecover] = useState(false);
  const recoverMutation = useRecoverRegistration();

  const { control, handleSubmit } = useForm<RecoverData>({
    resolver: zodResolver(recoverSchema),
    defaultValues: { email: "" },
  });

  function onSubmit({ email }: RecoverData) {
    recoverMutation.mutate(email, {
      onSuccess: (registration) => {
        onRecover(registration.id);
      },
      onError: (error: unknown) => {
        const status = (error as { response?: { status?: number } }).response
          ?.status;
        if (status === 404) {
          toast.error(
            "Nenhum cadastro em andamento encontrado para este e-mail",
          );
        } else {
          toast.error("Erro ao buscar cadastro");
        }
      },
    });
  }

  return (
    <div className="min-h-dvh bg-background flex flex-col px-4 py-8 justify-center">
      <div className="w-full max-w-md mx-auto flex flex-col gap-6">
        {showRecover ? (
          <>
            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={() => setShowRecover(false)}
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors self-start -ml-1"
              >
                <ChevronLeft className="size-4" />
                Voltar
              </button>
              <h1 className="font-heading text-3xl font-normal text-foreground">
                Retomar cadastro
              </h1>
              <p className="text-sm text-muted-foreground">
                Digite o e-mail utilizado no início do cadastro.
              </p>
            </div>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="flex flex-col gap-4"
            >
              <FormInput
                name="email"
                label="E-mail"
                control={control}
                placeholder="seu@email.com"
                type="email"
                inputMode="email"
                autoFocus
              />
              <SubmitButton isLoading={recoverMutation.isPending}>
                Buscar cadastro
              </SubmitButton>
            </form>
          </>
        ) : (
          <>
            <div className="flex flex-col gap-3">
              <h1 className="font-heading text-3xl font-normal text-foreground">
                Cadastro
              </h1>
              <p className="text-sm text-muted-foreground">
                Preencha seus dados em etapas simples e rápidas.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <Button
                type="button"
                size="lg"
                className="w-full"
                onClick={onStart}
                disabled={isCreating}
              >
                {isCreating ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  "Iniciar cadastro"
                )}
              </Button>
              {/* <button
                type="button"
                onClick={() => setShowRecover(true)}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors underline-offset-4 hover:underline"
              >
                Já iniciou? Retomar cadastro anterior
              </button> */}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
