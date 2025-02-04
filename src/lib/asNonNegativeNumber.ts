import { NonNegativeNumber } from "@/global";

export function asNonNegativeNumber(value: number): NonNegativeNumber {
  if (value < 0) {
    throw new Error("Value must be non-negative");
  }
  return value as NonNegativeNumber;
}
