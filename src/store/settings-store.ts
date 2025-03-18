import obyte from "obyte";
import { create, StateCreator } from "zustand";
import { devtools, persist } from "zustand/middleware";

import appConfig from "@/appConfig";
import { ICoordinates, IRefData, NonNegativeNumber } from "@/global";
import { toast } from "@/hooks/use-toast";
import client from "@/services/obyteWsClient";
import { ICityAaState } from "./aa-store";

const LOCAL_STORAGE_KEY = "settings-store";
const STORAGE_VERSION = 5; // change this to invalidate old persisted data

interface SettingsState {
  firstInit: () => void;
  inited: boolean;
  asset: string | null;
  symbol: string | null;
  decimals: number | null;
  governanceAa: string | null;
  refData: IRefData | null;
  walletAddress: string | null;
  setRefData: (refData: IRefData) => void;
  setWalletAddress: (walletAddress: string) => void;
  selectedMapUnit?: { x: NonNegativeNumber; y: NonNegativeNumber };
  setSelectedMapUnit: (coordinates?: ICoordinates | null) => void;
}

const storeCreator: StateCreator<SettingsState> = (set, get) => ({
  firstInit: async () => {
    if (get().inited) return console.log("log: already initialized settings store");
    const constantsState = (await client.api.getAaStateVars({ address: appConfig.AA_ADDRESS, var_prefix: "constants" })) as ICityAaState;

    const asset = constantsState.constants?.asset;
    const governanceAa = constantsState.constants?.governance_aa;

    if (!asset || !governanceAa) {
      toast({ variant: "destructive", title: "Failed to initialize settings store" });
      throw new Error("Failed to initialize settings store");
    }

    const tokenRegistry = client.api.getOfficialTokenRegistryAddress();
    const decimals = await client.api.getDecimalsBySymbolOrAsset(tokenRegistry, asset);
    const symbol = await client.api.getSymbolByAsset(tokenRegistry, asset);

    console.log("log: init settings store");
    set({ inited: true, asset, governanceAa, decimals: decimals || 0, symbol });
    console.log("log: initialized settings store");
  },
  inited: false,
  asset: null,
  symbol: null,
  decimals: null,
  governanceAa: null,
  refData: null,
  selectedMapUnit: undefined,
  walletAddress: null,
  setSelectedMapUnit: (coordinates) => {
    if (!coordinates) return set({ selectedMapUnit: undefined });
    set({ selectedMapUnit: { x: coordinates.x, y: coordinates.y } });
  },
  setWalletAddress: (walletAddress: string) => {
    if (!obyte.utils.isValidAddress(walletAddress)) throw new Error("Invalid wallet address");
    console.log("log: set wallet address", walletAddress);
    set({ walletAddress });
  },
  setRefData: (refData: IRefData) => set({ refData }),
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

export const setWalletAddress = (address: string): void => useSettingsStore.getState().setWalletAddress(address);

