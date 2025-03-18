import { ICity, IMapUnit } from "@/global";
import Decimal from "decimal.js";
import { getCitySize } from "./getCitySize";
import { getMapUnitSize } from "./getMapUnitSize";

export function getMapUnitProbability(mapUnit: IMapUnit, city: ICity, matchingProbability: number, referralBoost: number): number;

export function getMapUnitProbability(
  mapUnit: IMapUnit,
  city: ICity,
  matchingProbability: number,
  referralBoost: number,
  isDecimalResult: true
): Decimal;

export function getMapUnitProbability(
  mapUnit: IMapUnit,
  city: ICity,
  matchingProbability: number,
  referralBoost: number,
  isDecimalResult: false
): number;

export function getMapUnitProbability(
  mapUnit: IMapUnit,
  city: ICity,
  matchingProbability: number,
  referralBoost: number,
  isDecimalResult = false
) {
  const citySize = getCitySize(city, true);
  const plotSize = getMapUnitSize(mapUnit, true);

  const baseFraction = plotSize.div(citySize);

  const isRef = mapUnit.type === "plot" ? mapUnit.ref_plot_num : false;

  const effectiveFraction = baseFraction.plus(isRef ? referralBoost : 0);

  const probability = effectiveFraction.mul(matchingProbability);

  return isDecimalResult ? probability : probability.toNumber();
}

