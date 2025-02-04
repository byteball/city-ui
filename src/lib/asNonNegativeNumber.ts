import { NonNegativeNumber } from "@/global";

export function asNonNegativeNumber(value: number): NonNegativeNumber {
  if (!Number.isFinite(value)) {
    throw new Error(`Value must be a finite number, got: ${value}`);
  }

  if (value < 0) {
    throw new Error(`Value must be non-negative, got: ${value}`);
  }

  return value as NonNegativeNumber;
}

