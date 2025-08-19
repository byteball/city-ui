import moment from "moment";
import obyte from "obyte";
import { create, StateCreator } from "zustand";
import { devtools, persist } from "zustand/middleware";

import { INotification, IRefData, IUnitUniqData } from "@/global";
import { toast } from "@/hooks/use-toast";

import httpClient from "@/services/obyteHttpClient";
import client from "@/services/obyteWsClient";

import { ICityAaState, useAaStore } from "./aa-store";

import appConfig from "@/appConfig";
import { mapUnitsByOwnerAddressSelector } from "./selectors/mapUnitsSelector";

const LOCAL_STORAGE_KEY = "settings-store";
const STORAGE_VERSION = 15; // change this to invalidate old persisted data
const TOKENS_REGISTRY = "O6H6ZIFI57X3PLTYHOCVYPP5A553CYFQ"; // we need it for bots 

export type SortDirectionType = "ASC" | "DESC";

export enum IPlotSortTypeEnum {
  CREATED_TS = "By created on",
  AMOUNT = "By amount",
  RENTED_AMOUNT = "By rented amount",
  TOTAL_AMOUNT = "By total (own + rented) amount",
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
  notifications: INotification[];
  addNotifications: (notifications: INotification[]) => void;
  clearNotification: (notification: INotification) => void;
  syncNotifications: () => void;
  clearAllNotifications: () => void;
  lastNotificationAddedAt: number;
  setWalletAddress: (walletAddress: string) => void;
  selectedMapUnit?: IUnitUniqData;
  selectedMarketPlot?: IUnitUniqData;
  setSelectedMapUnit: (unitUniqData: IUnitUniqData | null) => void;
  setSelectedMarketPlot: (unitUniqData: IUnitUniqData | null) => void;
  setMapUnitSortType: <T extends "house" | "plot" | "neighbor">(
    unit: T,
    sortType: T extends "plot" ? keyof typeof IPlotSortTypeEnum : keyof typeof IHouseSortTypeEnum
  ) => void;
  mapUnitSortType: {
    neighbor: {
      type: keyof typeof IHouseSortTypeEnum;
      direction: SortDirectionType;
    };
    house: {
      type: keyof typeof IHouseSortTypeEnum;
      direction: SortDirectionType;
    };
    plot: {
      type: keyof typeof IPlotSortTypeEnum;
      direction: SortDirectionType;
    };
  };
  setMapUnitSortDirection: (sortUnit: "house" | "plot" | "neighbor", direction: SortDirectionType) => void;
}

const storeCreator: StateCreator<SettingsState> = (set, get) => ({
  firstInit: async () => {
    if (get().inited) return console.log("log: already initialized settings store");
    let constantsState: ICityAaState;

    if (client) {
      constantsState = (await client.api.getAaStateVars({
        address: appConfig.AA_ADDRESS,
        var_prefix: "constants",
      })) as ICityAaState;
    } else {
      constantsState = await httpClient.getAaStateVars(appConfig.AA_ADDRESS, "constants");
    }

    const asset = constantsState.constants?.asset;
    const governanceAa = constantsState.constants?.governance_aa;

    if (!asset || !governanceAa) {
      toast({ variant: "destructive", title: "Failed to initialize settings store" });
      throw new Error("Failed to initialize settings store");
    }

    let tokenRegistry;

    if (client) {
      tokenRegistry = client.api.getOfficialTokenRegistryAddress();
    } else {
      tokenRegistry = TOKENS_REGISTRY;
    }

    let decimals, symbol, challengingPeriod;

    if (client) {
      [decimals, symbol, challengingPeriod] = await Promise.all([
        client.api.getDecimalsBySymbolOrAsset(tokenRegistry, asset).catch(() => 0),
        client.api.getSymbolByAsset(tokenRegistry, asset),
        client.api.getDefinition(governanceAa).then((def) => def[1]?.params?.challenging_period || 3 * 24 * 3600),
      ]);
    } else {
      // for search bots only
      [decimals, symbol, challengingPeriod] = [
        9,
        "CITY",
        3 * 24 * 3600
      ];
    }


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
    neighbor: {
      type: "CREATED_TS",
      direction: "DESC",
    },
  },
  notifications: [],
  lastNotificationAddedAt: moment.utc().unix(),
  addNotifications: (notifications: INotification[]) => {
    set((state) => ({
      notifications: [...state.notifications, ...notifications],
      lastNotificationAddedAt: moment.utc().unix(),
    }));
  },
  clearNotification: (notification: INotification) => {
    set((state) => ({
      notifications: state.notifications.filter((n) => n.ts !== notification.ts),
      lastNotificationAddedAt: moment.utc().unix()
    }));
  },
  clearAllNotifications: () => {
    set({ notifications: [], lastNotificationAddedAt: moment.utc().unix() });
  },
  syncNotifications: () => {
    const walletAddress = get().walletAddress;
    const lastNotificationAddedAt = get().lastNotificationAddedAt;
    const notifications = get().notifications;

    if (!walletAddress) {
      console.log("log: syncNotifications called without wallet address");
      return;
    }

    const state = useAaStore.getState();

    const userUnits = mapUnitsByOwnerAddressSelector(state, walletAddress);

    const newUnits = userUnits.filter((unit) => unit.ts > lastNotificationAddedAt);

    const newNotifications: INotification[] = newUnits.map((u) => ({
      ts: u.ts,
      type: `new_${u.type}`,
      unitNumber: u.type === "plot" ? u.plot_num : u.house_num,
    }));

    set({ notifications: [...notifications, ...newNotifications], lastNotificationAddedAt: moment.utc().unix() });
  },
  setSelectedMapUnit: (unitUniqData) => {
    if (!unitUniqData) return set({ selectedMapUnit: undefined });
    set({ selectedMapUnit: unitUniqData });
  },
  setSelectedMarketPlot: (unitUniqData) => {
    if (!unitUniqData) return set({ selectedMarketPlot: undefined });
    if (unitUniqData.type !== "plot") throw new Error("Invalid type for market plot");

    set({ selectedMarketPlot: unitUniqData });
  },
  setWalletAddress: (walletAddress: string) => {
    if (!obyte.utils.isValidAddress(walletAddress)) throw new Error("Invalid wallet address");
    console.log("log: set wallet address", walletAddress);

    set({
      walletAddress,
      notifications: [],
      lastNotificationAddedAt: moment.utc().unix(),
    });
  },
  setMapUnitSortType: <T extends "house" | "plot" | "neighbor">(
    unit: T,
    sortType: T extends "plot" ? keyof typeof IPlotSortTypeEnum : keyof typeof IHouseSortTypeEnum
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
  setMapUnitSortDirection: (sortUnit: "house" | "plot" | "neighbor", direction: SortDirectionType) => {
    set((state) => ({
      mapUnitSortType: {
        ...state.mapUnitSortType,
        [sortUnit]: {
          type: state.mapUnitSortType[sortUnit].type,
          direction,
        },
      },
    }));
  },
});

export const useSettingsStore = create<SettingsState>()(
  devtools(
    persist(storeCreator, {
      partialize: (state) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { selectedMapUnit, selectedMarketPlot, ...rest } = state;
        return rest;
      },
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

export const setSelectedMapUnit = (unitUniqData: IUnitUniqData): void =>
  useSettingsStore.getState().setSelectedMapUnit(unitUniqData);

export const setWalletAddress = (address: string): void => useSettingsStore.getState().setWalletAddress(address);

export const setMapUnitSortType = (
  sortUnit: "house" | "plot" | "neighbor",
  sortType: keyof typeof IHouseSortTypeEnum | keyof typeof IPlotSortTypeEnum
): void => useSettingsStore.getState().setMapUnitSortType(sortUnit, sortType);

export const setMapUnitSortDirection = (sortUnit: "house" | "plot" | "neighbor", direction: SortDirectionType): void =>
  useSettingsStore.getState().setMapUnitSortDirection(sortUnit, direction);

export const addNotifications = (notifications: INotification[]): void => useSettingsStore.getState().addNotifications(notifications);

export const clearNotification = (notification: INotification): void =>
  useSettingsStore.getState().clearNotification(notification);

export const clearAllNotifications = (): void => useSettingsStore.getState().clearAllNotifications();

export const syncNotifications = (): void => useSettingsStore.getState().syncNotifications();