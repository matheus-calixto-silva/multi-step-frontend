'use client';

import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface SubmitButtonProps {
  isLoading: boolean;
  children: React.ReactNode;
  disabled?: boolean;
}

export function SubmitButton({
  isLoading,
  children,
  disabled,
}: SubmitButtonProps) {
  return (
    <Button
      type='submit'
      disabled={isLoading || disabled}
      className='w-full'
      size='lg'
    >
      {isLoading ? <Loader2 className='size-4 animate-spin' /> : children}
    </Button>
  );
}
