import { FC } from "react";
import { Link } from "react-router";

import { useAaStore } from "@/store/aa-store";
import { mapUnitsByOwnerAddressSelector, mapUnitsSelector } from "@/store/selectors/mapUnitsSelector";
import { useSettingsStore } from "@/store/settings-store";

import { getRoads } from "@/engine/utils/getRoads";
import { ICity, INotification } from "@/global";
import { asNonNegativeNumber, getAddressFromNearestRoad } from "@/lib";

export const NotificationText: FC<INotification> = ({ type, unitNumber }) => {
  const walletAddress = useSettingsStore((state) => state.walletAddress);
  const aaState = useAaStore((state) => state);
  const mapUnits = mapUnitsSelector(aaState);
  const userUnits = useAaStore((state) => mapUnitsByOwnerAddressSelector(state, walletAddress));

  const changeMapUnit = () => {
    if (unitNumber) {
      useSettingsStore.getState().setSelectedMapUnit({ num: asNonNegativeNumber(unitNumber), type: type === "new_plot" ? "plot" : "house" });
    }
  }

  switch (type) {
    case "new_plot":
    case "new_house": {
      if (!walletAddress) return null; // Don't show notifications if wallet is not set
      const unitType = type === "new_plot" ? "plot" : "house";

      const cityStats = aaState.state.city_city as ICity;
      const roads = getRoads(mapUnits, String(cityStats?.mayor))
      const unit = userUnits.find((u) => u.type === unitType && u.plot_num === unitNumber);

      let address = "Unknown address";

      if (unit && roads.length > 0) {
        [address] = getAddressFromNearestRoad(
          roads,
          {
            x: unit.x,
            y: unit.y,
          },
          unit?.type === "house" ? unit?.house_num ?? 0 : unit?.plot_num ?? 0
        )
      }

      return (
        <div>
          You've got a new {unitType} - <Link to={`/?${unitType}=${unitNumber}`} onClick={changeMapUnit} className="text-link">{address}</Link>
        </div>
      )
    }

    default:
      return `Unknown notification type: ${type}`;
  }
}