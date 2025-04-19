import obyte from "obyte";
import { create, StateCreator } from "zustand";
import { devtools, persist } from "zustand/middleware";

import appConfig from "@/appConfig";
import { ICoordinatesWithType, IMapUnit, IRefData } from "@/global";
import { toast } from "@/hooks/use-toast";
import client from "@/services/obyteWsClient";
import { ICityAaState } from "./aa-store";

const LOCAL_STORAGE_KEY = "settings-store";
const STORAGE_VERSION = 12; // change this to invalidate old persisted data

export type SortDirectionType = "ASC" | "DESC";

export enum IPlotSortTypeEnum {
  CREATED_TS = "By created on",
  AMOUNT = "By amount",
  RENTED_AMOUNT = "By rented amount",
  TOTAL_AMOUNT = "By plot size",
}

export enum IHouseSortTypeEnum {
  CREATED_TS = "By created on",
  AMOUNT = "By amount",
}

interface SettingsState {
  firstInit: () => void;
  inited: boolean;
  asset: string | null;
  symbol: string | null;
  decimals: number | null;
  challengingPeriod: number | null;
  governanceAa: string | null;
  refData: IRefData | null;
  walletAddress: string | null;
  setRefData: (refData: IRefData) => void;
  setWalletAddress: (walletAddress: string) => void;
  selectedMapUnit?: ICoordinatesWithType;
  selectedMarketPlot?: ICoordinatesWithType;
  setSelectedMapUnit: (coordinatesWithType: ICoordinatesWithType) => void;
  setSelectedMarketPlot: (coordinatesWithType: ICoordinatesWithType) => void;
  setMapUnitSortType: <T extends "house" | "plot">(
    unit: T,
    sortType: T extends "house" ? keyof typeof IHouseSortTypeEnum : keyof typeof IPlotSortTypeEnum
  ) => void;
  mapUnitSortType: {
    house: {
      type: keyof typeof IHouseSortTypeEnum;
      direction: SortDirectionType;
    };
    plot: {
      type: keyof typeof IPlotSortTypeEnum;
      direction: SortDirectionType;
    };
  };
  setMapUnitSortDirection: (unit: IMapUnit["type"], direction: SortDirectionType) => void;
}

const storeCreator: StateCreator<SettingsState> = (set, get) => ({
  firstInit: async () => {
    if (get().inited) return console.log("log: already initialized settings store");
    const constantsState = (await client.api.getAaStateVars({
      address: appConfig.AA_ADDRESS,
      var_prefix: "constants",
    })) as ICityAaState;

    const asset = constantsState.constants?.asset;
    const governanceAa = constantsState.constants?.governance_aa;

    if (!asset || !governanceAa) {
      toast({ variant: "destructive", title: "Failed to initialize settings store" });
      throw new Error("Failed to initialize settings store");
    }

    const tokenRegistry = client.api.getOfficialTokenRegistryAddress();

    const [decimals, symbol, challengingPeriod] = await Promise.all([
      client.api.getDecimalsBySymbolOrAsset(tokenRegistry, asset),
      client.api.getSymbolByAsset(tokenRegistry, asset),
      client.api.getDefinition(governanceAa).then((def) => def[1]?.params?.challenging_period || 3 * 24 * 3600),
    ]);

    set({ inited: true, asset, governanceAa, decimals: decimals || 0, symbol, challengingPeriod });
    console.log("log: initialized settings store");
  },
  inited: false,
  asset: null,
  symbol: null,
  decimals: null,
  challengingPeriod: null,
  governanceAa: null,
  refData: null,
  selectedMapUnit: undefined,
  selectedMarketPlot: undefined,
  walletAddress: null,
  mapUnitSortType: {
    house: {
      type: "CREATED_TS",
      direction: "DESC",
    },
    plot: {
      type: "CREATED_TS",
      direction: "DESC",
    },
  },
  setSelectedMapUnit: (coordinatesWithType) => {
    if (!coordinatesWithType) return set({ selectedMapUnit: undefined });
    set({ selectedMapUnit: { x: coordinatesWithType.x, y: coordinatesWithType.y, type: coordinatesWithType.type } });
  },
  setSelectedMarketPlot: (coordinatesWithType) => {
    if (!coordinatesWithType) return set({ selectedMarketPlot: undefined });
    if (coordinatesWithType.type !== "plot") throw new Error("Invalid type for market plot");
    set({ selectedMarketPlot: { x: coordinatesWithType.x, y: coordinatesWithType.y, type: coordinatesWithType.type } });
  },
  setWalletAddress: (walletAddress: string) => {
    if (!obyte.utils.isValidAddress(walletAddress)) throw new Error("Invalid wallet address");
    console.log("log: set wallet address", walletAddress);
    set({ walletAddress });
  },
  setRefData: (refData: IRefData) => set({ refData }),
  setMapUnitSortType: <T extends "house" | "plot">(
    unit: T,
    sortType: T extends "house" ? keyof typeof IHouseSortTypeEnum : keyof typeof IPlotSortTypeEnum
  ) => {
    set((state) => ({
      mapUnitSortType: {
        ...state.mapUnitSortType,
        [unit]: {
          type: sortType,
          direction: state.mapUnitSortType[unit].direction,
        },
      },
    }));
  },
  setMapUnitSortDirection: (unit: IMapUnit["type"], direction: SortDirectionType) => {
    set((state) => ({
      mapUnitSortType: {
        ...state.mapUnitSortType,
        [unit]: {
          type: state.mapUnitSortType[unit].type,
          direction,
        },
      },
    }));
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

export const setSelectedMapUnit = (coordinates: ICoordinatesWithType): void =>
  useSettingsStore.getState().setSelectedMapUnit(coordinates);

export const setWalletAddress = (address: string): void => useSettingsStore.getState().setWalletAddress(address);

export const setMapUnitSortType = (
  unit: IMapUnit["type"],
  sortType: keyof typeof IHouseSortTypeEnum | keyof typeof IPlotSortTypeEnum
): void => useSettingsStore.getState().setMapUnitSortType(unit, sortType);

export const setMapUnitSortDirection = (unit: IMapUnit["type"], direction: SortDirectionType): void =>
  useSettingsStore.getState().setMapUnitSortDirection(unit, direction);

