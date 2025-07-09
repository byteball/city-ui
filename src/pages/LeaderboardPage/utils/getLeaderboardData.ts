import { IMapUnit } from "@/global";
import { groupBy } from "lodash";
import { ILeaderboardData } from "../types";

export const getLeaderboardData = (mapUnits: IMapUnit[]): ILeaderboardData => {
  const dividedUnits = groupBy(mapUnits, (unit) => unit.owner ?? "mayor");

  delete dividedUnits["mayor"]; // Remove the mayor's entry if it exists

  return Object.entries(dividedUnits).map(([address, units]) => {
    const houses = units.filter((unit) => unit.type === "house").length;
    const plots = units.filter((unit) => unit.type === "plot").length;

    return {
      address,
      houses,
      plots,
    };
  });
}
