export const getRequiredFee = (
  rentalFee: number,
  unusedRentalCredit: number,
  minTransactionAmount: number,
  rentalAmountSmallestUnit: number
): number => {
  const feeWithMargin = rentalFee * 1.01;
  return feeWithMargin > rentalAmountSmallestUnit
    ? feeWithMargin - unusedRentalCredit
    : Math.max(minTransactionAmount, feeWithMargin - unusedRentalCredit);
};
