import { IAaStateVars } from "@/global";

import httpClient from "@/services/obyteHttpClient";
import client from "@/services/obyteWsClient";

const MAX_ITERATIONS = 100 as const; // Safety limit

export const getAllStateVarsByAddress = async (address: string) => {
  let aaState: IAaStateVars = {};
  let iteration = 0;

  try {
    let lastKey = "";

    while (true) {
      if (iteration++ > MAX_ITERATIONS) {
        throw new Error(`Reached maximum iterations (${MAX_ITERATIONS}) when fetching AA state vars`);
      }

      let chunkData: IAaStateVars = {};

      if (client) {
        chunkData = (await client.api.getAaStateVars({
          address,
          // @ts-expect-error
          var_prefix_from: lastKey,
        })) as IAaStateVars;
      } else {
        chunkData = await httpClient.getAaStateVars(address, undefined, lastKey) as IAaStateVars;
      }

      const keys = Object.keys(chunkData);

      if (keys.length > 1) {
        aaState = { ...aaState, ...chunkData };
        lastKey = keys[keys.length - 1];
      } else {
        break;
      }
    }
  } catch (e) {
    console.log("Error: ", e);
    throw new Error("Failed to load AA state vars");
  }

  return aaState;
};

