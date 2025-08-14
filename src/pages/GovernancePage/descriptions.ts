import { paramName } from "@/global";

type IParamDescriptions = { [K in paramName]: string };

export const paramDescriptions: IParamDescriptions = {
  matching_probability: "The probability that a new plot immediately finds a neighbor",
  plot_price: "Price of a new plot (not including the fee)",
  referral_boost:
    "The bonus applied to the size of the referring user’s plot. It is a percentage of the total size of all plots combined.",
  randomness_aa:
    "Address of the Autonomous Agent that collects randomness from VRF oracles to determine coordinates of new plots.",
  randomness_price: "The price (as a share of plot price) paid to randomness providers for each plot.",
  p2p_sale_fee:
    "The fee charged from seller for facilitating a peer-to-peer sale of a plot of land; this fee is a percentage of the sale price.",
  shortcode_sale_fee: "The fee charged for selling shortcodes associated with houses;.",
  rental_surcharge_factor:
    "The surcharge applied to the rental fee value that is estimated to offset the additional emissions due to increased matching probability.",
  followup_reward_share: "Follow-up reward as a percentage of the initial value of a reward plot",
  attestors:
    "Attestors that verify and link user’s Obyte address to their usernames on messaging platforms such as discord and telegram. These links are then used to notify users when they get neighbors.",
  mayor:
    "Address of the mayor of the City. The mayor is responsible for creating and editing mayor houses that are used for the street/avenue grid of the City.",
  // new_city: "The address of the new city AA; this parameter is used to create a new city AA.",
};

