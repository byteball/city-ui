import { IAaParams } from "@/global";
import Decimal from "decimal.js";

interface IGetPlotPriceResult {
  price: number;
  fee: number;
  totalPrice: number;
}

export const getPlotPrice = (params: IAaParams): IGetPlotPriceResult => {
  const { plot_price: price, matching_probability, referral_boost } = params;

  const fee = Decimal(2)
    .mul(Decimal(1).plus(referral_boost))
    .mul(matching_probability)
    .div(Decimal(1).minus(Decimal(4).mul(matching_probability)))
    .toNumber();

  const totalPrice = Decimal(price).mul(Decimal(1).plus(fee)).ceil().toNumber();

  return {
    price,
    fee,
    totalPrice,
  };
};

