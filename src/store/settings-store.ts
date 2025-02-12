import { create, StateCreator } from "zustand";
import { devtools, persist } from "zustand/middleware";

import { ICoordinates, NonNegativeNumber } from "@/global";
import { toast } from "@/hooks/use-toast";
import { useAaStore } from "./aa-store";
import { mapUnitsSelector } from "./selectors/mapUnitsSelector";

const LOCAL_STORAGE_KEY = "settings-store";
const STORAGE_VERSION = 2; // change this to invalidate old persisted data

interface SettingsState {
  firstInit: () => void;
  inited: boolean;

  selectedMapUnit?: { x: NonNegativeNumber; y: NonNegativeNumber };
  setSelectedMapUnit: (coordinates?: ICoordinates | null) => void;
}

const storeCreator: StateCreator<SettingsState> = (set, get) => ({
  firstInit: async () => {
    if (get().inited) return console.log("log: already initialized settings store");

    console.log("log: init settings store");
    set({ inited: true });
    console.log("log: initialized settings store");
  },
  inited: false,
  selectedMapUnit: undefined,
  setSelectedMapUnit: (coordinates) => {
    if (!coordinates) return set({ selectedMapUnit: undefined });
    set({ selectedMapUnit: { x: coordinates.x, y: coordinates.y } });
  },
});

export const useSettingsStore = create<SettingsState>()(
  devtools(
    persist(storeCreator, {
      name: LOCAL_STORAGE_KEY,
      version: STORAGE_VERSION,
      migrate: (persistedState, version) => {
        if (version < STORAGE_VERSION) {
          // Handle migration or reset state
          return { inited: false };
        }

        return persistedState as SettingsState;
      },
      onRehydrateStorage: () => (state) => {
        if (!state) console.error("Failed to rehydrate settings store");
      },
    }),
    { name: LOCAL_STORAGE_KEY }
  )
);

export const initializeSettings = (): void => useSettingsStore.getState().firstInit();

export const setSelectedMapUnit = (coordinates?: ICoordinates | null): void => useSettingsStore.getState().setSelectedMapUnit(coordinates);

export const updateSelectedMapUnit = (x: NonNegativeNumber, y: NonNegativeNumber) => {
  const mapUnits = mapUnitsSelector(useAaStore.getState());

  if (x !== null && y !== null) {
    const selectedUnits = mapUnits.filter((unit) => {
      return Number(unit.x) === Number(x) && Number(unit.y) === Number(y);
    });

    if (selectedUnits.length >= 2) {
      // house and plot: select house
      const house = selectedUnits.find((unit) => unit.type === "house");

      if (house) {
        setSelectedMapUnit(house);
      } else {
        throw new Error("It's impossible to have more than one plot in the same place");
      }
    } else if (selectedUnits.length === 1) {
      // select plot or house
      setSelectedMapUnit(selectedUnits[0]);
    } else {
      toast({ title: "No units found" });
      setSelectedMapUnit(null);
      console.log("log(init coordinates): No units found");
    }
  } else {
    toast({ title: "Invalid coordinates" });
    console.log("log(init coordinates): Invalid coordinates");
  }
};

