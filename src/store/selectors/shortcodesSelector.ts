import { createSelector } from "reselect";
import { ICityAaState } from "../aa-store";

interface IShortCodesList {
  [shortcode: string]: string; // shortcode => address
}

export const shortcodesSelector = createSelector(
  (aaState: ICityAaState) => aaState,
  (aaState): IShortCodesList => {
    const shortcodes: IShortCodesList = {};

    Object.entries(aaState).forEach(([key, data]) => {
      if (key.startsWith("shortcode_")) {
        const [_, shortcode] = key.split("_");
        shortcodes[shortcode] = data as string;
      }
    });

    return shortcodes;
  }
);

