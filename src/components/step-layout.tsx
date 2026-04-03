import { ChevronLeft } from "lucide-react";
import { StepIndicator } from "@/components/step-indicator";

interface StepLayoutProps {
  title: string;
  currentStep: number;
  totalSteps?: number;
  onBack?: () => void;
  children: React.ReactNode;
}

export function StepLayout({ title, currentStep, totalSteps = 5, onBack, children }: StepLayoutProps) {
  return (
    <div className="min-h-dvh bg-background flex flex-col px-4 py-8 justify-center">
      <div className="w-full max-w-md mx-auto flex flex-col gap-6">
        <div className="flex flex-col gap-3">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors self-start -ml-1"
            >
              <ChevronLeft className="size-4" />
              Voltar
            </button>
          )}
          <StepIndicator current={currentStep} total={totalSteps} />
          <h1 className="font-heading text-3xl font-normal text-foreground">{title}</h1>
        </div>
        {children}
      </div>
    </div>
  );
}
