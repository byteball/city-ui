import { parseAsInteger, parseAsString, useQueryState } from "nuqs";
import obyte from "obyte";
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
  const [ref, setRef] = useQueryState<string>("ref", parseAsString);

  // initialization effect
  useEffect(() => {
    if (inited || !loaded) return;

    if (appConfig.TESTNET) {
      console.log("log: selectedPlot, selectedHouse", selectedPlot, selectedHouse);
    }

    let selectedUnitNum: number | null = null;
    let selectedUnitType: "plot" | "house" | null = null;

    if (selectedHouse) {
      selectedUnitNum = selectedHouse;
      selectedUnitType = "house";
      setSelectedPlot(null); // clear plot selection if house is selected
    } else if (selectedPlot) {
      selectedUnitNum = selectedPlot;
      selectedUnitType = "plot";
    } else if (ref && obyte.utils.isValidAddress(ref)) {
      const main_plot = aaState.state[`user_main_plot_city_${ref}`] as string | undefined;

      if (main_plot) {
        selectedUnitNum = parseInt(main_plot, 10);
        selectedUnitType = "plot";
      } else {
        const anyRefPlot = mapUnits.find((unit) =>
          unit.type === "plot" && unit.owner === ref && unit.status === "land");
        if (anyRefPlot) {
          selectedUnitNum = anyRefPlot.plot_num;
          selectedUnitType = "plot";
          setRef(null); // Clear ref after using it
        } else {
          console.log("user has no main any plots", ref);
          setInited(true);
          setRef(null);
          useSettingsStore.getState().setSelectedMapUnit(null);
          return; // Exit early if no selection is made
        }
      }


    } else {
      // If no plot or house is selected, clear the selected unit
      setInited(true);
      setRef(null);
      useSettingsStore.getState().setSelectedMapUnit(null);
      return; // Exit early if no selection is made
    }

    if (selectedUnitNum !== null && selectedUnitType !== null) {
      let foundUnit = mapUnits.find((unit) =>
        selectedUnitType === "plot"
          ? unit.type === "plot" && unit.plot_num === selectedUnitNum
          : unit.type === "house" && unit.house_num === selectedUnitNum
      );

      if (!foundUnit) {
        foundUnit = mapUnits.find((unit) =>
          unit.type === "house" && unit.plot_num === selectedUnitNum
        );

        if (foundUnit && foundUnit.type === "house") {
          selectedUnitType = "house";
          selectedUnitNum = foundUnit.house_num;
        }
      }

      if (foundUnit) {
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

