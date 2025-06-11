import { create, StateCreator } from "zustand";
import { devtools, persist } from "zustand/middleware";

const LOCAL_STORAGE_KEY = "cache-store";
const STORAGE_VERSION = 1; // change this to invalidate old persisted data

interface ICacheState {
  inited: boolean;
}

const storeCreator: StateCreator<ICacheState> = (set, get) => ({
  inited: false,
});

export const useCacheStore = create<ICacheState>()(
  devtools(
    persist(storeCreator, {
      partialize: (state) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { ...rest } = state;
        return rest;
      },
      name: LOCAL_STORAGE_KEY,
      version: STORAGE_VERSION,
      migrate: (persistedState, version) => {
        if (version < STORAGE_VERSION) {
          // Handle migration or reset state
          return { inited: false };
        }

        return persistedState as ICacheState;
      },
      onRehydrateStorage: () => (state) => {
        if (!state) console.error("Failed to rehydrate settings store");
      },
    }),
    { name: LOCAL_STORAGE_KEY }
  )
);
