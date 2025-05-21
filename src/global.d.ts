type NonNegativeNumber = number & { __brand: "NonNegativeNumber" };
type paramName =
  | "matching_probability"
  | "plot_price"
  | "referral_boost"
  | "randomness_aa"
  | "randomness_price"
  | "p2p_sale_fee"
  | "shortcode_sale_fee"
  | "rental_surcharge_factor"
  | "followup_reward_share"
  | "attestors"
  | "mayor";

interface ICoordinates {
  x: NonNegativeNumber;
  y: NonNegativeNumber;
}

interface IUnitUniqData {
  type: "plot" | "house";
  num: NonNegativeNumber;
}

interface IMapUnitInfo {
  [key: string]: string | number | boolean | null | undefined;
  name: string;
}

/**
 * @interface IAaParams
 * @description Parameters for AA functionality
 *
 * @property {NonNegativeNumber} matching_probability - Matching probability for determining adjacent plots (must be a non-negative number).
 * @property {NonNegativeNumber} plot_price - Price for a plot (must be a non-negative number).
 * @property {NonNegativeNumber} referral_boost - Boost factor for referral sales (must be a non-negative number).
 * @property {string} randomness_aa - AA address for obtaining random numbers.
 * @property {NonNegativeNumber} randomness_price - Cost for the randomness service (must be a non-negative number).
 * @property {NonNegativeNumber} p2p_sale_fee - Fee for P2P sale (must be a non-negative number).
 * @property {NonNegativeNumber} shortcode_sale_fee - Fee for shortcode sale (must be a non-negative number).
 * @property {NonNegativeNumber} rental_surcharge_factor - Surcharge factor during rental (must be a non-negative number).
 * @property {NonNegativeNumber} followup_reward_share - Share of follow-up reward (must be a non-negative number).
 * @property {string} attestors - A string containing the addresses of attestors.
 *
 * @example
 * const params = {
 *   matching_probability: 0.8,
 *   plot_price: 150,
 *   referral_boost: 1.1,
 *   randomness_aa: 'ADDRESS_FOR_RANDOMNESS_AA',
 *   randomness_price: 10,
 *   p2p_sale_fee: 0.05,
 *   shortcode_sale_fee: 0.1,
 *   rental_surcharge_factor: 1.2,
 *   followup_reward_share: 0.5,
 *   attestors: 'attestor1,attestor2'
 * };
 */
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
  mayor: string;
}

interface IAaStateVars {
  [key: string]: object | string | NonNegativeNumber | undefined;
}

/**
 * Represents the current state of a city.
 */
interface ICityState {
  /**
   * Last assigned house number.
   */
  last_house_num: NonNegativeNumber;

  /**
   * Last assigned plot number.
   */
  last_plot_num: NonNegativeNumber;

  /**
   * Total land area.
   */
  total_land: NonNegativeNumber;
}

/**
 * @interface IPlot
 * @extends ICoordinates
 * @description Interface representing a plot in the city AA.
 *
 * @property {NonNegativeNumber} amount - The numerical amount associated with the plot (must be a non-negative number).
 * @property {NonNegativeNumber} sale_price - The sale price of the plot (must be a non-negative number).
 * @property {NonNegativeNumber} rented_amount - The amount for which the plot is rented (optional, must be a non-negative number).
 * @property {string} city - The identifier of the city where the plot is located.
 * @property {string} owner - The address of the plot's owner. If empty, it indicates a mayor plot.
 * @property {"pending" | "land"} status - The current status of the plot; either "pending" or "land".
 * @property {string} type - The type of the plot, which is "plot".
 * @property {string | IMapUnitInfo} info - Additional information about the plot.
 * @property {string} username - The username associated with the plot owner (optional).
 * @property {NonNegativeNumber} ts - The timestamp when the plot was registered (must be a non-negative number).
 * @property {NonNegativeNumber} plot_num - The plot number, used to derive the key (e.g. [`plot_${plot_num}`]) (must be a non-negative number).
 * @property {NonNegativeNumber} last_transfer_ts - The timestamp of the last transfer (optional, must be a non-negative number).
 * @property {NonNegativeNumber} last_rental_ts - The timestamp of the last rental (optional, must be a non-negative number).
 * @property {NonNegativeNumber} ref_plot_num - The reference plot number (optional, must be a non-negative number).
 * @property {NonNegativeNumber} rental_expiry_ts - The timestamp when the rental expires (optional, must be a non-negative number).
 *
 * @example
 * const plot: IPlot = {
 *   amount: 100,
 *   sale_price: 150,
 *   rented_amount: 50,
 *   city: "CityName",
 *   owner: "AFDSMFKDS...",
 *   status: "land",
 *   type: "plot",
 *   info: "Plot with a great view",
 *   username: "user123",
 *   ts: 1678901234,
 *   plot_num: 1,
 *   last_transfer_ts: 1678901235,
 *   last_rental_ts: 1678901236,
 *   ref_plot_num: 2,
 *   ref: "WVO7PWJUAIEGJM7HY25SX6UPXSTCN...",
 *   rental_expiry_ts: 1678901237,
 *   x: 1,
 *   y: 2
 * };
 */
export interface IPlot extends ICoordinates {
  amount: NonNegativeNumber;
  sale_price: NonNegativeNumber;
  city: string;
  status: "pending" | "land";
  type: "plot";
  info: string | IMapUnitInfo;
  owner?: string; // if empty - mayor plot
  username?: string;
  ts: NonNegativeNumber;
  plot_num: NonNegativeNumber; // add from key ex.: [`plot_${plot_num}`]

  last_transfer_ts?: NonNegativeNumber;
  last_rental_ts?: NonNegativeNumber;
  ref_plot_num?: NonNegativeNumber;
  ref?: string;
  rented_amount?: NonNegativeNumber;
  rental_expiry_ts?: NonNegativeNumber;
}

/**
 * @interface IHouse
 * @extends ICoordinates
 * @description Interface representing a house in the city AA.
 *
 * @property {NonNegativeNumber} amount - The amount associated with the house (must be non-negative).
 * @property {string} city - The identifier of the city where the house is located.
 * @property {string} info - Additional information about the house.
 * @property {NonNegativeNumber} plot_num - The number of the plot on which the house is built (must be non-negative).
 * @property {NonNegativeNumber} plot_ts - The timestamp when the plot was assigned (must be non-negative).
 * @property {NonNegativeNumber} ts - The timestamp when the house record was created (must be non-negative).
 *
 * @example
 * const house: IHouse = {
 *   amount: 120,
 *   city: "CityName",
 *   info: "House with beautiful garden",
 *   plot_num: 5,
 *   plot_ts: 1678901234,
 *   house_num: 1,
 *   ts: 1678901234
 *   x: 1,
 *   y: 2
 * };
 */
export interface IHouse extends ICoordinates {
  amount: NonNegativeNumber;
  city: string;
  type: "house";
  house_num: NonNegativeNumber; // add from key ex.: [`house_${house_num}`]
  info: string | IMapUnitInfo;
  owner?: string; // if empty - mayor house
  username?: string;
  plot_num: NonNegativeNumber;
  plot_ts: NonNegativeNumber;
  shortcode?: string;
  shortcode_price?: NonNegativeNumber;
  ts: NonNegativeNumber;
}

/**
 * @interface ICity
 * @description Interface representing a city in the AA system.
 *
 * @property {string} city_name - The name of the city (derived from the key).
 * @property {NonNegativeNumber} count_houses - The number of houses in the city (must be a non-negative number).
 * @property {NonNegativeNumber} count_plots - The total number of plots in the city (must be a non-negative number).
 * @property {string} mayor - The address of the city's mayor.
 * @property {NonNegativeNumber} start_ts - The timestamp when the city was created (must be a non-negative number).
 * @property {NonNegativeNumber} total_bought - The total amount spent on buying land (must be a non-negative number).
 * @property {NonNegativeNumber} total_land - The total land area in the city (must be a non-negative number).
 * @property {NonNegativeNumber} total_rented - The total area of rented land (must be a non-negative number).
 * @property {NonNegativeNumber} [matching_probability] - (Optional) Matching probability used for determining adjacent plots (must be a non-negative number).
 * @property {NonNegativeNumber} [plot_price] - (Optional) Price per plot in the city (must be a non-negative number).
 * @property {NonNegativeNumber} [referral_boost] - (Optional) Boost factor for referral sales (must be a non-negative number).
 *
 * @example
 * const city: ICity = {
 *   city_name: "SampleCity",
 *   count_houses: 10,
 *   count_plots: 50,
 *   mayor: "ABVDS...",
 *   start_ts: 1678901234,
 *   total_bought: 1000000,
 *   total_land: 2000000,
 *   total_rented: 500000
 * };
 */
export interface ICity {
  city_name: string; // from key

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

export interface IRoad extends ICoordinates {
  name: string;
  orientation: "vertical" | "horizontal";
}

/**
 * Represents a map unit which can either be a plot or a house.
 *
 * This type is useful when a function or component needs to work with either entity.
 */
export type IMapUnit = IPlot | IHouse;

export interface IRefData {
  ref?: string;
  ref_plot_num?: string | number;
}

export interface ITokenInfo {
  symbol: string;
  decimals: number;
}

export interface IGameOptions {
  displayMode?: "main" | "market" | "claim";
  params?: IAaParams;
  claimNeighborPlotNumbers?: [number, number];
  isReferral?: boolean;
}

