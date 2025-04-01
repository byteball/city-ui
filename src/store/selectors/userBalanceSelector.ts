import obyte from "obyte";

import { asNonNegativeNumber } from "@/lib";
import { AaStoreState } from "../aa-store";

export const userBalanceSelector = (state: AaStoreState, walletAddress?: string | null) => {
  if (!walletAddress || !state.loaded) return asNonNegativeNumber(0);
  if (!obyte.utils.isValidAddress(walletAddress)) throw new Error("Invalid address");

  return asNonNegativeNumber(+(state.state[`user_land_${walletAddress}`] ?? 0));
};

