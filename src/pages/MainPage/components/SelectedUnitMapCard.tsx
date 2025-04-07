import cn from "classnames";
import { DoorOpenIcon, ImageUpscaleIcon, PencilIcon, ShoppingBagIcon } from "lucide-react";
import moment from "moment";
import { Link } from "react-router";

import { LeaveUnbuiltPlotDialog } from "@/components/dialogs/LeaveUnbuiltPlotDialog";
import { RentPlotDialog } from "@/components/dialogs/RentPlotDialog";
import { SellPlotDialog } from "@/components/dialogs/SellPlotDialog";
import { SettingsDialog } from "@/components/dialogs/SettingsDialog";
import { InfoPanel } from "@/components/ui/_info-panel";
import { ButtonWithTooltip } from "@/components/ui/ButtonWithTooltip";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

import { useAaStore } from "@/store/aa-store";
import { mapUnitsByCoordinatesSelector, mapUnitsSelector } from "@/store/selectors/mapUnitsSelector";
import { useSettingsStore } from "@/store/settings-store";

import { getRoads } from "@/game/utils/getRoads";
import { ICity } from "@/global";
import { generateLink, toLocalString } from "@/lib";
import { getAddressFromNearestRoad } from "@/lib/getAddressCoordinate";

import appConfig from "@/appConfig";

export const SelectedUnitMapCard = () => {
  const selectedMapUnitCoordinates = useSettingsStore((state) => state.selectedMapUnit);
  const stateLoaded = useAaStore((state) => state.loaded);
  const selectedMapUnit = useAaStore((state) => mapUnitsByCoordinatesSelector(state, selectedMapUnitCoordinates!));

  const state = useAaStore.getState();

  const { symbol, asset, decimals, inited, walletAddress } = useSettingsStore((state) => state);

  if (!selectedMapUnit) return null;

  const loading = !inited || !stateLoaded || !asset || decimals === null;

  const owner = selectedMapUnit?.owner;

  const cityStats = state.state.city_city as ICity;
  const mapUnits = mapUnitsSelector(state);
  const roads = getRoads(mapUnits, String(cityStats?.mayor));

  const decimalsPow = 10 ** (decimals ?? 0);
  const rented_amount = selectedMapUnit?.type === "plot" ? selectedMapUnit.rented_amount ?? 0 : 0;
  const formattedTotalAmount = toLocalString((selectedMapUnit?.amount + rented_amount) / decimalsPow);
  const formattedRentedAmount = rented_amount ? toLocalString(rented_amount / decimalsPow) : "";

  const leaveUrl = generateLink({
    amount: 1e4,
    data: { leave: 1, plot_num: selectedMapUnit?.plot_num },
    asset: "base",
    aa: appConfig.AA_ADDRESS,
  });

  const addresses =
    selectedMapUnitCoordinates?.x !== undefined && selectedMapUnitCoordinates?.y !== undefined
      ? getAddressFromNearestRoad(roads, {
          x: selectedMapUnitCoordinates.x,
          y: selectedMapUnitCoordinates.y,
        })
      : [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Selected {selectedMapUnit?.type}</CardTitle>
        <CardDescription>Click on the house or plot to see all the information about it.</CardDescription>
      </CardHeader>

      {selectedMapUnitCoordinates ? (
        <CardContent className="text-sm">
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
              {addresses[0] ?? "No address"}
            </InfoPanel.Item>

            {selectedMapUnit?.type === "house" && selectedMapUnit?.shortcode ? (
              <InfoPanel.Item
                label="Shortcode"
                tooltipText="Shortcodes are used to send money via the wallet instead of using a full address"
                loading={loading}
              >
                {selectedMapUnit.shortcode}
              </InfoPanel.Item>
            ) : null}

            <InfoPanel.Item label="Created at" loading={loading}>
              {moment.unix(selectedMapUnit?.ts).format("YYYY-MM-DD HH:mm")}
            </InfoPanel.Item>

            <InfoPanel.Item label="Owner" loading={loading || !owner}>
              <Link to={`/user/${owner}`} className="text-blue-400 block truncate max-w-[200px]">
                {selectedMapUnit?.username ? `${selectedMapUnit?.username} - ${owner}` : owner}
              </Link>
            </InfoPanel.Item>
          </InfoPanel>

          {loading ? (
            <div className="flex flex-wrap gap-4 mt-4">
              <Skeleton className="rounded-xl w-[48px] h-[36px]" />
              <Skeleton className="rounded-xl w-[48px] h-[36px]" />
              <Skeleton className="rounded-xl w-[48px] h-[36px]" />
              <Skeleton className="rounded-xl w-[48px] h-[36px]" />
            </div>
          ) : null}

          <div className={cn("flex flex-wrap gap-4", { "mt-4": owner === walletAddress })}>
            {owner === walletAddress ? (
              <SettingsDialog unitData={selectedMapUnit}>
                <ButtonWithTooltip
                  tooltipText={`Edit ${selectedMapUnit.type}`}
                  variant="secondary"
                  className="rounded-xl"
                >
                  <PencilIcon className="w-4 h-4" />
                </ButtonWithTooltip>
              </SettingsDialog>
            ) : null}

            {owner === walletAddress && !loading && selectedMapUnit?.type === "plot" && (
              <>
                {selectedMapUnit.type === "plot" ? (
                  <SellPlotDialog>
                    <ButtonWithTooltip tooltipText="Sell" variant="secondary" className="rounded-xl">
                      <ShoppingBagIcon className="w-4 h-4" />
                    </ButtonWithTooltip>
                  </SellPlotDialog>
                ) : null}

                <RentPlotDialog>
                  <ButtonWithTooltip tooltipText="Rent additional land" variant="secondary" className="rounded-xl">
                    <ImageUpscaleIcon className="w-4 h-4" />
                  </ButtonWithTooltip>
                </RentPlotDialog>

                <LeaveUnbuiltPlotDialog leaveUrl={leaveUrl} amount={selectedMapUnit.amount}>
                  <ButtonWithTooltip tooltipText="Leave the unbuilt plot" variant="secondary" className="rounded-xl">
                    <DoorOpenIcon className="w-4 h-4" />
                  </ButtonWithTooltip>
                </LeaveUnbuiltPlotDialog>
              </>
            )}
          </div>
        </CardContent>
      ) : (
        <CardContent className="text-primary">No plot selected</CardContent>
      )}
    </Card>
  );
};

SelectedUnitMapCard.displayName = "SelectedUnitMapCard";

