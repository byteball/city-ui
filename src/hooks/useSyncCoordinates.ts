import { parseAsArrayOf, parseAsString, useQueryState } from "nuqs";
import { useEffect } from "react";

import { NonNegativeNumber } from "@/global";
import { asNonNegativeNumber } from "@/lib";
import { useAaStore } from "@/store/aa-store";
import { useSettingsStore } from "@/store/settings-store";

type TCoordinatesWithType = [NonNegativeNumber, NonNegativeNumber, "plot" | "house"];

export const useSyncCoordinates = () => {
  const selectedMapUnit = useSettingsStore((state) => state.selectedMapUnit); // selected house or plots
  const loaded = useAaStore((state) => state.loaded);

  const [_selectedCoordinate, setSelectedCoordinate] = useQueryState<TCoordinatesWithType>("c", {
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
    if (loaded && selectedMapUnit?.x && selectedMapUnit?.y) {
      setSelectedCoordinate([selectedMapUnit.x, selectedMapUnit.y, selectedMapUnit.type]);
    }
  }, [selectedMapUnit, setSelectedCoordinate, loaded]);
};

