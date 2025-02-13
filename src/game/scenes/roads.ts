import { IRoad } from "@/global";
import { asNonNegativeNumber } from "@/lib/asNonNegativeNumber";

export const exampleRoadsData: IRoad[] = [
  {
    x: asNonNegativeNumber(5000),
    y: asNonNegativeNumber(5000),
    name: "Tonych Avenue",
    orientation: "vertical",
  },
  {
    x: asNonNegativeNumber(5000),
    y: asNonNegativeNumber(5000),
    name: "Tonych Street",
    orientation: "horizontal",
  },

  {
    x: asNonNegativeNumber(6000),
    y: asNonNegativeNumber(5000),
    name: "Obyte Avenue",
    orientation: "vertical",
  },
  {
    x: asNonNegativeNumber(6000),
    y: asNonNegativeNumber(5000),
    name: "Obyte Street",
    orientation: "horizontal",
  },
  {
    x: asNonNegativeNumber(2000),
    y: asNonNegativeNumber(3000),
    name: "Taump Street",
    orientation: "horizontal",
  },
  {
    x: asNonNegativeNumber(2000),
    y: asNonNegativeNumber(3000),
    name: "Taump Avenue",
    orientation: "vertical",
  },
];

