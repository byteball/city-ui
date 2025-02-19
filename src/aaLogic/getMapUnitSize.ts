import Decimal from "decimal.js";

import { IMapUnit } from "@/global";

export const getMapUnitSize = (mapUnit: IMapUnit) => {
  return Decimal(mapUnit.amount)
    .plus(mapUnit.type === "plot" ? mapUnit?.rented_amount || 0 : 0)
    .toNumber();
};

