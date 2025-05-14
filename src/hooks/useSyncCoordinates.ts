import { parseAsArrayOf, parseAsString, useQueryState } from "nuqs";
import { useEffect, useState } from "react";
import { useLocation } from "react-router";

import { NonNegativeNumber } from "@/global";
import { asNonNegativeNumber } from "@/lib";
import { useAaStore } from "@/store/aa-store";
import { mapUnitsSelector } from "@/store/selectors/mapUnitsSelector";
import { useSettingsStore } from "@/store/settings-store";

type TSelectedUnitType = [NonNegativeNumber, "plot" | "house"];

export const useSyncCoordinates = () => {
  const location = useLocation();
  const [inited, setInited] = useState(false);
  const loaded = useAaStore((state) => state.loaded);
  const aaState = useAaStore((state) => state);
  const selectedMapUnit = useSettingsStore((state) => state.selectedMapUnit);
  const mapUnits = mapUnitsSelector(aaState);

  const [selectedUnit, setSelectedUnit] = useQueryState<TSelectedUnitType | null>("unit", {
    parse: (value) => {
      const result = parseAsArrayOf(parseAsString).parse(value);

      return result && result.length === 2 && (result[1] === "plot" || result[1] === "house")
        ? ([asNonNegativeNumber(Number(result[0])), result[1] ?? "plot"] as TSelectedUnitType)
        : null;
    },
    clearOnDefault: true,
    defaultValue: null,
  });

  // initialization effect
  useEffect(() => {
    if (inited || !loaded) return;

    if (selectedUnit) {
      const [num, type] = selectedUnit;
      const found = mapUnits.find((unit) =>
        type === "plot" ? unit.plot_num === num : unit.type === "house" && unit.house_num === num
      );
      if (found) {
        useSettingsStore.getState().setSelectedMapUnit({ num, type });
      } else {
        console.error("Could not find map unit with coordinates", selectedUnit);
      }
    }

    setInited(true);
  }, [selectedUnit, loaded, inited, mapUnits]);

  // Effect to update selectedCoordinate when selectedMapUnit changes
  useEffect(() => {
    if (inited && loaded && selectedMapUnit) {
      if (selectedMapUnit) {
        setSelectedUnit([selectedMapUnit.num, selectedMapUnit.type]);
      }
    }
  }, [selectedMapUnit, inited, loaded, setSelectedUnit]);

  useEffect(() => {
    if (inited && loaded) {
      const params = new URLSearchParams(location.search);
      if (!params.has("unit")) {
        useSettingsStore.getState().setSelectedMapUnit(null);
      }
    }
  }, [location]);
};

