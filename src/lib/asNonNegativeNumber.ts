import { NonNegativeNumber } from "@/global";

/**
 * Ensures a number is non-negative and returns it as a type-safe NonNegativeNumber.
 * @param value - The number to validate
 * @returns The same number as a type-safe NonNegativeNumber
 * @throws {Error} If the value is negative, NaN, or Infinity
 */
export function asNonNegativeNumber(value: number): NonNegativeNumber {
  if (!Number.isFinite(value)) {
    throw new Error(`Value must be a finite number, got: ${value}`);
  }

  if (value < 0) {
    throw new Error(`Value must be non-negative, got: ${value}`);
  }

  return value as NonNegativeNumber;
}

