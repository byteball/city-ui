import { createSelector } from "reselect";

import { IHouse, IMapUnit, IPlot } from "@/global";
import { asNonNegativeNumber } from "@/lib/asNonNegativeNumber";
import { AaStoreState, ICityAaState } from "../aa-store";

const getAaState = (state: AaStoreState) => state.state;

// uniq -> type + x + y
export const mapUnitsSelector = createSelector([getAaState], (aaState: ICityAaState): IMapUnit[] => {
  console.log("selector", aaState);
  if (!aaState) return [];

  return Object.entries(aaState)
    .filter(([key, unit]) => key.startsWith("plot_") || (key.startsWith("house_") && typeof unit === "object"))
    .map(([key, unit]) => {
      const [type, idStr] = key.split("_");
      const id = asNonNegativeNumber(Number(idStr));

      const mapUnit = unit as IMapUnit;
      const unitInfo = mapUnit.info;

      if (unitInfo && typeof unitInfo === "string") {
        try {
          const infoJSON = JSON.parse(unitInfo);
          mapUnit.info = infoJSON;
        } catch {}
      }

      if (type === "plot") {
        const plotUnit = mapUnit as IPlot;
        return {
          ...plotUnit,
          type,
          plot_num: id,
        } as IPlot;
      } else if (type === "house") {
        const houseUnit = mapUnit as IHouse;

        return {
          ...houseUnit,
          type,
          house_num: id,
        } as IHouse;
      }

      throw new Error(`Unexpected map unit type: ${type}`);
    });
});

