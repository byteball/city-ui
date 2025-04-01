import { ITokenInfo, paramName } from "@/global";
import { getExplorerUrl } from "./getExplorerUrl";
import { toLocalString } from "./toLocalString";
import { percentInputParamNames } from "./validateParam";

const priceParams: paramName[] = ["plot_price"];
const addressParams: paramName[] = ["randomness_aa", "mayor"];

export const beautifyParamValue = (name: paramName, value: string | number, tokenInfo: ITokenInfo) => {
  if (value === undefined || value === null) {
    return "N/A";
  } else if (priceParams.includes(name)) {
    return `${toLocalString(+value / 10 ** tokenInfo.decimals)} ${tokenInfo.symbol}`;
  } else if (percentInputParamNames.includes(name)) {
    return `${toLocalString(Number(value) * 100)} %`;
  } else if (addressParams.includes(name)) {
    return (
      <a target="_blank" className="text-link" href={getExplorerUrl(String(value), "address")} rel="noopener">
        {String(value).slice(0, 5)}...{String(value).slice(-5, String(value).length)}
      </a>
    );
  } else if (name === "attestors") {
    return (
      <>
        {String(value)
          .split(":")
          .map((attestor) => (
            <a target="_blank" key={attestor} className="text-link" href={getExplorerUrl(attestor, "address")} rel="noopener">
              {attestor.slice(0, 5)}...{attestor.slice(-5, attestor.length)}
            </a>
          ))
          .reduce((prev, curr) => [prev, ", ", curr])}
      </>
    );
  }

  return value;
};

