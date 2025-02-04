import appConfig from "@/appConfig";
import client from "@/services/obyteWsClient";
import { create, StateCreator } from "zustand";
import { devtools } from "zustand/middleware";

const defaultAaParams: IAaParams = {
  matching_probability: 0.05,
  plot_price: 1000e9,
  referral_boost: 0.1,
  randomness_aa: "",
  randomness_price: 0.001,
  p2p_sale_fee: 0.01,
  shortcode_sale_fee: 0.01,
  rental_surcharge_factor: 1,
  followup_reward_share: 0.1,
  attestors: "",
};

interface AaStoreState {
  state: IAaStateVars;
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

    console.log("log: loading AA store, for address", appConfig.AA_ADDRESS);

    try {
      const aaState = (await client.api.getAaStateVars({ address: appConfig.AA_ADDRESS })) as AaState;

      set({ state: aaState, loading: false, error: null });

      console.log("log: loaded AA store", import.meta.env.DEV ? aaState : "");
    } catch (err) {
      console.log("log: error loading AA store", err);
      set({ error: (err as Error).message, loading: false });
    }
  },
});

export const useAaStore = create<AaStoreState>()(devtools(storeCreator, { name: "aa-store" }));

export const initializeStore = () => useAaStore.getState().initStore();

export const useAaParams = (): IAaParams => useAaStore((state) => (state.state?.variables as IAaParams) ?? defaultAaParams);

