import { create, StateCreator } from "zustand";
import { devtools } from "zustand/middleware";
import { useShallow } from "zustand/react/shallow";

import { IAaParams, IAaStateVars, ICity, ICityState } from "@/global";
import client from "@/services/obyteWsClient";

import { asNonNegativeNumber } from "@/lib";

import appConfig from "@/appConfig";
import { getAllStateVarsByAddress } from "@/lib/getAllStateVarsByAddress";

export const defaultAaParams: IAaParams = {
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
  mayor: "",
};

export interface ICityAaState extends IAaStateVars {
  variables?: IAaParams;
  constants?: {
    asset?: string;
    governance_aa?: string;
  };
  state?: ICityState;
  city_city?: ICity;
}

export interface IGovernanceAaStateVars extends IAaStateVars {}
export interface AaStoreState {
  state: ICityAaState;
  governanceState: IGovernanceAaStateVars;
  loading: boolean;
  loaded: boolean;
  error: string | null;
  initStore: () => Promise<void>;
  updateState: (type: "main" | "governance", diff: ICityAaState) => void;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const storeCreator: StateCreator<AaStoreState> = (set, _get) => ({
  state: {},
  governanceState: {},
  loading: false,
  loaded: false,
  error: null,
  initStore: async () => {
    set({ loading: true, loaded: false, error: null });

    console.log("log: loading AA store, for address", appConfig.AA_ADDRESS);

    try {
      await client.justsaying("light/new_aa_to_watch", {
        aa: appConfig.AA_ADDRESS,
      });

      const aaState: IAaStateVars = await getAllStateVarsByAddress(appConfig.AA_ADDRESS);

      // @ts-ignore
      const governanceAa = aaState.constants?.governance_aa as string | undefined;

      if (!governanceAa) throw new Error("governance AA address not found");

      await client.justsaying("light/new_aa_to_watch", {
        aa: governanceAa,
      });

      const governanceState: IAaStateVars = await getAllStateVarsByAddress(governanceAa);

      set({ state: aaState, governanceState, loading: false, loaded: true, error: null });

      console.log("log: loaded AA store", import.meta.env.DEV ? aaState : "");
    } catch (err) {
      console.log("log: error loading AA store", err);
      set({ error: (err as Error).message, loading: false, loaded: true });
    }
  },
  updateState: (type: "main" | "governance", diff: ICityAaState) => {
    set((state) => {
      const newState = type === "main" ? { ...state.state } : { ...state.governanceState };

      for (const var_name in diff) {
        const value = diff[var_name];

        if (typeof value === "boolean" && value === false) {
          delete newState[var_name];
        } else {
          newState[var_name] = value;
        }
      }

      if (type === "main") {
        return { state: newState };
      } else {
        return { governanceState: newState };
      }
    });
  },
});

export const useAaStore = create<AaStoreState>()(devtools(storeCreator, { name: "aa-store" }));

export const initializeStore = () => useAaStore.getState().initStore();

const CITY_NAME = "city";

export const useAaParams = () =>
  useAaStore(
    useShallow((state) => {
      const city = state.state?.[`city_${CITY_NAME}`] as ICity;
      const variables = state.state?.variables;

      const matching_probability =
        city?.matching_probability ?? variables?.matching_probability ?? defaultAaParams.matching_probability;

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
        mayor: city?.mayor ?? defaultAaParams.mayor,
      };
    })
  );

