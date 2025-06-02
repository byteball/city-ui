import obyte from "obyte";
import { createSelector } from "reselect";

import { IHouse, IMapUnit, IPlot, IUnitUniqData } from "@/global";
import { asNonNegativeNumber } from "@/lib";
import { AaStoreState, defaultAaParams, ICityAaState } from "../aa-store";

const getAaState = (state: AaStoreState) => state.state;
// uniq -> type + x + y
export const mapUnitsSelector = createSelector([getAaState], (aaState: ICityAaState): IMapUnit[] => {
  if (!aaState) return [];

  return Object.entries(aaState)
    .filter(
      ([key, unit]) => (key.startsWith("plot_") || key.startsWith("house_")) && typeof unit === "object" && "x" in unit && "y" in unit
    )
    .map(([key, unit]) => {
      const [type, idStr] = key.split("_");
      const id = asNonNegativeNumber(Number(idStr));

      const mapUnit = unit as IMapUnit;
      const unitInfo = mapUnit.info;

      if (unitInfo && typeof unitInfo === "string") {
        try {
          const infoJSON = JSON.parse(unitInfo);
          mapUnit.info = infoJSON;
        } catch {
          console.error("Failed to parse unit info JSON", unitInfo);
        }
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
          amount: houseUnit.amount,
        } as IHouse;
      }

      throw new Error(`Unexpected map unit type: ${type}`);
    });
});

export const mapUnitsByUniqDataSelector = createSelector(
  [mapUnitsSelector, (_state: AaStoreState, uniqData: IUnitUniqData | null) => uniqData],
  (units: IMapUnit[], uniqData) => {
    if (uniqData === null || !uniqData) return null;

    return units.find((unit) =>
      uniqData.type === "plot"
        ? unit.plot_num === uniqData.num && unit.type === "plot"
        : unit.type === "house" && unit.house_num === uniqData.num
    );
  }
);

export const mapUnitsByOwnerAddressSelector = createSelector(
  [mapUnitsSelector, (state: AaStoreState, ownerAddress: string | null) => ({
    ownerAddress,
    mayor: state.state.city_city?.mayor ?? defaultAaParams.mayor
  })],
  (units: IMapUnit[], { ownerAddress, mayor }) => {
    if (!ownerAddress) return [];

    if (ownerAddress === mayor) {
      return units.filter((unit) => unit.amount === 0);
    }

    if (!obyte.utils.isValidAddress(ownerAddress)) throw new Error("Invalid address");

    return units.filter((unit) => unit.owner === ownerAddress);
  }
);

