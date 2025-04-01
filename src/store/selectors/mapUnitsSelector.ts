import obyte from "obyte";
import { createSelector } from "reselect";

import { ICoordinates, IHouse, IMapUnit, IPlot } from "@/global";
import { asNonNegativeNumber } from "@/lib";
import { AaStoreState, ICityAaState } from "../aa-store";

const getAaState = (state: AaStoreState) => state.state;

// uniq -> type + x + y
export const mapUnitsSelector = createSelector([getAaState], (aaState: ICityAaState): IMapUnit[] => {
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
          amount: houseUnit.amount, // === 0 ? 10000000000 : houseUnit.amount, // TODO: fix it mayor created houses have 0 amount
        } as IHouse;
      }

      throw new Error(`Unexpected map unit type: ${type}`);
    });
});

export const mapUnitsByCoordinatesSelector = createSelector(
  [mapUnitsSelector, (_state: AaStoreState, coordinates: ICoordinates | null) => coordinates],
  (units: IMapUnit[], coordinates) => {
    if (coordinates === null || !coordinates) return [];
    return units.filter((unit) => unit.x === coordinates.x && unit.y === coordinates.y);
  }
);

export const mapUnitsByOwnerAddressSelector = createSelector(
  [mapUnitsSelector, (_state: AaStoreState, ownerAddress: string | null) => ownerAddress],
  (units: IMapUnit[], ownerAddress: string | null) => {
    if (!ownerAddress) return [];

    if (!obyte.utils.isValidAddress(ownerAddress)) throw new Error("Invalid address");

    return units.filter((unit) => unit.owner === ownerAddress);
  }
);

