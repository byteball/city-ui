import { IHouse, IPlot } from "@/global";
import { useSettingsStore } from "@/store/settings-store";

// Utility function to calculate total amount for plots
const calculateTotalAmount = (unit: IPlot | IHouse): number => {
  if (unit.type === "plot") {
    return unit.amount + (unit.rented_amount ?? 0);
  } else if (unit.type === "house") {
    return unit.amount;
  }
};

export const mapUnitsSortFunc = (a: IPlot | IHouse, b: IPlot | IHouse) => {
  if (a.type !== b.type) {
    throw new Error(`Types are not equal: cannot compare ${a.type} with ${b.type}`);
  }

  const { type: sortType, direction } = useSettingsStore.getState().mapUnitSortType[a.type];

  let first = a;
  let second = b;

  if (direction === "DESC") {
    first = b;
    second = a;
  }

  switch (sortType) {
    case "CREATED_TS":
      return first.ts - second.ts;

    case "AMOUNT":
      return first.amount - second.amount;

    case "RENTED_AMOUNT":
      if (first.type === "plot" && second.type === "plot") {
        return (first.rented_amount ?? 0) - (second.rented_amount ?? 0);
      }
      throw new Error(`Unsupported type for rented amount comparison: ${first.type}`);

    case "TOTAL_AMOUNT":
      return calculateTotalAmount(first) - calculateTotalAmount(second);

    default:
      console.error(`Unsupported sort type: ${sortType}`);
      return first.ts - second.ts;
  }
};

