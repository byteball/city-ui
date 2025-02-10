import { create, StateCreator } from "zustand";
import { devtools } from "zustand/middleware";

import { IAaParams, IAaStateVars, ICity, ICityState, IHouse, IMapUnit, IPlot } from "@/global";
import client from "@/services/obyteWsClient";

import { asNonNegativeNumber } from "@/lib/asNonNegativeNumber";

import appConfig from "@/appConfig";

const defaultAaParams: IAaParams = {
  matching_probability: asNonNegativeNumber(0.05),
  plot_price: asNonNegativeNumber(1000e9),
  referral_boost: asNonNegativeNumber(0.1),
  randomness_aa: "",
  randomness_price: asNonNegativeNumber(0.001),
  p2p_sale_fee: asNonNegativeNumber(0.01),
  shortcode_sale_fee: asNonNegativeNumber(0.01),
  rental_surcharge_factor: asNonNegativeNumber(1),
  followup_reward_share: asNonNegativeNumber(0.1),
  attestors: "",
};

interface ICityAaState extends IAaStateVars {
  variables?: IAaParams;
  constants?: {
    asset?: string;
    governance_aa?: string;
  };
  state?: ICityState;
}

interface AaStoreState {
  state: ICityAaState;
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
      const aaState = (await client.api.getAaStateVars({ address: appConfig.AA_ADDRESS })) as ICityAaState;

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

const CITY_NAME = "city";

export const useAaParams = () =>
  useAaStore((state) => {
    const city = state.state?.[`city_${CITY_NAME}`] as ICity;
    const variables = state.state?.variables;

    const matching_probability = city?.matching_probability ?? variables?.matching_probability ?? defaultAaParams.matching_probability;

    const plot_price = city?.plot_price ?? variables?.plot_price ?? defaultAaParams.plot_price;

    const referral_boost = city?.referral_boost ?? variables?.referral_boost ?? defaultAaParams.referral_boost;

    const randomness_aa = variables?.randomness_aa ?? defaultAaParams.randomness_aa;

    const randomness_price = variables?.randomness_price ?? defaultAaParams.randomness_price;

    const p2p_sale_fee = variables?.p2p_sale_fee ?? defaultAaParams.p2p_sale_fee;

    const shortcode_sale_fee = variables?.shortcode_sale_fee ?? defaultAaParams.shortcode_sale_fee;

    const rental_surcharge_factor = variables?.rental_surcharge_factor ?? defaultAaParams.rental_surcharge_factor;

    const followup_reward_share = variables?.followup_reward_share ?? defaultAaParams.followup_reward_share;

    const attestors = variables?.attestors ?? defaultAaParams.attestors;

    return {
      matching_probability,
      plot_price,
      referral_boost,
      randomness_aa,
      randomness_price,
      p2p_sale_fee,
      shortcode_sale_fee,
      rental_surcharge_factor,
      followup_reward_share,
      attestors,
    };
  });

// uniq -> type + x + y
export const mapUnitsSelector = (state: AaStoreState): IMapUnit[] => {
  const aaState = state.state;

  if (!aaState) return [];

  return Object.entries(aaState)
    .filter(([key, unit]) => key.startsWith("plot_") || (key.startsWith("house_") && typeof unit === "object"))
    .map(([key, unit]) => {
      const [type, idStr] = key.split("_");
      const id = asNonNegativeNumber(Number(idStr));

      if (type === "plot") {
        const plotUnit = unit as IPlot;
        return {
          ...plotUnit,
          type,
          plot_num: id,
        } as IPlot;
      } else if (type === "house") {
        const houseUnit = unit as IHouse;

        return {
          ...houseUnit,
          type,
          house_num: id,
        } as IHouse;
      }

      throw new Error(`Unexpected map unit type: ${type}`);
    });
};

