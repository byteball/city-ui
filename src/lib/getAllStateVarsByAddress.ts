import { IAaStateVars } from "@/global";
import client from "@/services/obyteWsClient";

export const getAllStateVarsByAddress = async (address: string) => {
  let aaState: IAaStateVars = {};

  try {
    let lastKey = "";

    while (true) {
      let chunkData: IAaStateVars = {};

      chunkData = (await client.api.getAaStateVars({
        address,
        // @ts-ignore
        var_prefix_from: lastKey,
      })) as IAaStateVars;

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
