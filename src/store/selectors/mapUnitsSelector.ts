import obyte from "obyte";
import { createSelector } from "reselect";

import { ICoordinatesWithType, IHouse, IMapUnit, IPlot } from "@/global";
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
          amount: houseUnit.amount,
        } as IHouse;
      }

      throw new Error(`Unexpected map unit type: ${type}`);
    });
});

export const mapUnitsByCoordinatesSelector = createSelector(
  [mapUnitsSelector, (_state: AaStoreState, coordinatesWithType: ICoordinatesWithType | null) => coordinatesWithType],
  (units: IMapUnit[], coordinatesWithType) => {
    if (coordinatesWithType === null || !coordinatesWithType) return null;

    return (
      units
        .filter((unit) => unit.x === coordinatesWithType.x && unit.y === coordinatesWithType.y)
        .find((unit) => unit.type === coordinatesWithType.type) ?? null
    );
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

