"use client";

import { IMaskInput } from "react-imask";
import { useController, type Control, type FieldValues, type Path } from "react-hook-form";
import { cn } from "@/lib/utils";
import { Label } from "./ui/label";

interface MaskedFormInputProps<T extends FieldValues> {
  name: Path<T>;
  label: string;
  control: Control<T>;
  mask: string;
  placeholder?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  autoFocus?: boolean;
  disabled?: boolean;
}

export function MaskedFormInput<T extends FieldValues>({ name, label, control, mask, placeholder, inputMode, autoFocus, disabled }: MaskedFormInputProps<T>) {
  const { field, fieldState } = useController({ name, control });
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={name}>{label}</Label>
      <IMaskInput
        id={name}
        mask={mask}
        value={field.value}
        onAccept={(value) => field.onChange(value)}
        onBlur={field.onBlur}
        inputRef={field.ref}
        disabled={disabled}
        placeholder={placeholder}
        inputMode={inputMode}
        autoFocus={autoFocus}
        aria-invalid={!!fieldState.error}
        className={cn(
          "h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 md:text-sm",
          fieldState.error && "border-destructive"
        )}
      />
      {fieldState.error && (
        <p className="text-sm text-destructive">{fieldState.error.message}</p>
      )}
    </div>
  );
}
