import { groupBy } from "lodash";

import { getMatches } from "@/lib/getMatches";
import { AaStoreState } from "@/store/aa-store";
import { mapUnitsSelector } from "@/store/selectors/mapUnitsSelector";
import { ILeaderboardData } from "../types";


export const getLeaderboardData = (aaState: AaStoreState): ILeaderboardData => {
  const mapUnits = mapUnitsSelector(aaState);
  const dividedUnits = groupBy(mapUnits, (unit) => unit.owner ?? "mayor");
  const allHouses = mapUnits.filter((unit) => unit.type === "house");

  delete dividedUnits["mayor"]; // Remove the mayor's entry if it exists

  const matches = getMatches(aaState);

  return Object.entries(dividedUnits).map(([address, units]) => {
    const houses = units.filter((unit) => unit.type === "house");
    const plots = units.filter((unit) => unit.type === "plot");
    const neighbors = houses
      .map((h) => matches.get(h.plot_num))
      .filter((n) => n?.built_ts)
      .map((n) => allHouses.find((h) => n?.neighbor_plot === h.plot_num));

    const uniqNeighbors = groupBy(neighbors, "owner");

    return {
      address,
      houses: houses.length,
      plots: plots.length,
      neighbors: Object.keys(uniqNeighbors).length
    }
  });
}
