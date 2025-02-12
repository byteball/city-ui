import { parseAsArrayOf, parseAsInteger, useQueryState } from "nuqs";
import { useEffect } from "react";

import { NonNegativeNumber } from "@/global";
import { useAaStore } from "@/store/aa-store";
import { updateSelectedMapUnit, useSettingsStore } from "@/store/settings-store";

export const useMapUnitSelection = () => {
  const selectedMapUnit = useSettingsStore((state) => state.selectedMapUnit); // selected house or plots
  const loaded = useAaStore((state) => state.loaded);

  const [_selectedCoordinate, setSelectedCoordinate] = useQueryState<NonNegativeNumber[]>("c", {
    parse: (value) => {
      const result = parseAsArrayOf(parseAsInteger).parse(value);

      return result && result.length >= 2 ? (result as NonNegativeNumber[]) : null;
    },
  });

  useEffect(() => {
    if (loaded && selectedMapUnit?.x && selectedMapUnit?.y) {
      setSelectedCoordinate([selectedMapUnit.x, selectedMapUnit.y]);
    }
  }, [selectedMapUnit, setSelectedCoordinate, loaded]);

  return [selectedMapUnit, updateSelectedMapUnit] as const;
};

