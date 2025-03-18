import Decimal from "decimal.js";

import { IMapUnit } from "@/global";

export function getMapUnitSize(mapUnit: IMapUnit): number;
export function getMapUnitSize(mapUnit: IMapUnit, isDecimalResult: true): Decimal;
export function getMapUnitSize(mapUnit: IMapUnit, isDecimalResult: false): number;
export function getMapUnitSize(mapUnit: IMapUnit, isDecimalResult: boolean = false) {
  const mapUnitSize = Decimal(mapUnit.amount).plus(mapUnit.type === "plot" ? mapUnit?.rented_amount || 0 : 0);
  return isDecimalResult ? mapUnitSize : mapUnitSize.toNumber();
}

