import { useEffect, useState } from "react";

import client from "@/services/obyteWsClient";
import { useAaParams } from "@/store/aa-store";
import { useCacheStore } from "@/store/cache-store";

import appConfig from "@/appConfig";

export interface IAttestation {
  name: string;
  value: string;
  userId?: string;
}

interface IAttestationsState {
  data: IAttestation[];
  loaded: boolean;
}

const allowedAttestors = Object.entries(appConfig.ATTESTORS);

export const useAttestations = (address?: string): IAttestationsState => {
  const [attestations, setAttestations] = useState<IAttestationsState>({ data: [], loaded: false });
  const { attestors } = useAaParams();
  const { getUserAttestations, setAttestationsForAddress: saveAttestationsInCache } = useCacheStore()
  const currentCityAttestors = attestors.split(":").map((attestor) => attestor.trim());

  useEffect(() => {
    (async () => {
      if (!address) return;

      setAttestations({ data: [], loaded: false });

      const cachedAttestations = getUserAttestations(address);

      if (!cachedAttestations) {
        try {
          const attestations = await client.api.getAttestations({ address }).then((res) => res.reverse());

          if (appConfig.TESTNET) {
            console.log(`log(useAttestations): Fetched ${attestations.length} attestations for address: ${address}`);
          }

          const userAttestations: IAttestation[] = [];
          const allowedAddresses = allowedAttestors.map((v) => v[1]); // Extract once

          attestations.forEach((attestation) => {
            if (
              allowedAddresses.includes(attestation.attestor_address) &&
              currentCityAttestors.includes(attestation.attestor_address)
            ) {
              if ("username" in attestation.profile) {
                const profile = attestation.profile as { username?: string; userId?: string };
                const username = profile.username;
                const userId = profile.userId;
                const resource = allowedAttestors.find((v) => v[1] === attestation.attestor_address)?.[0];

                if (username && resource && !userAttestations.some((a) => a.name === resource)) {
                  // exclude duplicates, use the newest attestation
                  userAttestations.push({
                    name: resource,
                    value: username,
                    userId: userId ? String(userId) : undefined,
                  });
                }
              }
            }
          });

          if (userAttestations.length) {
            saveAttestationsInCache(address, userAttestations);
          }

          setAttestations({ data: userAttestations, loaded: true });
        } catch (error) {
          console.error("Error fetching attestations:", error);
          setAttestations({ data: [], loaded: true });
        }
      } else {
        setAttestations({ data: cachedAttestations, loaded: true });
      }
    })();
  }, [address, attestors]);

  return attestations;
};

