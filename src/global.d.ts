interface IAaParams {
  matching_probability: number;
  plot_price: number;
  referral_boost: number;
  randomness_aa: string;
  randomness_price: number;
  p2p_sale_fee: number;
  shortcode_sale_fee: number;
  rental_surcharge_factor: number;
  followup_reward_share: number;
  attestors: string;
}

interface IAaStateVars {
  [key: string]: object | string | number | undefined;
}

interface ICityState {
  last_house_num: number;
  last_plot_num: number;
  total_land: number;
}

export interface IPlot {
  amount: number;
  city: string;
  owner: string;
  status: "pending" | "land";
  ts: number;
  username: string;
  x: number;
  y: number;
}

export interface IHouse {
  amount: 0;
  city: string;
  info: string;
  plot_num: number;
  plot_ts: number;
  ts: number;
  x: number;
  y: number;
}

export interface ICity {
  count_houses: number;
  count_plots: number;
  mayor: string;
  start_ts: number;
  total_bought: number;
  total_land: number;
  total_rented: number;
}

