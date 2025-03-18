import Decimal from "decimal.js";

import { ICity } from "@/global";

export function getCitySize(city: ICity): number;
export function getCitySize(city: ICity, isDecimalResult: true): Decimal;
export function getCitySize(city: ICity, isDecimalResult: false): number;
export function getCitySize(city: ICity, isDecimalResult: boolean = false) {
  if (!city || city.total_land === undefined) throw new Error("Invalid city object or missing total_land property");

  const citySize = Decimal(city.total_land).plus(city.total_rented || 0);

  return isDecimalResult ? citySize : citySize.toNumber();
}

