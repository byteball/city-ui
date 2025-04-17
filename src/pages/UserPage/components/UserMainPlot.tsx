import { UserPenIcon } from "lucide-react";
import { FC } from "react";

import { SetUserMainPlotDialog } from "@/components/dialogs/SetUserMainPlotDialog";
import { ButtonWithTooltip } from "@/components/ui/ButtonWithTooltip";
import { getRoads } from "@/game/utils/getRoads";
import { IMapUnit, IPlot } from "@/global";
import { getAddressFromNearestRoad } from "@/lib";
import { useAaStore } from "@/store/aa-store";
import { mapUnitsByOwnerAddressSelector, mapUnitsSelector } from "@/store/selectors/mapUnitsSelector";
import { useSettingsStore } from "@/store/settings-store";

interface IUserMainPlotProps {
  /** Address of the user */
  address: string;
}

const getPlotMapAddress = (
  userMainPlot: IPlot | undefined,
  userMainPlotNum: number | undefined,
  mapUnits: IMapUnit[],
  mayor?: string
) => {
  if (!mayor) return "Mayor not found"; // need to generate roads list

  if (userMainPlot && userMainPlotNum) {
    const roads = getRoads(mapUnits, String(mayor));
    return (
      getAddressFromNearestRoad(roads, { x: userMainPlot.x, y: userMainPlot?.y }, userMainPlotNum)?.[0] ||
      `Plot ${userMainPlotNum}`
    );
  }

  return userMainPlotNum ? `Plot ${userMainPlotNum}` : "Not set up yet";
};

export const UserMainPlot: FC<IUserMainPlotProps> = ({ address }) => {
  const walletAddress = useSettingsStore((state) => state.walletAddress);
  const userMainPlotNum = useAaStore((state) => state.state[`user_main_plot_city_${address}`]) as number | undefined;
  const userUnits = useAaStore((state) => mapUnitsByOwnerAddressSelector(state, walletAddress));
  const mapUnits = useAaStore(mapUnitsSelector);
  const mayor = useAaStore((state) => state.state.city_city?.mayor);

  const userMainPlot = userMainPlotNum
    ? ((userUnits.length ? userUnits : mapUnits).find(
        (unit) => unit.type === "plot" && unit.plot_num === userMainPlotNum
      ) as IPlot | undefined)
    : undefined;

  return (
    <div className="flex items-center">
      {userMainPlot ? (
        getPlotMapAddress(userMainPlot, userMainPlotNum, mapUnits, mayor)
      ) : (
        <div className="text-gray-500">Not set up yet</div>
      )}

      {address === walletAddress ? (
        <SetUserMainPlotDialog plotNum={userMainPlotNum}>
          <ButtonWithTooltip tooltipText="Set up the main plot" variant="link" className="rounded-xl">
            <UserPenIcon className="w-4 h-4" />
          </ButtonWithTooltip>
        </SetUserMainPlotDialog>
      ) : null}
    </div>
  );
};

