import moment from "moment";

export const getUnusedRental = (
  currentTimestamp: number,
  rentalExpiryTimestamp?: number,
  existingRentedAmount: number = 0
): { unusedRentalCredit: number; rentalExpiryFormatted: string } => {
  const secondsInYear = 365 * 24 * 3600;
  if (rentalExpiryTimestamp && currentTimestamp < rentalExpiryTimestamp) {
    const unusedRentalCredit = Math.floor(
      (existingRentedAmount * (rentalExpiryTimestamp - currentTimestamp)) / secondsInYear
    );
    const rentalExpiryFormatted = moment.unix(rentalExpiryTimestamp).format("YYYY-MM-DD HH:mm");
    return { unusedRentalCredit, rentalExpiryFormatted };
  }
  return { unusedRentalCredit: 0, rentalExpiryFormatted: "" };
};

