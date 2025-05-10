import { parseAsArrayOf, parseAsString, useQueryState } from "nuqs";
import { useEffect, useState } from "react";
import { useLocation } from "react-router";

import { NonNegativeNumber } from "@/global";
import { asNonNegativeNumber } from "@/lib";
import { useAaStore } from "@/store/aa-store";
import { mapUnitsSelector } from "@/store/selectors/mapUnitsSelector";
import { useSettingsStore } from "@/store/settings-store";

type TCoordinatesWithType = [NonNegativeNumber, NonNegativeNumber, "plot" | "house"];

export const useSyncCoordinates = () => {
  const location = useLocation();
  const [inited, setInited] = useState(false);
  const loaded = useAaStore((state) => state.loaded);
  const aaState = useAaStore((state) => state);
  const selectedMapUnit = useSettingsStore((state) => state.selectedMapUnit);
  const mapUnits = mapUnitsSelector(aaState);

  const [selectedCoordinate, setSelectedCoordinate] = useQueryState<TCoordinatesWithType | null>("c", {
    parse: (value) => {
      const result = parseAsArrayOf(parseAsString).parse(value);

      return result && result.length === 3 && (result[2] === "plot" || result[2] === "house")
        ? ([
            asNonNegativeNumber(Number(result[0])),
            asNonNegativeNumber(Number(result[1])),
            result[2] ?? "plot",
          ] as TCoordinatesWithType)
        : null;
    },
    clearOnDefault: true,
    defaultValue: null,
  });

  // initialization effect
  useEffect(() => {
    if (inited || !loaded) return;

    if (selectedCoordinate) {
      const [x, y, type] = selectedCoordinate;
      const found = mapUnits.find((unit) => unit.x === x && unit.y === y && unit.type === type);
      if (found) {
        useSettingsStore.getState().setSelectedMapUnit({ x, y, type });
      } else {
        console.error("Could not find map unit with coordinates", selectedCoordinate);
      }
    }

    setInited(true);
  }, [selectedCoordinate, loaded, inited, mapUnits]);

  // Effect to update selectedCoordinate when selectedMapUnit changes
  useEffect(() => {
    if (inited && loaded && selectedMapUnit) {
      if (selectedMapUnit) {
        setSelectedCoordinate([selectedMapUnit.x, selectedMapUnit.y, selectedMapUnit.type]);
      }
    }
  }, [selectedMapUnit, inited, loaded, setSelectedCoordinate]);

  useEffect(() => {
    if (inited && loaded) {
      const params = new URLSearchParams(location.search);
      if (!params.has("c")) {
        useSettingsStore.getState().setSelectedMapUnit(null);
      }
    }
  }, [location]);
};

