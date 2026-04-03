"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { FormInput } from "@/components/form-input";
import { SubmitButton } from "@/components/submit-button";
import { StepLayout } from "@/components/step-layout";
import { useVerifyMfa, useResendMfa } from "@/hooks/use-registration";

const mfaSchema = z.object({
  code: z.string().length(6, 'Código deve ter 6 dígitos').regex(/^\d{6}$/, 'Somente dígitos'),
});
type MfaData = z.infer<typeof mfaSchema>;

interface MfaVerificationStepProps {
  registrationId: string;
  email: string;
  onVerified: () => void;
}

export function MfaVerificationStep({ registrationId, email, onVerified }: MfaVerificationStepProps) {
  const verifyMutation = useVerifyMfa(registrationId);
  const resendMutation = useResendMfa(registrationId);

  const { control, handleSubmit, setError } = useForm<MfaData>({
    resolver: zodResolver(mfaSchema),
    defaultValues: { code: '' },
  });

  function onSubmit(data: MfaData) {
    verifyMutation.mutate(data.code, {
      onSuccess: () => {
        onVerified();
      },
      onError: (error: unknown) => {
        const axiosError = error as { response?: { data?: { message?: unknown } } };
        const msg = axiosError.response?.data?.message;
        if (typeof msg === 'string') {
          setError('code', { message: msg });
        } else {
          toast.error('Código inválido ou expirado');
        }
      },
    });
  }

  function handleResend() {
    resendMutation.mutate(undefined, {
      onSuccess: () => toast.success('Código reenviado com sucesso'),
      onError: () => toast.error('Erro ao reenviar código'),
    });
  }

  return (
    <StepLayout title="Verifique seu e-mail" currentStep={1}>
      <p className="text-sm text-muted-foreground">
        Enviamos um código de 6 dígitos para <strong>{email}</strong>.
      </p>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <FormInput
          name="code"
          label="Código de verificação"
          control={control}
          placeholder="000000"
          type="text"
          inputMode="numeric"
          maxLength={6}
          autoComplete="one-time-code"
        />
        <SubmitButton isLoading={verifyMutation.isPending}>Verificar</SubmitButton>
      </form>
      <button
        type="button"
        onClick={handleResend}
        disabled={resendMutation.isPending}
        className="text-sm text-primary underline-offset-4 hover:underline disabled:opacity-50 self-center"
      >
        {resendMutation.isPending ? 'Reenviando...' : 'Reenviar código'}
      </button>
    </StepLayout>
  );
}
