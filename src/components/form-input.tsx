"use client";

import { useController, type Control, type FieldValues, type Path } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface FormInputProps<T extends FieldValues> {
  name: Path<T>;
  label: string;
  control: Control<T>;
  placeholder?: string;
  type?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  autoFocus?: boolean;
  disabled?: boolean;
  maxLength?: number;
  autoComplete?: string;
}

export function FormInput<T extends FieldValues>({ name, label, control, placeholder, type = "text", inputMode, autoFocus, disabled, maxLength, autoComplete }: FormInputProps<T>) {
  const { field, fieldState } = useController({ name, control });
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={name}>{label}</Label>
      <Input
        id={name}
        type={type}
        placeholder={placeholder}
        inputMode={inputMode}
        autoFocus={autoFocus}
        disabled={disabled}
        aria-invalid={!!fieldState.error}
        maxLength={maxLength}
        autoComplete={autoComplete}
        {...field}
      />
      {fieldState.error && (
        <p className="text-sm text-destructive">{fieldState.error.message}</p>
      )}
    </div>
  );
}
