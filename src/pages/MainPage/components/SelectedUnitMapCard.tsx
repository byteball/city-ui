import cn from "classnames";
import { CaseUpperIcon, DoorOpenIcon, ImageUpscaleIcon, PencilIcon, ShoppingBagIcon } from "lucide-react";
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
import { AttestationList } from "@/pages/UserPage/components";

import { useAaStore } from "@/store/aa-store";
import { mapUnitsByCoordinatesSelector, mapUnitsSelector } from "@/store/selectors/mapUnitsSelector";
import { useSettingsStore } from "@/store/settings-store";

import { getRoads } from "@/game/utils/getRoads";
import { ICity } from "@/global";
import { useAttestations } from "@/hooks/useAttestations";
import { generateLink, toLocalString } from "@/lib";
import { getAddressFromNearestRoad } from "@/lib/getAddressCoordinate";

import appConfig from "@/appConfig";
import { ShortCodeSellDialog } from "@/components/dialogs/ShortCodeSellDialog";
import { QRButton } from "@/components/ui/_qr-button";
import { FC } from "react";

interface ISelectedUnitMapCardProps {
  sceneType: "main" | "market";
}

export const SelectedUnitMapCard: FC<ISelectedUnitMapCardProps> = ({ sceneType = "main" }) => {
  const selectedMapUnitCoordinates = useSettingsStore((state) =>
    sceneType === "market" ? state.selectedMarketPlot : state.selectedMapUnit
  );

  const stateLoaded = useAaStore((state) => state.loaded);
  const aaState = useAaStore((state) => state);

  const selectedMapUnit = useAaStore((state) => mapUnitsByCoordinatesSelector(state, selectedMapUnitCoordinates!));
  const owner = selectedMapUnit?.owner;

  const { data: attestations, loaded } = useAttestations(selectedMapUnit?.type === "house" ? owner : undefined);

  const ownerUsernameIsLoading = selectedMapUnit?.type === "house" && !loaded;

  const { symbol, asset, decimals, inited, walletAddress } = useSettingsStore((state) => state);

  const loading = !inited || !stateLoaded || !asset || decimals === null;

  const cityStats = aaState.state.city_city as ICity;
  const mapUnits = mapUnitsSelector(aaState);
  const roads = getRoads(mapUnits, String(cityStats?.mayor));

  const decimalsPow = 10 ** (decimals ?? 0);
  const rented_amount = selectedMapUnit?.type === "plot" ? selectedMapUnit.rented_amount ?? 0 : 0;
  const formattedTotalAmount = toLocalString((selectedMapUnit?.amount ?? 0 + rented_amount) / decimalsPow);
  const formattedRentedAmount = rented_amount ? toLocalString(rented_amount / decimalsPow) : "";
  const isOwner = owner === walletAddress;

  const leaveUrl = generateLink({
    amount: 1e4,
    data: { leave: 1, plot_num: selectedMapUnit?.plot_num },
    asset: "base",
    aa: appConfig.AA_ADDRESS,
  });

  const addresses =
    selectedMapUnitCoordinates?.x !== undefined && selectedMapUnitCoordinates?.y !== undefined
      ? getAddressFromNearestRoad(
          roads,
          {
            x: selectedMapUnitCoordinates.x,
            y: selectedMapUnitCoordinates.y,
          },
          selectedMapUnit?.type === "house" ? selectedMapUnit?.house_num ?? 0 : selectedMapUnit?.plot_num ?? 0
        )
      : [];

  const p2pBuyLink =
    selectedMapUnit?.type === "plot" && selectedMapUnit.sale_price
      ? generateLink({
          aa: appConfig.AA_ADDRESS,
          amount: selectedMapUnit?.sale_price!,
          data: {
            p2p_buy: 1,
            plot_num: selectedMapUnit?.plot_num,
          },
          asset: asset!,
        })
      : "#";

  const p2pWithdrawFromSale =
    selectedMapUnit?.type === "plot" && selectedMapUnit.sale_price
      ? generateLink({
          aa: appConfig.AA_ADDRESS,
          amount: selectedMapUnit?.sale_price!,
          data: {
            sell: 1,
            plot_num: selectedMapUnit?.plot_num,
            sale_price: 0,
          },
          asset: asset!,
        })
      : "#";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Selected {selectedMapUnit?.type}</CardTitle>
        <CardDescription>Click on the house or plot to see all the information about it.</CardDescription>
      </CardHeader>

      {selectedMapUnitCoordinates ? (
        <CardContent className="text-sm">
          <InfoPanel>
            <InfoPanel.Item textClamp label="Amount" loading={loading}>
              {formattedTotalAmount} {symbol} {rented_amount ? `(inc. ${formattedRentedAmount} rented ${symbol})` : ""}
            </InfoPanel.Item>

            <InfoPanel.Item textClamp label="Coordinates" loading={loading}>
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

            <InfoPanel.Item textClamp label="Address" loading={loading}>
              {addresses[0] ?? "No address"}
            </InfoPanel.Item>

            {selectedMapUnit?.type === "house" && selectedMapUnit?.shortcode ? (
              <InfoPanel.Item
                label="Shortcode"
                textClamp
                tooltipText="Shortcodes are used to send money via the wallet instead of using a full address"
                loading={loading}
              >
                {selectedMapUnit.shortcode}
              </InfoPanel.Item>
            ) : null}

            {selectedMapUnit?.ts ? (
              <InfoPanel.Item textClamp label="Created at" loading={loading}>
                {moment.unix(selectedMapUnit?.ts).format("YYYY-MM-DD HH:mm")}
              </InfoPanel.Item>
            ) : null}

            <InfoPanel.Item textClamp label="Owner" loading={loading || !owner}>
              <Link to={`/user/${owner}`} className="text-blue-400 block truncate max-w-[200px]">
                {selectedMapUnit?.username ? `${selectedMapUnit?.username} - ${owner}` : owner}
              </Link>
            </InfoPanel.Item>

            {selectedMapUnit?.type === "house" ? (
              <InfoPanel.Item label="Contacts" loading={loading || !owner || ownerUsernameIsLoading}>
                {attestations.length ? (
                  <AttestationList data={attestations} blockDisplay={attestations.length > 1} />
                ) : (
                  <span>No attested contacts</span>
                )}
              </InfoPanel.Item>
            ) : null}

            {sceneType === "market" && selectedMapUnit?.type === "plot" ? (
              <div className="mt-4 space-y-2">
                {isOwner ? (
                  <QRButton href={p2pWithdrawFromSale}>Withdraw from sale</QRButton>
                ) : (
                  <QRButton href={p2pBuyLink}>
                    Buy for {toLocalString(selectedMapUnit?.sale_price / decimalsPow)} {symbol}
                  </QRButton>
                )}
              </div>
            ) : null}
          </InfoPanel>

          {loading && sceneType === "main" ? (
            <div className="flex flex-wrap gap-4 mt-4">
              <Skeleton className="rounded-xl w-[48px] h-[36px]" />
              <Skeleton className="rounded-xl w-[48px] h-[36px]" />
              {selectedMapUnit?.type === "house" ? (
                <>
                  <Skeleton className="rounded-xl w-[48px] h-[36px]" />
                  <Skeleton className="rounded-xl w-[48px] h-[36px]" />
                </>
              ) : null}
            </div>
          ) : null}

          {sceneType === "main" ? (
            <div className={cn("flex flex-wrap gap-4", { "mt-4": isOwner })}>
              {isOwner && selectedMapUnit ? (
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

              {isOwner && !loading && selectedMapUnit?.type === "plot" && (
                <>
                  <SellPlotDialog>
                    <ButtonWithTooltip tooltipText="Sell" variant="secondary" className="rounded-xl">
                      <ShoppingBagIcon className="w-4 h-4" />
                    </ButtonWithTooltip>
                  </SellPlotDialog>
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

              {selectedMapUnit?.type === "house" && isOwner && selectedMapUnit.shortcode ? (
                <ShortCodeSellDialog plot_num={selectedMapUnit.plot_num} shortcode={selectedMapUnit.shortcode}>
                  <ButtonWithTooltip
                    disabled={!selectedMapUnit.shortcode}
                    tooltipText="Sell or transfer shortcode"
                    variant="secondary"
                    className="rounded-xl"
                  >
                    <CaseUpperIcon className="w-4 h-4" />
                  </ButtonWithTooltip>
                </ShortCodeSellDialog>
              ) : null}
            </div>
          ) : null}
        </CardContent>
      ) : (
        <CardContent className="text-primary">No selected</CardContent>
      )}
    </Card>
  );
};

SelectedUnitMapCard.displayName = "SelectedUnitMapCard";

