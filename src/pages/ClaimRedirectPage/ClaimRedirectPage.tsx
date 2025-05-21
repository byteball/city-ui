import { CircleXIcon, Loader } from "lucide-react";
import { useRef } from "react";
import { Helmet } from "react-helmet-async";
import { useParams } from "react-router";

import { generateLink, getAddressFromNearestRoad, getExplorerUrl } from "@/lib";
import { useSettingsStore } from "@/store/settings-store";

import { getRoads } from "@/game/utils/getRoads";
import { useAttestations } from "@/hooks/useAttestations";
import { useAaParams, useAaStore } from "@/store/aa-store";
import { mapUnitsSelector } from "@/store/selectors/mapUnitsSelector";

import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { IRefPhaserGame, PhaserGame } from "@/game/PhaserGame";

import { InfoPanel } from "@/components/ui/_info-panel";
import { QRButton } from "@/components/ui/_qr-button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AttestationList } from "../UserPage/components";

import appConfig from "@/appConfig";

const ClaimRedirectPage = () => {
  const { walletAddress, inited } = useSettingsStore((state) => state);

  const aaState = useAaStore((state) => state);
  const { nums } = useParams<{ nums: string }>();
  const mapUnits = mapUnitsSelector(aaState);
  const gameColumnRef = useRef<HTMLDivElement>(null);
  const phaserRef = useRef<IRefPhaserGame | null>(null);
  const params = useAaParams();
  const { loaded, loading } = aaState;

  const [plot1_num, plot2_num] = nums?.split("-").map(Number) || [];

  const isValidPlotNumbers =
    nums && !isNaN(plot1_num) && !isNaN(plot2_num) && Number.isInteger(plot1_num) && Number.isInteger(plot2_num);

  const plot1 = mapUnits.find((unit) => unit.type === "plot" && unit.plot_num === plot1_num);
  const plot2 = mapUnits.find((unit) => unit.type === "plot" && unit.plot_num === plot2_num);

  const { data: attestations1, loaded: plot1AttestationLoaded } = useAttestations(plot1?.owner);
  const { data: attestations2, loaded: plot2AttestationLoaded } = useAttestations(plot2?.owner);

  if (loading || !loaded || !inited) {
    return (
      <div className="text-lg text-center min-h-[75vh] mt-10">
        <Loader className="mx-auto mb-5 w-14 h-14 animate-spin" />
      </div>
    );
  }

  if (!isValidPlotNumbers || plot1 === undefined || plot2 === undefined) {
    return (
      <div className="text-lg text-center min-h-[75vh] mt-10">
        <CircleXIcon className="w-10 h-10 mx-auto mb-5" />
        <h1 className="mb-5 text-4xl font-extrabold tracking-tight scroll-m-20 lg:text-5xl">Error</h1>

        <div className="text-lg text-center">Invalid plot numbers</div>
      </div>
    );
  }

  const mayor: string = aaState.state.city_city?.mayor!;

  const roads = getRoads(mapUnits, String(mayor));

  const [address1] = getAddressFromNearestRoad(
    roads,
    {
      x: plot1.x,
      y: plot1.y,
    },
    plot1.plot_num
  );

  const [address2] = getAddressFromNearestRoad(
    roads,
    {
      x: plot2.x,
      y: plot2.y,
    },
    plot2.plot_num
  );

  const url = generateLink({
    amount: 1e4,
    aa: appConfig.AA_ADDRESS!,
    is_single: true,
    data: { build: 1, plot1_num, plot2_num },
    from_address: walletAddress || undefined,
  });

  const seoDescription =
    "You became neighbors and can claim your reward house and plot — while getting to know your neighbor";

  const discordAttestation1 = attestations1.find((att) => att.name === "discord")?.value;
  const discordAttestation2 = attestations2.find((att) => att.name === "discord")?.value;
  const tgAttestation1 = attestations1.find((att) => att.name === "telegram")?.value;
  const tgAttestation2 = attestations2.find((att) => att.name === "telegram")?.value;
  const infoName1 = typeof plot1.info === "object" ? plot1.info?.name : "";
  const infoName2 = typeof plot2.info === "object" ? plot2.info?.name : "";

  const seoTitle = `Obyte City — You are neighbors: ${infoName1 || tgAttestation1 || discordAttestation1} and ${
    infoName2 || tgAttestation2 || discordAttestation2
  }`;

  const shownSkeleton = loading || !loaded || !inited;

  return (
    <>
      <Helmet>
        <title>{seoTitle}</title>
        <meta name="og:title" content={seoTitle} />
        <meta name="twitter:title" content={seoTitle} />

        <meta name="og:description" content={seoDescription} />
        <meta name="twitter:description" content={seoDescription} />
        <meta name="description" content={seoDescription} />

        <meta property="og:image" content={`${appConfig.OG_IMAGE_URL}/og/claim`} />
      </Helmet>

      <div className="grid grid-cols-5 gap-6 px-4 md:px-0">
        <div className="col-span-5 md:col-span-3">
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">Your neighboring plots</h2>
            </CardHeader>
            <CardContent>
              <div ref={gameColumnRef}>
                {!shownSkeleton ? (
                  <PhaserGame
                    ref={phaserRef}
                    gameOptions={{ displayMode: "claim", params, claimNeighborPlotNumbers: [plot1_num, plot2_num] }}
                  />
                ) : (
                  <div className="game-container-placeholder">
                    <Skeleton className="w-full h-[80vh] rounded-xl" />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="col-span-5 md:col-span-2">
          <div className="grid grid-cols-1 gap-8">
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold">Claim your reward</h2>
                <CardDescription>
                  Both neighbors must submit their claims within 10 minutes of each other. Please contact with one
                  another.
                </CardDescription>
              </CardHeader>

              <CardContent>
                <QRButton href={url}>Claim</QRButton>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold">{address1}</h2>
              </CardHeader>
              <CardContent className="flex flex-col items-center">
                <InfoPanel className="w-full">
                  <InfoPanel.Item label="Owner">
                    <a
                      href={getExplorerUrl(plot1.owner!, "address")}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-link"
                    >
                      <span className="inline-block xl:hidden">
                        {plot1.owner!.slice(0, 5)}...{plot1.owner!.slice(-5, plot1.owner!.length)}
                      </span>
                      <span className="hidden xl:inline-block">{plot1.owner}</span>
                    </a>
                  </InfoPanel.Item>

                  <InfoPanel.Item label="Coordinates">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger className="cursor-text">
                          <div className="font-mono">
                            ({plot1?.x},{plot1?.y})
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <div>
                            X: {plot1?.x}, Y: {plot1?.y}
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </InfoPanel.Item>

                  <InfoPanel.Item
                    label="Attested contacts"
                    tooltipText="Please, use special bot for attestation"
                    loading={!loaded || !plot1AttestationLoaded}
                  >
                    {attestations1.length ? (
                      <AttestationList blockDisplay data={attestations1} />
                    ) : (
                      <div className="text-gray-500">No attested contacts</div>
                    )}
                  </InfoPanel.Item>

                  {plot1.info ? (
                    <div className="text-sm">
                      <div className="mt-4 mb-1 font-semibold">Additional information</div>
                      {typeof plot1.info === "string" ? (
                        <InfoPanel.Item label="Information">
                          <div className="inline">{plot1.info}</div>
                        </InfoPanel.Item>
                      ) : (
                        Object.entries(plot1.info)
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
                </InfoPanel>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold">{address2}</h2>
              </CardHeader>
              <CardContent className="flex flex-col items-center">
                <InfoPanel className="w-full">
                  <InfoPanel.Item label="Owner">
                    <a
                      href={getExplorerUrl(plot2.owner!, "address")}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-link"
                    >
                      <span className="inline-block xl:hidden">
                        {plot2.owner!.slice(0, 5)}...{plot2.owner!.slice(-5, plot2.owner!.length)}
                      </span>
                      <span className="hidden xl:inline-block">{plot2.owner}</span>
                    </a>
                  </InfoPanel.Item>

                  <InfoPanel.Item label="Coordinates">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger className="cursor-text">
                          <div className="font-mono">
                            ({plot2?.x},{plot2?.y})
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <div>
                            X: {plot2?.x}, Y: {plot2?.y}
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </InfoPanel.Item>

                  <InfoPanel.Item
                    label="Attested contacts"
                    tooltipText="Please, use special bot for attestation"
                    loading={!loaded || !plot2AttestationLoaded}
                  >
                    {attestations2.length ? (
                      <AttestationList blockDisplay data={attestations2} />
                    ) : (
                      <div className="text-gray-500">No attested contacts</div>
                    )}
                  </InfoPanel.Item>

                  {plot2.info ? (
                    <div className="text-sm">
                      <div className="mt-4 mb-1 font-semibold">Additional information</div>
                      {typeof plot2.info === "string" ? (
                        <InfoPanel.Item label="Information">
                          <div className="inline">{plot2.info}</div>
                        </InfoPanel.Item>
                      ) : (
                        Object.entries(plot2.info)
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
                </InfoPanel>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default ClaimRedirectPage;

