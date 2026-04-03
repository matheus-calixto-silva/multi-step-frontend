'use client';

import { MaskedFormInput } from '@/components/masked-form-input';
import { StepLayout } from '@/components/step-layout';
import { SubmitButton } from '@/components/submit-button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useUpdateStep, type Registration } from '@/hooks/use-registration';
import { getApiErrorMessage, isValidationErrors } from '@/lib/errors';
import {
  documentSchema,
  isValidCNPJ,
  isValidCPF,
  type DocumentData,
} from '@/schemas/document';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';

interface DocumentStepProps {
  registration: Registration;
  onCancel?: () => void;
  isEditMode?: boolean;
}

export function DocumentStep({
  registration,
  onCancel,
  isEditMode,
}: DocumentStepProps) {
  const mutation = useUpdateStep(registration.id);

  const { control, handleSubmit, setValue, setError } = useForm<DocumentData>({
    resolver: zodResolver(documentSchema),
    defaultValues: {
      documentType: registration.documentType ?? 'CPF',
      document: registration.document ?? '',
    },
    reValidateMode: 'onBlur',
  });

  const documentType = useWatch({ control, name: 'documentType' });

  function handleDocumentTypeChange(value: string) {
    setValue('documentType', value as 'CPF' | 'CNPJ');
    setValue('document', '');
  }

  function onSubmit(data: DocumentData) {
    const document = data.document.replace(/\D/g, '');

    if (data.documentType === 'CPF' && !isValidCPF(document)) {
      setError('document', { message: 'CPF inválido' });
      return;
    }
    if (data.documentType === 'CNPJ' && !isValidCNPJ(document)) {
      setError('document', { message: 'CNPJ inválido' });
      return;
    }

    mutation.mutate(
      { step: 'DOCUMENT', data: { ...data, document } },
      {
        onSuccess: () => {
          if (isEditMode && onCancel) onCancel();
        },
        onError: (error: unknown) => {
          const msg = getApiErrorMessage(error);
          if (msg && isValidationErrors(msg)) {
            msg.forEach((e) => {
              const field = e.property as keyof DocumentData;
              const errorMessage =
                e.constraints && Object.values(e.constraints).length > 0
                  ? Object.values(e.constraints)[0]
                  : 'Erro de validação no documento';

              setError(field, { message: errorMessage as string });
            });
          } else {
            toast.error(typeof msg === 'string' ? msg : 'Erro ao enviar dados');
          }
        },
      },
    );
  }

  const mask = documentType === 'CPF' ? '000.000.000-00' : '00.000.000/0000-00';

  return (
    <StepLayout
      title={isEditMode ? 'Editar documento' : 'Documento'}
      currentStep={2}
      onBack={onCancel}
    >
      <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-4'>
        <div className='flex flex-col gap-1.5'>
          <label className='text-sm font-medium text-foreground'>
            Tipo de documento
          </label>
          <RadioGroup
            value={documentType}
            onValueChange={handleDocumentTypeChange}
            className='flex gap-4'
          >
            <label className='flex items-center gap-2 cursor-pointer'>
              <RadioGroupItem value='CPF' />
              <span className='text-sm'>CPF</span>
            </label>
            <label className='flex items-center gap-2 cursor-pointer'>
              <RadioGroupItem value='CNPJ' />
              <span className='text-sm'>CNPJ</span>
            </label>
          </RadioGroup>
        </div>
        <MaskedFormInput
          key={documentType}
          name='document'
          label='Número do documento'
          control={control}
          mask={mask}
          placeholder={
            documentType === 'CPF' ? '000.000.000-00' : '00.000.000/0000-00'
          }
          inputMode='numeric'
          autoFocus
        />
        <SubmitButton isLoading={mutation.isPending}>
          {isEditMode ? 'Salvar alterações' : 'Continuar'}
        </SubmitButton>
      </form>
    </StepLayout>
  );
}
