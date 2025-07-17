import cn from "classnames";
import { DollarSignIcon, DoorOpenIcon, ImageUpscaleIcon, PencilIcon, ShoppingBagIcon } from "lucide-react";
import moment from "moment";
import { FC, useCallback, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router";

import { LeaveUnbuiltPlotDialog } from "@/components/dialogs/LeaveUnbuiltPlotDialog";
import { RentPlotDialog } from "@/components/dialogs/RentPlotDialog";
import { SellPlotDialog } from "@/components/dialogs/SellPlotDialog";
import { SettingsDialog } from "@/components/dialogs/SettingsDialog";
import { ShortCodeSellDialog } from "@/components/dialogs/ShortCodeSellDialog";
import { ContactField } from "@/components/ui/_contact-field";
import { InfoPanel } from "@/components/ui/_info-panel";
import { QRButton } from "@/components/ui/_qr-button";
import { AdditionalInfo } from "@/components/ui/additional_info";
import { ButtonWithTooltip } from "@/components/ui/ButtonWithTooltip";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { FamousBlockquote } from "./FamousBlockquote";

import { useAaStore } from "@/store/aa-store";
import { mapUnitsByUniqDataSelector, mapUnitsSelector } from "@/store/selectors/mapUnitsSelector";
import { useSettingsStore } from "@/store/settings-store";

import { getNearestRoads } from "@/engine/utils/getNearestRoads";
import { getRoads } from "@/engine/utils/getRoads";
import { ICity } from "@/global";
import { useAttestations } from "@/hooks/useAttestations";
import { asNonNegativeNumber, generateLink, toLocalString } from "@/lib";
import { getAddressFromNearestRoad } from "@/lib/getAddressCoordinate";
import { getMatches } from "@/lib/getMatches";

import { EventBus } from "@/engine/EventBus";

import appConfig from "@/appConfig";

interface ISelectedUnitMapCardProps {
  sceneType: "main" | "market";
}

export const SelectedUnitMapCard: FC<ISelectedUnitMapCardProps> = ({ sceneType = "main" }) => {
  const selectedMapUnitUniqData = useSettingsStore((state) =>
    sceneType === "market" ? state.selectedMarketPlot : state.selectedMapUnit
  );

  const stateLoaded = useAaStore((state) => state.loaded);
  const aaState = useAaStore((state) => state);

  const selectedMapUnit = useAaStore((state) => mapUnitsByUniqDataSelector(state, selectedMapUnitUniqData || null));
  const owner = selectedMapUnit?.owner;

  const { data: attestations, loaded } = useAttestations(owner);

  const ownerUsernameIsLoading = selectedMapUnit?.type === "house" && !loaded;

  const { symbol, asset, decimals, inited, walletAddress, setSelectedMapUnit } = useSettingsStore((state) => state);

  const loading = !inited || !stateLoaded || !asset || decimals === null;

  const cityStats = aaState.state.city_city as ICity;
  const mapUnits = useMemo(() => mapUnitsSelector(aaState), [aaState]);
  const neighborPlotNum = useMemo(() => getMatches(aaState).get(selectedMapUnit?.plot_num || -1)?.neighbor_plot ?? null, [aaState, selectedMapUnit]);

  const neighborHouse = useMemo(() => mapUnits.find(unit => unit.type === "house" && unit.plot_num === neighborPlotNum), [mapUnits, neighborPlotNum]);

  const roads = getRoads(mapUnits, String(cityStats?.mayor));

  const decimalsPow = 10 ** (decimals ?? 0);
  const rented_amount = selectedMapUnit?.type === "plot" ? selectedMapUnit.rented_amount ?? 0 : 0;
  const formattedAmount = toLocalString((selectedMapUnit?.amount ?? 0) / decimalsPow);
  const formattedRentedAmount = rented_amount ? toLocalString(rented_amount / decimalsPow) : "";
  const isOwner = owner === walletAddress || walletAddress === cityStats?.mayor && selectedMapUnit?.amount === 0;

  const leaveUrl = generateLink({
    amount: 1e4,
    data: { leave: 1, plot_num: selectedMapUnit?.plot_num },
    asset: "base",
    aa: appConfig.AA_ADDRESS,
    from_address: walletAddress!,
    is_single: true,
  });

  const addresses =
    selectedMapUnit?.x !== undefined && selectedMapUnit?.y !== undefined
      ? getAddressFromNearestRoad(
        roads,
        {
          x: selectedMapUnit.x,
          y: selectedMapUnit.y,
        },
        selectedMapUnit?.type === "house" ? selectedMapUnit?.house_num ?? 0 : selectedMapUnit?.plot_num ?? 0
      )
      : [];

  const neighborAddress =
    neighborHouse?.x !== undefined && neighborHouse?.y !== undefined
      ? getAddressFromNearestRoad(
        roads,
        {
          x: neighborHouse.x,
          y: neighborHouse.y,
        },
        neighborHouse?.type === "house" ? neighborHouse?.house_num ?? 0 : neighborHouse?.plot_num ?? 0
      )
      : [];

  const p2pBuyLink =
    selectedMapUnit?.type === "plot" && selectedMapUnit.sale_price
      ? generateLink({
        aa: appConfig.AA_ADDRESS,
        amount: selectedMapUnit?.sale_price || 0,
        data: {
          p2p_buy: 1,
          plot_num: selectedMapUnit?.plot_num,
        },
        asset: asset as string,
        from_address: walletAddress!,
        is_single: true,
      })
      : null;

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
        from_address: walletAddress!,
        is_single: true,
      })
      : null;

  const title = `Obyte City — ${addresses.length ? addresses[0] : "A community engagement space for Obyte"}`;

  const discordContact = attestations.find((a) => a.name === "discord")?.value;
  const telegramContact = attestations.find((a) => a.name === "telegram")?.value;

  // @ts-ignore
  const name = selectedMapUnit?.info?.name || telegramContact || discordContact || "unknown";

  let description =
    "A community engagement space where Obyte community members establish closer connections with each other and receive rewards after becoming neighbors in the City";

  if (selectedMapUnit) {
    description = `Plot/House at ${addresses[0]} owned by ${name || walletAddress} in Obyte City`;
  }

  const isGoldenPlot = useMemo(() => {
    return selectedMapUnit?.type === "plot" && appConfig.GOLDEN_PLOTS.map(asNonNegativeNumber).includes(selectedMapUnit.plot_num);
  }, [selectedMapUnit]);

  const selectNeighbor = useCallback(() => {
    if (!neighborHouse || neighborHouse.type !== "house") return;

    setSelectedMapUnit({ num: neighborHouse.house_num, type: "house" });
    EventBus.emit("reset-selection");
  }, [neighborHouse]);

  const nearestRoad = getNearestRoads(roads, selectedMapUnit?.x ?? 0, selectedMapUnit?.y ?? 0, 1)[0]?.name;

  const authorName = useMemo(() => nearestRoad?.replaceAll(" Street", "").replaceAll(" Avenue", ""), [nearestRoad]);

  return (
    <>
      {sceneType === "main" ? <FamousBlockquote
        plotNum={selectedMapUnit?.plot_num}
        name={authorName}
      /> : null}

      <Helmet>
        <title>{title}</title>
        <meta name="og:title" content={title} />
        <meta name="twitter:title" content={title} />

        <meta name="og:description" content={description} />
        <meta name="twitter:description" content={description} />
        <meta name="description" content={description} />

        {selectedMapUnit ? (
          <>
            <meta
              property="og:image"
              content={`${appConfig.OG_IMAGE_URL}/og/unit?${selectedMapUnit.type}=${selectedMapUnit.type === "house" ? selectedMapUnit.house_num : selectedMapUnit.plot_num
                }`}
            />
          </>
        ) : (
          <>
            <meta property="og:image" content={`${appConfig.OG_IMAGE_URL}/og/unit`} />
          </>
        )}
      </Helmet>

      <Card>
        <CardHeader>
          {selectedMapUnit ? (
            <>
              <CardTitle>Selected {selectedMapUnit.type}</CardTitle>
              {isGoldenPlot ? <CardDescription className="text-[#FFD700]">Golden neighbor — if you become their neighbor, you get additional 25 GBYTE from the Obyte team.</CardDescription> : null}
            </>
          ) : (
            <CardTitle>
              {stateLoaded ? (
                <span className="text-sm text-muted-foreground">
                  Click on a plot {sceneType === "main" ? "or house" : ""} to see information about it
                </span>
              ) : (
                <Skeleton className="w-full h-24" />
              )}
            </CardTitle>
          )}
        </CardHeader>

        {selectedMapUnitUniqData ? (
          <CardContent className="text-sm">
            <InfoPanel>
              {selectedMapUnit?.type === "house" && selectedMapUnit.amount === 0 ? (
                <InfoPanel.Item textClamp loading={loading}>
                  Mayor house{" "}
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <img className="inline ml-2 size-6" src="./obyte-city-flag.svg" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="max-w-[150px]">
                          This house was built by the City mayor to create the street grid of the City.{" "}
                          <Link to="/faq#who-is-the-mayor" className="text-link">
                            See more details in the FAQ.
                          </Link>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </InfoPanel.Item>
              ) : null}
              <InfoPanel.Item
                textClamp
                tooltipText={
                  selectedMapUnit?.type === "plot" ? "Amount deposited on the plot " : "Amount paid for the house"
                }
                label="Amount"
                loading={loading}
              >
                {formattedAmount} {symbol} {rented_amount ? `(Plus ${formattedRentedAmount} rented ${symbol})` : ""}
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
                  tooltipText="Shortcodes are unique names used to send money via the wallet instead of using a full address. They are given out on first come, first served basis and are available only to house owners."
                  loading={loading}
                >
                  {selectedMapUnit.shortcode.toLowerCase()}
                </InfoPanel.Item>
              ) : null}

              {loading || owner ? (
                <InfoPanel.Item label="Owner" loading={loading}>
                  <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2">
                    <Link to={`/user/${owner}`} className="truncate text-link">
                      {owner}
                    </Link>
                  </div>
                </InfoPanel.Item>
              ) : null}

              {selectedMapUnit?.type === "plot" && selectedMapUnit?.rental_expiry_ts ? (
                <InfoPanel.Item textClamp label="Rental expiry" loading={loading}>
                  {moment.unix(selectedMapUnit?.rental_expiry_ts).format("YYYY-MM-DD HH:mm")}
                </InfoPanel.Item>
              ) : null}

              {owner || loading ? (
                <InfoPanel.Item label="Contacts" loading={loading || !owner || ownerUsernameIsLoading || !loaded}>
                  <ContactField attestations={attestations} />
                </InfoPanel.Item>
              ) : null}

              {selectedMapUnit?.info ? (
                <div className="overflow-hidden text-sm">
                  <div className="mt-2 mb-1 font-semibold">Additional information</div>
                  <AdditionalInfo
                    info={selectedMapUnit?.info}
                    itemsType="info-panel"
                  />
                </div>
              ) : null}

              {neighborPlotNum && neighborHouse?.type === "house" ? <div className="mt-3">
                <InfoPanel.Item
                  textClamp
                  label="Neighbor"
                  loading={loading}
                >
                  <Link className="truncate text-link" to={`/?house=${neighborHouse.house_num}`} onClick={selectNeighbor}>
                    {neighborAddress[0] ?? "Unknown address"}
                  </Link>
                </InfoPanel.Item>
              </div> : null}

              {sceneType === "market" && selectedMapUnit?.type === "plot" ? (
                <div className="mt-4 space-y-2">
                  {isOwner ? (
                    <QRButton href={p2pWithdrawFromSale || "#"}>Withdraw from sale</QRButton>
                  ) : (
                    <QRButton href={p2pBuyLink || "#"}>
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
                      <ButtonWithTooltip
                        tooltipText="Leave the unbuilt plot"
                        variant="secondary"
                        className="rounded-xl"
                      >
                        <DoorOpenIcon className="w-4 h-4" />
                      </ButtonWithTooltip>
                    </LeaveUnbuiltPlotDialog>
                  </>
                )}

                {selectedMapUnit?.type === "house" && isOwner && selectedMapUnit.shortcode ? (
                  <ShortCodeSellDialog>
                    <ButtonWithTooltip
                      disabled={!selectedMapUnit.shortcode}
                      tooltipText="Sell shortcode"
                      variant="secondary"
                      className="rounded-xl"
                    >
                      <DollarSignIcon className="w-4 h-4" />
                    </ButtonWithTooltip>
                  </ShortCodeSellDialog>
                ) : null}
              </div>
            ) : null}
          </CardContent>
        ) : null}
      </Card>
    </>
  );
};

SelectedUnitMapCard.displayName = "SelectedUnitMapCard";

