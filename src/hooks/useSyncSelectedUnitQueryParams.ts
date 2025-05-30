import { parseAsInteger, useQueryState } from "nuqs";
import { useEffect, useState } from "react";

import { asNonNegativeNumber } from "@/lib";
import { useAaStore } from "@/store/aa-store";
import { mapUnitsSelector } from "@/store/selectors/mapUnitsSelector";
import { useSettingsStore } from "@/store/settings-store";

import appConfig from "@/appConfig";

export const useSyncSelectedUnitQueryParams = () => {
  const [inited, setInited] = useState(false);
  const loaded = useAaStore((state) => state.loaded);
  const aaState = useAaStore((state) => state);
  const selectedMapUnit = useSettingsStore((state) => state.selectedMapUnit);
  const mapUnits = mapUnitsSelector(aaState);

  const [selectedPlot, setSelectedPlot] = useQueryState<number>("plot", parseAsInteger);
  const [selectedHouse, setSelectedHouse] = useQueryState<number>("house", parseAsInteger);

  // initialization effect
  useEffect(() => {
    if (inited || !loaded) return;

    if (appConfig.TESTNET) {
      console.log("log: selectedPlot, selectedHouse", selectedPlot, selectedHouse);
    }

    let selectedUnitNum = null;
    let selectedUnitType: "plot" | "house" | null = null;

    if (selectedHouse) {
      selectedUnitNum = selectedHouse;
      selectedUnitType = "house";
      setSelectedPlot(null); // clear plot selection if house is selected
    } else if (selectedPlot) {
      selectedUnitNum = selectedPlot;
      selectedUnitType = "plot";
    } else {
      // If no plot or house is selected, clear the selected unit
      setInited(true);
      useSettingsStore.getState().setSelectedMapUnit(null);
      return; // Exit early if no selection is made
    }

    if (selectedUnitNum !== null && selectedUnitType !== null) {
      const found = mapUnits.find((unit) =>
        selectedUnitType === "plot"
          ? unit.type === "plot" && unit.plot_num === selectedUnitNum
          : unit.type === "house" && unit.house_num === selectedUnitNum
      );

      if (found) {
        useSettingsStore
          .getState()
          .setSelectedMapUnit({ num: asNonNegativeNumber(selectedUnitNum), type: selectedUnitType });
      } else {
        console.error(`Could not find ${selectedUnitType} with number`, selectedUnitNum);
      }
    }

    setInited(true);
  }, [selectedPlot, selectedHouse, loaded, inited, mapUnits]);

  // Effect to update selectedUnit when selectedMapUnit changes
  useEffect(() => {
    if (inited && loaded) {
      if (!selectedMapUnit) {
        setSelectedPlot(null);
        setSelectedHouse(null);
      } else if (selectedMapUnit.type === "house") {
        setSelectedHouse(selectedMapUnit.num);
        setSelectedPlot(null); // clear plot selection if house is selected
      } else {
        setSelectedPlot(selectedMapUnit.num);
        setSelectedHouse(null); // clear house selection if plot is selected
      }
    }
  }, [selectedMapUnit, inited, loaded, setSelectedPlot, setSelectedHouse]);
};

