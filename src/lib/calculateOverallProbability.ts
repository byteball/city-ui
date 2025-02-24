import { getMapUnitProbability } from "@/aaLogic/getMapUnitProbability";
import { ICity, IMapUnit } from "@/global";

// Функция для расчёта общей вероятности, что новый участок окажется соседним хотя бы с одним из участков пользователя
export const calculateOverallProbability = (mapUnits: IMapUnit[], city: ICity, matchingProbability: number, referralBoost: number) => {
  let product = 1;
  mapUnits.forEach((mapUnit) => {
    const p = getMapUnitProbability(mapUnit, city, matchingProbability, referralBoost);
    product *= 1 - p;
  });
  return 1 - product;
};
