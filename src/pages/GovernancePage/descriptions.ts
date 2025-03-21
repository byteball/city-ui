import { paramName } from "@/global";

type IParamDescriptions = { [K in paramName]: string };

export const paramDescriptions: IParamDescriptions = {
  matching_probability:
    "The probability used to determine the size of the matching square for adjacent plots; it controls how strict the matching criteria are. It must be a non-negative number.",
  plot_price:
    "The base price for a plot of land within the city AA; this integral value sets the economic benchmark for land purchases. It is used in calculations for fees and other pricing-related parameters.",
  referral_boost:
    "The bonus applied to the size of the plot when a player refers another player to the process; this bonus is a percentage of the total plot size.",
  randomness_aa:
    "The randomness factor used to determine the size of the matching square for adjacent plots; it controls how strict the matching criteria are. It must be a non-negative number.",
  randomness_price:
    "The randomness factor used to determine the price of a plot of land within the city AA; this integral value sets the economic benchmark for land purchases. It is used in calculations for fees and other pricing-related parameters.",
  p2p_sale_fee:
    "The fee charged by the city AA for facilitating a peer-to-peer sale of a plot of land; this fee is a percentage of the total sale price.",
  shortcode_sale_fee:
    "he fee imposed for selling or transferring shortcodes associated with houses; like the p2p sale fee, it is a non-negative number less than 1. This fee ensures fair compensation during shortcode transactions.",
  rental_surcharge_factor:
    "The surcharge applied to the rental fee for a plot of land within the city AA; this factor is a percentage of the total rental fee.",
  followup_reward_share:
    "The share of the follow-up reward that goes to the city AA; this percentage is a non-negative number less than 1.",
  attestors:
    "The list of attestors who validate the city AA; these attestors are responsible for ensuring the integrity of the city AA and its operations.",
  mayor: "The address of the mayor of the city AA; the mayor is responsible for managing the city AA and its operations.",
  new_city: "The address of the new city AA; this parameter is used to create a new city AA.",
};

