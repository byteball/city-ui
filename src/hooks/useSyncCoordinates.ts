import { parseAsArrayOf, parseAsString, useQueryState } from "nuqs";
import { useEffect, useState } from "react";

import { NonNegativeNumber } from "@/global";
import { asNonNegativeNumber } from "@/lib";
import { useAaStore } from "@/store/aa-store";
import { useSettingsStore } from "@/store/settings-store";

type TCoordinatesWithType = [NonNegativeNumber, NonNegativeNumber, "plot" | "house"];

export const useSyncCoordinates = () => {
  const [inited, setInited] = useState(false);
  // const selectedMapUnit = useSettingsStore((state) => state.selectedMapUnit); // selected house or plots
  const loaded = useAaStore((state) => state.loaded);
  const selectedMapUnit = useSettingsStore((state) => state.selectedMapUnit);

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
    if (inited) return;
    // console.log("<------ selectedMapUnit", loaded, selectedMapUnit);
    if (loaded) {
      if (selectedCoordinate?.length) {
        useSettingsStore.getState().setSelectedMapUnit({
          x: asNonNegativeNumber(selectedCoordinate[0]),
          y: asNonNegativeNumber(selectedCoordinate[1]),
          type: selectedCoordinate[2],
        });
      } else {
        // select from store
        // setSelectedCoordinate([selectedMapUnit.x, selectedMapUnit.y, selectedMapUnit.type]);
      }

      setInited(true);
    }
  }, [selectedCoordinate, loaded, inited]);

  useEffect(() => {
    if (inited && loaded && selectedMapUnit) {
      if (selectedMapUnit) {
        setSelectedCoordinate([selectedMapUnit.x, selectedMapUnit.y, selectedMapUnit.type]);
      }
    }
  }, [selectedMapUnit, inited, loaded]);
};

