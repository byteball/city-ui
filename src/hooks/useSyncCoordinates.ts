import { parseAsArrayOf, parseAsString, useQueryState } from "nuqs";
import { useEffect, useState } from "react";

import { NonNegativeNumber } from "@/global";
import { asNonNegativeNumber } from "@/lib";
import { useAaStore } from "@/store/aa-store";
import { mapUnitsSelector } from "@/store/selectors/mapUnitsSelector";
import { useSettingsStore } from "@/store/settings-store";

type TCoordinatesWithType = [NonNegativeNumber, NonNegativeNumber, "plot" | "house"];

export const useSyncCoordinates = () => {
  const [inited, setInited] = useState(false);
  const loaded = useAaStore((state) => state.loaded);
  const aaState = useAaStore((state) => state);
  const selectedMapUnit = useSettingsStore((state) => state.selectedMapUnit);
  const mapUnits = mapUnitsSelector(aaState);

  const [selectedCoordinate, setSelectedCoordinate] = useQueryState<TCoordinatesWithType>("c", {
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
  });

  useEffect(() => {
    if (inited || !selectedCoordinate) return;

    if (loaded) {
      if (mapUnits.find((unit) => unit.x === selectedMapUnit?.x && unit.y === selectedMapUnit?.y)) {
        if (selectedCoordinate?.length) {
          useSettingsStore.getState().setSelectedMapUnit({
            x: asNonNegativeNumber(selectedCoordinate[0]),
            y: asNonNegativeNumber(selectedCoordinate[1]),
            type: selectedCoordinate[2],
          });
        }
      } else {
        console.error("We could not find map unit with coordinates", selectedCoordinate);
        setSelectedCoordinate(null);
      }
      setInited(true);
    }
  }, [selectedCoordinate, loaded, inited, mapUnits]);

  useEffect(() => {
    if (inited && loaded && selectedMapUnit) {
      if (selectedMapUnit) {
        setSelectedCoordinate([selectedMapUnit.x, selectedMapUnit.y, selectedMapUnit.type]);
      }
    }
  }, [selectedMapUnit, inited, loaded]);
};

