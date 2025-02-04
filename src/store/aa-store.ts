import appConfig from "@/appConfig";
import client from "@/services/obyteWsClient";
import { create, StateCreator } from "zustand";
import { devtools } from "zustand/middleware";

interface AaState {
  [key: string]: object | string | number | boolean;
}

interface AaStoreState {
  state: AaState;
  loading: boolean;
  error: string | null;
  initStore: () => Promise<void>;
}

const storeCreator: StateCreator<AaStoreState> = (set, _get) => ({
  state: {},
  loading: false,
  error: null,
  initStore: async () => {
    set({ loading: true, error: null });

    console.log("log: loading AA store");

    try {
      const aaState = (await client.api.getAaStateVars({ address: appConfig.AA_ADDRESS! })) as AaState;

      set({ state: aaState, loading: false, error: null });

      console.log("log: loaded AA store");
    } catch (err) {
      console.log("log: error loading AA store", err);
      set({ error: (err as Error).message, loading: false });
    }
  },
});

export const useAaStore = create<AaStoreState>()(devtools(storeCreator, { name: "aa-store" }));

export const initializeStore = () => useAaStore.getState().initStore();

