import { getMapUnitProbability } from "@/aaLogic/getMapUnitProbability";
import { ICity, IMapUnit } from "@/global";

export const calculateOverallProbability = (
  mapUnits: IMapUnit[],
  city: ICity,
  matchingProbability: number,
  referralBoost: number
) => {
  if (!mapUnits || mapUnits.length === 0) return 0;

  if (matchingProbability < 0 || matchingProbability > 1 || referralBoost < 0)
    throw new Error("Invalid probability or boost parameters");

  const product = mapUnits.reduce((acc, mapUnit) => {
    const p = getMapUnitProbability(mapUnit, city, matchingProbability, referralBoost);
    return acc * (1 - p);
  }, 1);

  return 1 - product;
};
