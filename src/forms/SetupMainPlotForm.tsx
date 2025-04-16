import { FC, useMemo, useState } from "react";

import { QRButton } from "@/components/ui/_qr-button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { useAaStore } from "@/store/aa-store";
import { mapUnitsByOwnerAddressSelector, mapUnitsSelector } from "@/store/selectors/mapUnitsSelector";
import { useSettingsStore } from "@/store/settings-store";

import { getRoads } from "@/game/utils/getRoads";
import { ICity } from "@/global";
import { generateLink, getAddressFromNearestRoad } from "@/lib";

import appConfig from "@/appConfig";

interface ISetupMainPlotFormProps {
  plotNum?: number;
}

export const SetupMainPlotForm: FC<ISetupMainPlotFormProps> = ({ plotNum }) => {
  const [selectedPlot, setSelectedPlot] = useState<string | undefined>(plotNum?.toString());
  const { walletAddress, inited } = useSettingsStore((state) => state!);
  const aaState = useAaStore((state) => state);
  const mapUnits = mapUnitsSelector(aaState);
  const userUnits = useAaStore((state) => mapUnitsByOwnerAddressSelector(state, walletAddress));
  const userPlots = useMemo(() => userUnits.filter((u) => u.type === "plot"), [userUnits]);

  const cityStats = aaState.state.city_city as ICity;

  // Memoize roads to avoid recalculating them on every render
  const roads = useMemo(() => getRoads(mapUnits, String(cityStats?.mayor)), [mapUnits, cityStats?.mayor]);

  const plotHandleChange = (value: string) => {
    setSelectedPlot(value);
  };

  if (!aaState.loaded || userPlots.length === 0) {
    return <div className="text-yellow-600">You don't have any plots</div>;
  }

  const isPlotExist = !!userPlots.find((plot) => plot.plot_num === Number(selectedPlot));

  return (
    <div className="grid gap-4">
      <div>
        <Select
          onValueChange={plotHandleChange}
          defaultValue={selectedPlot ? selectedPlot.toString() : undefined}
          disabled={!inited}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select your plot" />
          </SelectTrigger>
          <SelectContent>
            {userPlots.map(({ plot_num, x, y }) => (
              <SelectItem key={plot_num.toString()} value={plot_num.toString()}>
                {getAddressFromNearestRoad(roads, { x, y }, plot_num)?.[0] ?? `Plot ${plot_num}`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <QRButton
        href={generateLink({
          asset: "base",
          amount: 1e4,
          data: {
            main_plot_num: Number(selectedPlot),
            edit_user: 1,
          },
          from_address: walletAddress!,
          aa: appConfig.AA_ADDRESS,
          is_single: true,
        })}
        disabled={!selectedPlot || !isPlotExist}
      >
        Set up
      </QRButton>
    </div>
  );
};

