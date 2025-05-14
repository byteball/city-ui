import { createSelector } from "reselect";

import { IHouse } from "@/global";
import { AaStoreState, ICityAaState } from "../aa-store";

const getAaState = (state: AaStoreState) => state.state;

export interface IShortcodeOrder {
  name: string;
  price: number;
  owner: string;
  houseNum: number;
}

export const shortcodeSellOrdersSelector = createSelector([getAaState], (aaState: ICityAaState): IShortcodeOrder[] => {
  if (!aaState) return [];

  return Object.entries(aaState)
    .filter(([houseKey, house]) => houseKey.startsWith("house_") && typeof house === "object")
    .map(([_houseKey, house]) => {
      const houseData = house as IHouse;

      if (!houseData || !houseData.shortcode || !houseData.shortcode_price) return null;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const [_, house_num] = _houseKey.split("_");

      if (!house_num) throw new Error("House number is not defined");

      return {
        name: houseData.shortcode,
        price: houseData.shortcode_price,
        owner: houseData.owner,
        houseNum: Number(house_num),
      } as IShortcodeOrder;
    })
    .filter((house) => house !== null);
});

