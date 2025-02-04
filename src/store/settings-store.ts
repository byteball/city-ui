import { create, StateCreator } from "zustand";
import { devtools, persist } from "zustand/middleware";

const LOCAL_STORAGE_KEY = "settings-store";
const STORAGE_VERSION = 2; // change this to invalidate old persisted data

interface SettingsState {
  firstInit: () => void;
  inited: boolean;
}

const storeCreator: StateCreator<SettingsState> = (set, get) => ({
  firstInit: async () => {
    if (get().inited) return console.log("log: already initialized settings store");

    console.log("log: init settings store");
    set({ inited: true });
    console.log("log: initialized settings store");
  },
  inited: false,
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

