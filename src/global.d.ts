type NonNegativeNumber = number & { __brand: "NonNegativeNumber" };

interface IAaParams {
  matching_probability: NonNegativeNumber;
  plot_price: NonNegativeNumber;
  referral_boost: NonNegativeNumber;
  randomness_aa: string;
  randomness_price: NonNegativeNumber;
  p2p_sale_fee: NonNegativeNumber;
  shortcode_sale_fee: NonNegativeNumber;
  rental_surcharge_factor: NonNegativeNumber;
  followup_reward_share: NonNegativeNumber;
  attestors: string;
}

interface IAaStateVars {
  [key: string]: object | string | NonNegativeNumber | undefined;
}

interface ICityState {
  last_house_num: NonNegativeNumber;
  last_plot_num: NonNegativeNumber;
  total_land: NonNegativeNumber;
}

export interface IPlot {
  amount: NonNegativeNumber;
  city: string;
  owner: string;
  status: "pending" | "land";
  ts: NonNegativeNumber;
  username: string;
  x: NonNegativeNumber;
  y: NonNegativeNumber;
}

export interface IHouse {
  amount: NonNegativeNumber;
  city: string;
  info: string;
  plot_num: NonNegativeNumber;
  plot_ts: NonNegativeNumber;
  ts: NonNegativeNumber;
  x: NonNegativeNumber;
  y: NonNegativeNumber;
}

export interface ICity {
  count_houses: NonNegativeNumber;
  count_plots: NonNegativeNumber;
  mayor: string;
  start_ts: NonNegativeNumber;
  total_bought: NonNegativeNumber;
  total_land: NonNegativeNumber;
  total_rented: NonNegativeNumber;

  matching_probability?: NonNegativeNumber;
  plot_price?: NonNegativeNumber;
  referral_boost?: NonNegativeNumber;
}

