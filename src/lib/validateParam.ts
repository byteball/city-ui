import obyte from "obyte";

import { paramName } from "@/global";

export const percentInputParamNames = [
  "matching_probability",
  "referral_boost",
  "shortcode_sale_fee",
  "p2p_sale_fee",
  "followup_reward_share",
  "randomness_price"
];

export const numericInputParamNames = ["rental_surcharge_factor", "plot_price", "randomness_price"];

export const validateParam: (name: paramName, value: string | number) => [boolean, string] = (name, value) => {
  if (percentInputParamNames.includes(name)) {
    if (Number(value) < 0) return [false, "number"];
    if (name === "matching_probability" && Number(value) >= 25) return [false, "must be less than 25%"];
    if (["randomness_price", "p2p_sale_fee", "shortcode_sale_fee", "followup_reward_share"].includes(name) && Number(value) >= 100)
      return [false, "must be less than 100%"];
  } else if (numericInputParamNames.includes(name)) {
    if (name === "rental_surcharge_factor" && Number(value) < 1) return [false, "must be more than 0"];
  } else if (name === "randomness_aa" || name === "mayor") {
    // addresses
    if (!obyte.utils.isValidAddress(String(value))) return [false, "must be a valid address"];
  } else if (name === "attestors") {
    // addresses
    const addresses = String(value).split(":");
    if (addresses.length > 10) return [false, "must be less than 10 addresses"];

    for (const address of addresses) {
      if (!obyte.utils.isValidAddress(address.trim())) return [false, "must be a valid address"];
    }
  }

  return [true, ""];
};

