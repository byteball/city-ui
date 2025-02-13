import { NonNegativeNumber } from "@/global";
import { toast } from "@/hooks/use-toast";
import { useAaStore } from "../aa-store";
import { mapUnitsSelector } from "../selectors/mapUnitsSelector";
import { setSelectedMapUnit } from "../settings-store";

export const updateSelectedMapUnit = (x: NonNegativeNumber, y: NonNegativeNumber) => {
  const mapUnits = mapUnitsSelector(useAaStore.getState());

  if (x !== null && y !== null) {
    const selectedUnits = mapUnits.filter((unit) => {
      return Number(unit.x) === Number(x) && Number(unit.y) === Number(y);
    });

    if (selectedUnits.length >= 2) {
      // house and plot: select house
      const house = selectedUnits.find((unit) => unit.type === "house");

      if (house) {
        setSelectedMapUnit(house);
      } else {
        throw new Error("It's impossible to have more than one plot in the same place");
      }
    } else if (selectedUnits.length === 1) {
      // select plot or house
      setSelectedMapUnit(selectedUnits[0]);
    } else {
      toast({ title: "No units found" });
      setSelectedMapUnit(null);
      console.log("log(init coordinates): No units found");
    }
  } else {
    toast({ title: "Invalid coordinates" });
    console.log("log(init coordinates): Invalid coordinates");
  }
};

