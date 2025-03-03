import moment from "moment";
import { Link } from "react-router";

import { SellPlotDialog } from "@/components/dialogs/SellPlotDialog";
import { InfoPanel } from "@/components/ui/_info-panel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ICoordinates } from "@/global";
import { toLocalString } from "@/lib";
import { useAaStore } from "@/store/aa-store";
import { mapUnitsByCoordinatesSelector } from "@/store/selectors/mapUnitsSelector";
import { useSettingsStore } from "@/store/settings-store";
import { RentPlotDialog } from "@/components/dialogs/RentPlotDialog";

export const SelectedUnitMapCard = () => {
  const selectedMapUnitCoordinates = useSettingsStore((state) => state.selectedMapUnit);

  const [selectedMapUnit] = useAaStore((state) => mapUnitsByCoordinatesSelector(state, selectedMapUnitCoordinates as ICoordinates | null));

  const stateLoaded = useAaStore((state) => state.loaded);
  const symbol = useSettingsStore((state) => state.symbol);
  const asset = useSettingsStore((state) => state.asset);
  const decimals = useSettingsStore((state) => state.decimals);
  const inited = useSettingsStore((state) => state.inited);
  const walletAddress = useSettingsStore((state) => state.walletAddress);

  const loading = !inited || !stateLoaded || !asset || decimals === null;

  const decimalsPow = 10 ** (decimals ?? 0);
  const rented_amount = selectedMapUnit?.type === "plot" ? selectedMapUnit.rented_amount ?? 0 : 0;
  const formattedTotalAmount = toLocalString((selectedMapUnit?.amount + rented_amount) / decimalsPow);
  const formattedRentedAmount = toLocalString(rented_amount / decimalsPow);

  const owner = selectedMapUnit?.owner;

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
              {formattedTotalAmount} {symbol} (included {formattedRentedAmount} {symbol} rented)
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

            <InfoPanel.Item label="Created at" loading={loading}>
              {moment.unix(selectedMapUnit?.ts).format("YYYY-MM-DD HH:mm")}
            </InfoPanel.Item>

            {loading && <Skeleton className="w-full h-[50px]" />}

            {owner && (
              <InfoPanel.Item label="Owner" loading={loading || !owner}>
                <Link to={`/user/${owner}`} className="text-blue-400 block truncate max-w-[200px]">
                  {selectedMapUnit?.username} - {owner}
                </Link>
              </InfoPanel.Item>
            )}
          </InfoPanel>

          <div className="grid gap-2">
            {owner === walletAddress && selectedMapUnit.type === "plot" ? (
              <SellPlotDialog>
                <Button variant="secondary" className="w-full">
                  Sell plot
                </Button>
              </SellPlotDialog>
            ) : null}

            {owner === walletAddress ? (
              <RentPlotDialog>
                <Button variant="secondary" className="w-full">
                  Rent additional land
                </Button>
              </RentPlotDialog>
            ) : null}
          </div>
        </CardContent>
      ) : (
        <CardContent className="text-primary">No plot selected</CardContent>
      )}
    </Card>
  );
};

