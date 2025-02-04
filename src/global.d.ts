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
  [key: string]: object | string | number;
}

