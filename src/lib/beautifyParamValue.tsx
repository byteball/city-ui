import { ITokenInfo, paramName } from "@/global";
import { toLocalString } from "./toLocalString";
import appConfig from "@/appConfig";

const percentageParams: paramName[] = ["matching_probability", "referral_boost", "p2p_sale_fee", "shortcode_sale_fee", "followup_reward_share"];
const priceParams: paramName[] = ["plot_price"];
const addressParams: paramName[] = ["randomness_aa", "mayor"];

export const beautifyParamValue = (name: paramName, value: string | number, tokenInfo: ITokenInfo) => {
  if (priceParams.includes(name)) {
    return `${toLocalString(+value / 10 ** tokenInfo.decimals)} ${tokenInfo.symbol}`;
  } else if (percentageParams.includes(name)) {
    return `${toLocalString(Number(value) * 100)} %`;
  } else if (addressParams.includes(name)) {
    return <a target="_blank" className="text-link" href={`https://${appConfig.TESTNET ? 'testnet' : ''}explorer.obyte.org/address/${value}`} rel="noopener">{value}</a>
  } else if (name === "attestors") {
    return <>
      {String(value).split(":").map((attestor) => <a target="_blank" className="text-link" href={`https://${appConfig.TESTNET ? 'testnet' : ''}explorer.obyte.org/address/${attestor}`} rel="noopener">{attestor}</a>).reduce((prev, curr) => [prev, ", ", curr])}
    </>
  }

  return value;
};

