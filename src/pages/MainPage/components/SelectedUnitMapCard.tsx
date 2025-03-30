import moment from "moment";
import { Link } from "react-router";

import appConfig from "@/appConfig";
import { RentPlotDialog } from "@/components/dialogs/RentPlotDialog";
import { SellPlotDialog } from "@/components/dialogs/SellPlotDialog";
import { SettingsDialog } from "@/components/dialogs/SettingsDialog";
import { InfoPanel } from "@/components/ui/_info-panel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { getRoads } from "@/game/utils/getRoads";
import { ICity, ICoordinates } from "@/global";
import { generateLink, toLocalString } from "@/lib";
import { getAddressFromNearestRoad } from "@/lib/getAddressCoordinate";
import { useAaStore } from "@/store/aa-store";
import { mapUnitsByCoordinatesSelector, mapUnitsSelector } from "@/store/selectors/mapUnitsSelector";
import { useSettingsStore } from "@/store/settings-store";

export const SelectedUnitMapCard = () => {
  const selectedMapUnitCoordinates = useSettingsStore((state) => state.selectedMapUnit);

  const [selectedMapUnit] = useAaStore((state) => mapUnitsByCoordinatesSelector(state, selectedMapUnitCoordinates as ICoordinates | null));
  const stateLoaded = useAaStore((state) => state.loaded);
  const { symbol, asset, decimals, inited, walletAddress } = useSettingsStore((state) => state);

  const loading = !inited || !stateLoaded || !asset || decimals === null;

  const decimalsPow = 10 ** (decimals ?? 0);
  const rented_amount = selectedMapUnit?.type === "plot" ? selectedMapUnit.rented_amount ?? 0 : 0;
  const formattedTotalAmount = toLocalString((selectedMapUnit?.amount + rented_amount) / decimalsPow);
  const formattedRentedAmount = rented_amount ? toLocalString(rented_amount / decimalsPow) : "";

  const owner = selectedMapUnit?.owner;
  const state = useAaStore.getState();

  const cityStats = state.state.city_city as ICity;

  const leaveUrl = generateLink({
    amount: 1e4,
    data: { leave: 1, plot_num: selectedMapUnit?.plot_num },
    asset: "base",
    aa: appConfig.AA_ADDRESS,
  });

  const mapUnits = mapUnitsSelector(state);
  const roads = getRoads(mapUnits, String(cityStats?.mayor));

  const addresses =
    selectedMapUnitCoordinates?.x !== undefined && selectedMapUnitCoordinates?.y !== undefined
      ? getAddressFromNearestRoad(roads, { x: selectedMapUnitCoordinates.x, y: selectedMapUnitCoordinates.y })
      : [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Selected {selectedMapUnit?.type}</CardTitle>
        <CardDescription>Click on the house or plot to see all the information about it.</CardDescription>
      </CardHeader>

      {selectedMapUnitCoordinates ? (
        <CardContent>
          <InfoPanel>
            <InfoPanel.Item label="Amount" loading={loading}>
              {formattedTotalAmount} {symbol} {rented_amount ? `(inc. ${formattedRentedAmount} rented ${symbol})` : ""}
            </InfoPanel.Item>

            <InfoPanel.Item label="Coordinates" loading={loading}>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger className="cursor-text">
                    <div className="font-mono">
                      ({selectedMapUnit?.x},{selectedMapUnit?.y})
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div>
                      X: {selectedMapUnit?.x}, Y: {selectedMapUnit?.y}
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </InfoPanel.Item>

            <InfoPanel.Item label="Address" loading={loading}>
              <div>{addresses[0] ?? "No address"}</div>
            </InfoPanel.Item>

            <InfoPanel.Item label="Created at" loading={loading}>
              {moment.unix(selectedMapUnit?.ts).format("YYYY-MM-DD HH:mm")}
            </InfoPanel.Item>

            <InfoPanel.Item label="Owner" loading={loading || !owner}>
              <Link to={`/user/${owner}`} className="text-blue-400 block truncate max-w-[200px]">
                {selectedMapUnit?.username} - {owner}
              </Link>
            </InfoPanel.Item>
          </InfoPanel>

          {loading ? <Skeleton className="w-full h-[124px] mt-2" /> : null}

          {owner === walletAddress && !loading && selectedMapUnit?.type === "plot" && (
            <div className="grid gap-2">
              {selectedMapUnit.type === "plot" ? (
                <SellPlotDialog>
                  <Button variant="secondary" className="w-full">
                    Sell plot
                  </Button>
                </SellPlotDialog>
              ) : null}

              <RentPlotDialog>
                <Button variant="secondary" className="w-full">
                  Rent additional land
                </Button>
              </RentPlotDialog>

              <SettingsDialog>
                <Button variant="secondary" className="w-full">
                  Settings
                </Button>
              </SettingsDialog>

              <a href={leaveUrl}>
                <Button variant="secondary" className="w-full">
                  leave an unbuilt plot
                </Button>
              </a>
            </div>
          )}
        </CardContent>
      ) : (
        <CardContent className="text-primary">No plot selected</CardContent>
      )}
    </Card>
  );
};

