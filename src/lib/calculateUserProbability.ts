import { ICity, IPlot } from "@/global";
import { asNonNegativeNumber } from "./asNonNegativeNumber";

export const calculateUserProbability = (
  userPlots: IPlot[],
  city: ICity,
  matchingProbability: number,
  referralBoost: number
) => {
  if (!userPlots || userPlots.length === 0) return 0;

  if (matchingProbability < 0 || matchingProbability > 1 || referralBoost < 0)
    throw new Error("Invalid probability or boost parameters");

  const totalAmount = (city.total_land || asNonNegativeNumber(0)) + (city.total_rented || asNonNegativeNumber(0));

  const userTotalAmount = userPlots.reduce((acc, mapUnit) => {
    return acc + mapUnit.amount + (mapUnit.rented_amount || 0);
  }, 0);

  return (userTotalAmount / totalAmount) * matchingProbability;
};

