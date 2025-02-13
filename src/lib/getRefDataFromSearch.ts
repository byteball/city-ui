import { IRefData } from "@/global";
import obyte from "obyte";

export const getRefDataFromSearch = (search: string): IRefData => {
  const queryParams = new URLSearchParams(search);
  const refData: IRefData = {};

  const ref = queryParams.get("ref");
  const ref_plot_num = queryParams.get("ref_plot_num");

  if (ref && ref_plot_num) {
    if (obyte.utils.isValidAddress(ref)) {
      refData.ref = ref;
      refData.ref_plot_num = ref_plot_num;

      console.log("log: we use ref info", refData);
    } else {
      console.log("log: ref is not valid", ref);
    }
  }

  return refData;
};

