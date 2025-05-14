import { CircleXIcon, HandshakeIcon, Loader } from "lucide-react";
import { useParams } from "react-router";

import { generateLink, getAddressFromNearestRoad, getExplorerUrl } from "@/lib";
import { useSettingsStore } from "@/store/settings-store";

import { InfoPanel } from "@/components/ui/_info-panel";
import { QRButton } from "@/components/ui/_qr-button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { getRoads } from "@/game/utils/getRoads";
import { useAttestations } from "@/hooks/useAttestations";
import { useAaStore } from "@/store/aa-store";
import { mapUnitsSelector } from "@/store/selectors/mapUnitsSelector";
import { AttestationList } from "../UserPage/components";

import appConfig from "@/appConfig";
import { Helmet } from "react-helmet-async";

const ClaimRedirectPage = () => {
  const walletAddress = useSettingsStore((state) => state.walletAddress);
  const aaState = useAaStore((state) => state);
  const { nums } = useParams<{ nums: string }>();
  const mapUnits = mapUnitsSelector(aaState);

  const { loaded, loading } = aaState;

  const [plot1_num, plot2_num] = nums?.split("-").map(Number) || [];

  const isValidPlotNumbers =
    nums && !isNaN(plot1_num) && !isNaN(plot2_num) && Number.isInteger(plot1_num) && Number.isInteger(plot2_num);

  const plot1 = mapUnits.find((unit) => unit.type === "plot" && unit.plot_num === plot1_num);
  const plot2 = mapUnits.find((unit) => unit.type === "plot" && unit.plot_num === plot2_num);

  const { data: attestations1, loaded: plot1AttestationLoaded } = useAttestations(plot1?.owner);
  const { data: attestations2, loaded: plot2AttestationLoaded } = useAttestations(plot2?.owner);

  if (loading || !loaded) {
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

  return (
    <>
      <Helmet>
        <title>Obyte City — You are neighbors</title>
      </Helmet>

      <div className="text-lg min-h-[75vh] mt-10">
        <h1 className="mt-12 mb-5 text-4xl font-extrabold tracking-tight text-center scroll-m-20 lg:text-5xl">
          You are neighbors
        </h1>

        <div className="mb-10 text-sm text-center text-muted-foreground">
          Both neighbors must submit their claims within <b>10 minutes</b> of each other.
          <div>Please contact with one another.</div>
        </div>

        <div className="flex flex-col gap-8 mt-12 xl:justify-between xl:flex-row">
          <div className="flex-grow-0 flex-shrink-0 h-full p-4 bg-gray-800 xl:w-1/3 xl:bg-transparent xl:p-0 rounded-xl xl:rounded-none">
            <div>
              <div className="gap-4 mb-8">
                <div className="text-2xl">{address1}</div>
                <div>
                  <a
                    className="underline text-link"
                    href={`/?unit=${plot1.plot_num},plot`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    (View on the map)
                  </a>
                </div>
              </div>

              <div>
                <InfoPanel>
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
                      <AttestationList data={attestations1} />
                    ) : (
                      <div className="text-gray-500">No attested contacts</div>
                    )}
                  </InfoPanel.Item>
                </InfoPanel>

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
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center order-first gap-4 xl:items-start xl:justify-center xl:order-none">
            <HandshakeIcon className="mx-auto mb-2 xl:mb-5 w-14 h-14" />
            <QRButton href={url}>Claim</QRButton>
          </div>

          <div className="flex-grow-0 flex-shrink-0 h-full p-4 bg-gray-800 xl:w-1/3 xl:bg-transparent xl:p-0 rounded-xl xl:rounded-none">
            <div className="h-full">
              <div className="gap-4 mb-8">
                <div className="text-2xl">{address2}</div>
                <div>
                  <a
                    className="underline text-link"
                    href={`/?unit=${plot2.plot_num},plot`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    (View on the map)
                  </a>
                </div>
              </div>

              <div>
                <InfoPanel>
                  <InfoPanel.Item label="Owner">
                    <a
                      href={getExplorerUrl(plot2.owner!, "address")}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="line-clamp-1 text-link"
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
                      <AttestationList data={attestations2} />
                    ) : (
                      <div className="text-gray-500">No attested contacts</div>
                    )}
                  </InfoPanel.Item>
                </InfoPanel>

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
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-center mt-5"></div>
      </div>
    </>
  );
};

export default ClaimRedirectPage;

