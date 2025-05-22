import cn from "classnames";
import { DoorOpenIcon, ImageUpscaleIcon, PencilIcon, ShoppingBagIcon } from "lucide-react";
import moment from "moment";
import { FC } from "react";
import { Link } from "react-router";

import { LeaveUnbuiltPlotDialog } from "@/components/dialogs/LeaveUnbuiltPlotDialog";
import { RentPlotDialog } from "@/components/dialogs/RentPlotDialog";
import { SellPlotDialog } from "@/components/dialogs/SellPlotDialog";
import { SettingsDialog } from "@/components/dialogs/SettingsDialog";
import { ShortCodeSellDialog } from "@/components/dialogs/ShortCodeSellDialog";
import { InfoPanel } from "@/components/ui/_info-panel";
import { QRButton } from "@/components/ui/_qr-button";
import { ButtonWithTooltip } from "@/components/ui/ButtonWithTooltip";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

import { useAaStore } from "@/store/aa-store";
import { mapUnitsByUniqDataSelector, mapUnitsSelector } from "@/store/selectors/mapUnitsSelector";
import { useSettingsStore } from "@/store/settings-store";

import { getRoads } from "@/game/utils/getRoads";
import { ICity } from "@/global";
import { useAttestations } from "@/hooks/useAttestations";
import { generateLink, toLocalString } from "@/lib";
import { getAddressFromNearestRoad } from "@/lib/getAddressCoordinate";

import appConfig from "@/appConfig";
import { getContactUrlByUsername } from "@/lib/getContactUrlByUsername";
import { Helmet } from "react-helmet-async";
import { SocialIcons } from "./SocialIcons";

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

  const { symbol, asset, decimals, inited, walletAddress } = useSettingsStore((state) => state);

  const loading = !inited || !stateLoaded || !asset || decimals === null;

  const cityStats = aaState.state.city_city as ICity;
  const mapUnits = mapUnitsSelector(aaState);
  const roads = getRoads(mapUnits, String(cityStats?.mayor));

  const decimalsPow = 10 ** (decimals ?? 0);
  const rented_amount = selectedMapUnit?.type === "plot" ? selectedMapUnit.rented_amount ?? 0 : 0;
  const formattedAmount = toLocalString((selectedMapUnit?.amount ?? 0) / decimalsPow);
  const formattedRentedAmount = rented_amount ? toLocalString(rented_amount / decimalsPow) : "";
  const isOwner = owner === walletAddress;

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

  return (
    <>
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
              content={`${appConfig.OG_IMAGE_URL}/og/unit?${selectedMapUnit.type}=${
                selectedMapUnit.type === "house" ? selectedMapUnit.house_num : selectedMapUnit.plot_num
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
            <CardTitle>Selected {selectedMapUnit.type}</CardTitle>
          ) : (
            <CardTitle>
              {stateLoaded ? (
                <span className="text-sm text-muted-foreground">
                  Click on the house or plot to see information about it
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
                <InfoPanel.Item label="Contacts" loading={loading || !owner || ownerUsernameIsLoading}>
                  {attestations.length ? (
                    <div className="flex gap-4">
                      {attestations.map((a) => {
                        const url = getContactUrlByUsername(a.value, a.name, a.userId);

                        return (
                          <div
                            className="flex items-center justify-between gap-1"
                            key={a.name + "-" + a.value + "-" + owner}
                          >
                            <SocialIcons type={a.name} />{" "}
                            {url ? (
                              <a href={url} target="_blank" className="text-link">
                                {a.value}
                              </a>
                            ) : (
                              <div>{a.value}</div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <span>No attested contacts</span>
                  )}
                </InfoPanel.Item>
              ) : null}

              {selectedMapUnit?.info ? (
                <div className="text-sm">
                  <div className="mt-2 mb-1 font-semibold">Additional information</div>
                  {typeof selectedMapUnit.info === "string" ? (
                    <InfoPanel.Item label="Information">{selectedMapUnit.info}</InfoPanel.Item>
                  ) : (
                    Object.entries(selectedMapUnit.info)
                      .slice(0, 5)
                      .map(([key, value]) => (
                        <InfoPanel.Item key={key} label={key}>
                          <div className="inline">
                            {String(value).startsWith("https://") || String(value).startsWith("https://") ? (
                              <a href={value?.toString()} rel="nofollow" className="text-link" target="_blank">
                                {value}
                              </a>
                            ) : (
                              value ?? ""
                            )}
                          </div>
                        </InfoPanel.Item>
                      ))
                  )}
                </div>
              ) : null}
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
                      <ShoppingBagIcon className="w-4 h-4" />
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

