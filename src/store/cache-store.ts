import obyte from "obyte";
import { create, StateCreator } from "zustand";
import { devtools, persist } from "zustand/middleware";

import appConfig from "@/appConfig";
import { IAttestation } from '@/hooks/useAttestations';

const LOCAL_STORAGE_KEY = "cache-store";
const STORAGE_VERSION = 1; // change this to invalidate old persisted data

const ATTESTATION_SHORT_CACHE_LIFETIME = 30 * 60 * 1000; // 30 minutes
const ATTESTATION_LONG_CACHE_LIFETIME = 24 * 60 * 60 * 1000; // 24 hours

interface ICacheState {
  inited: boolean;
  attestations: {
    [address: string]: {
      ts: number;
      attestations: IAttestation[];
    }
  };
  setAttestationsForAddress: (address: string, attestations: IAttestation[]) => void;
  getUserAttestations: (address: string) => IAttestation[] | null;
  saveDisplayName: (address: string, attestationName: string, displayName: string) => void;
}

const storeCreator: StateCreator<ICacheState> = (set, get) => ({
  inited: false,
  attestations: {},
  setAttestationsForAddress: (address, attestations) => {
    if (!obyte.utils.isValidAddress(address) || !Array.isArray(attestations)) {
      throw new Error("Invalid address or attestations");
    }

    set((state) => ({
      attestations: {
        ...state.attestations,
        [address]: {
          ts: Date.now(),
          attestations
        }
      }
    }));
  },
  saveDisplayName: (address: string, attestationName: string, displayName: string) => {
    if (!address || !obyte.utils.isValidAddress(address) || typeof attestationName !== "string") {
      throw new Error("Invalid address or name");
    }

    const userAttestations = get().getUserAttestations(address);
    const currentAttestationId = userAttestations?.findIndex(a => a.name === attestationName) ?? -1;

    if (userAttestations && displayName && currentAttestationId >= 0) {

      userAttestations[currentAttestationId].displayName = displayName;

      set((state) => ({
        attestations: {
          ...state.attestations,
          [address]: {
            attestations: userAttestations,
            ts: state.attestations[address].ts
          }
        }
      }));
    }
  },
  getUserAttestations: (address: string | null) => {
    if (!address) return null;

    if (!obyte.utils.isValidAddress(address)) {
      console.error("log(getUserAttestations): Invalid address provided:", address);
      return null;
    }

    const entry = get().attestations[address];

    if (!entry) {
      if (appConfig.TESTNET) {
        console.log(`log(getUserAttestations): No cached attestations found for address: ${address}`);
      }

      return null;
    }

    let isExpired = true;

    const hasDiscord = entry.attestations.find(a => a.name === 'discord') !== undefined;
    const hasTelegram = entry.attestations.find(a => a.name === 'telegram') !== undefined;

    if (!hasDiscord || !hasTelegram) {
      isExpired = Date.now() - (entry?.ts || 0) >= ATTESTATION_SHORT_CACHE_LIFETIME;
    } else {
      isExpired = Date.now() - (entry?.ts || 0) >= ATTESTATION_LONG_CACHE_LIFETIME;
    }

    if (appConfig.TESTNET) {
      if (isExpired) {
        console.log(`log(getUserAttestations): Attestations for address ${address} are expired and will not be returned.`);
      } else {
        console.log(`log(getUserAttestations): we use cached attestations for address: ${address}`);
      }
    }

    return !isExpired ? entry.attestations : null;
  }
});

export const useCacheStore = create<ICacheState>()(
  devtools(
    persist(storeCreator, {
      partialize: (state) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { inited, ...rest } = state;
        return rest;
      },
      name: LOCAL_STORAGE_KEY,
      version: STORAGE_VERSION,
      migrate: (persistedState, version) => {
        if (version < STORAGE_VERSION) {
          // Handle migration or reset state
          return {
            inited: false,
            attestations: {}
          } as ICacheState;
        }

        return persistedState as ICacheState;
      },
      onRehydrateStorage: () => (state) => {
        if (!state) return console.error("Failed to rehydrate settings store");

        state.inited = true; // Set inited to true after rehydration
      },
    }),
    { name: LOCAL_STORAGE_KEY }
  )
);
