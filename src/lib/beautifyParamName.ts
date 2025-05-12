import { paramName } from "@/global";

export const beautifyParamName = (name: paramName): string => {
  if (name === "p2p_sale_fee") return "P2P sale fee";
  if (name === "randomness_aa") return "Randomness AA";

  return name
    .split("_")
    .map((word, i) => (i !== 0 ? word : word.charAt(0).toUpperCase() + word.slice(1)))
    .join(" ");
};

