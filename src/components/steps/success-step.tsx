import { CheckCircle } from "lucide-react";

export function SuccessStep() {
  return (
    <div className="min-h-dvh bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md flex flex-col items-center gap-6 text-center">
        <CheckCircle className="size-16 text-primary" />
        <div className="flex flex-col gap-2">
          <h1 className="font-heading text-3xl font-normal text-foreground">
            Cadastro concluído!
          </h1>
          <p className="text-sm text-muted-foreground">
            Seu cadastro foi realizado com sucesso.
          </p>
        </div>
      </div>
    </div>
  );
}
