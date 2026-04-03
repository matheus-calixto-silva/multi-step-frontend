import { isAxiosError } from "axios";

type ApiValidationError = {
    property: string;
    constraints: Record<string, string>;
};

export function getApiErrorMessage(
  error: unknown,
): string | ApiValidationError[] | null {
  if (!isAxiosError(error)) return null;
  const msg = error.response?.data?.message;
  if (!msg) return null;
  return msg as string | ApiValidationError[];
}

export function isValidationErrors(
  msg: string | ApiValidationError[],
): msg is ApiValidationError[] {
  return Array.isArray(msg);
}