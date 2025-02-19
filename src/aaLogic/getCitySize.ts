import Decimal from "decimal.js";

import { ICity } from "@/global";

export const getCitySize = (city: ICity) => {
  return Decimal(city.total_land)
    .plus(city.total_rented || 0)
    .toNumber();
};
