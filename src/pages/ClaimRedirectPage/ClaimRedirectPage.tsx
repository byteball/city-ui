import { CircleXIcon, Loader } from "lucide-react";
import { useRef } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useNavigate, useParams } from "react-router";

import { generateLink, getAddressFromNearestRoad, toLocalString } from "@/lib";
import { useSettingsStore } from "@/store/settings-store";

import { getRoads } from "@/engine/utils/getRoads";
import { useAttestations } from "@/hooks/useAttestations";
import { useAaParams, useAaStore } from "@/store/aa-store";
import { mapUnitsSelector } from "@/store/selectors/mapUnitsSelector";

import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { IRefPhaserMapEngine, PhaserMapEngine } from "@/engine/PhaserMapEngine";

import { InfoPanel } from "@/components/ui/_info-panel";
import { QRButton } from "@/components/ui/_qr-button";

import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { IPlot } from "@/global";
import { getContactUrlByUsername } from "@/lib/getContactUrlByUsername";
import { SocialIcon } from "../MainPage/components/SocialIcon";

import appConfig from "@/appConfig";

const ClaimRedirectPage = () => {
  const { walletAddress, inited, decimals, symbol } = useSettingsStore((state) => state);

  const aaState = useAaStore((state) => state);
  const { nums } = useParams<{ nums: string }>();
  const mapUnits = mapUnitsSelector(aaState);
  const engineColumnRef = useRef<HTMLDivElement>(null);
  const phaserRef = useRef<IRefPhaserMapEngine | null>(null);
  const params = useAaParams();
  const navigation = useNavigate();

  const { loaded, loading } = aaState;

  const [plot1_num, plot2_num] = nums?.split("-").map(Number) || [];

  const isValidPlotNumbers =
    nums && !isNaN(plot1_num) && !isNaN(plot2_num) && Number.isInteger(plot1_num) && Number.isInteger(plot2_num);

  const plot1 = mapUnits.find((unit) => unit.type === "plot" && unit.plot_num === plot1_num) as IPlot;
  const plot2 = mapUnits.find((unit) => unit.type === "plot" && unit.plot_num === plot2_num) as IPlot;

  const { data: attestations1, loaded: plot1AttestationLoaded } = useAttestations(plot1?.owner);
  const { data: attestations2, loaded: plot2AttestationLoaded } = useAttestations(plot2?.owner);

  if (loading || !loaded || !inited) {
    return (
      <div className="text-lg text-center min-h-[75vh] mt-10">
        <Loader className="mx-auto mb-5 w-14 h-14 animate-spin" />
      </div>
    );
  }

  if (inited && loaded && (plot1 === undefined || plot2 === undefined)) {
    navigation("/");
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

  const discordAttestation1 = attestations1.find((att) => att.name === "discord");
  const discordAttestation2 = attestations2.find((att) => att.name === "discord");
  const tgAttestation1 = attestations1.find((att) => att.name === "telegram");
  const tgAttestation2 = attestations2.find((att) => att.name === "telegram");
  const infoName1 = typeof plot1.info === "object" ? plot1.info?.name : "";
  const infoName2 = typeof plot2.info === "object" ? plot2.info?.name : "";

  const discordAttestation1Url = getContactUrlByUsername(
    discordAttestation1?.value,
    discordAttestation1?.name,
    discordAttestation1?.userId
  );
  const discordAttestation2Url = getContactUrlByUsername(
    discordAttestation2?.value,
    discordAttestation2?.name,
    discordAttestation2?.userId
  );

  const telegramAttestation1Url = getContactUrlByUsername(
    tgAttestation1?.value,
    tgAttestation1?.name,
    tgAttestation1?.userId
  );
  const telegramAttestation2Url = getContactUrlByUsername(
    tgAttestation2?.value,
    tgAttestation2?.name,
    tgAttestation2?.userId
  );

  const seoTitle = `Obyte City — You are neighbors: ${infoName1 || tgAttestation1?.value || discordAttestation1?.value
    } and ${infoName2 || tgAttestation2?.value || discordAttestation2?.value}`;

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
              <h2 className="text-xl font-semibold">You became neighbors!</h2>
            </CardHeader>
            <CardContent>
              <div ref={engineColumnRef}>
                {!shownSkeleton ? (
                  <PhaserMapEngine
                    ref={phaserRef}
                    engineOptions={{
                      displayMode: "claim",
                      params,
                      claimNeighborPlotNumbers: [plot1_num, plot2_num],
                      isReferral: plot2.ref_plot_num === plot1.plot_num || plot2.ref == plot1.owner,
                    }}
                  />
                ) : (
                  <div className="engine-container-placeholder">
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
                <h2 className="text-xl font-semibold">Claim your rewards</h2>
                <CardDescription>
                  <div>
                    You and your neighbor receive houses on your plots and 2 new plots with{" "}
                    <b>
                      {toLocalString(Math.min(plot1.amount, plot2.amount) / 10 ** decimals!)} {symbol!}
                    </b>{" "}
                    on each of them. Please contact your neighbor over discord or telegram and send your claim requests
                    within 10 minutes of each other.
                  </div>
                </CardDescription>

                <InfoPanel>
                  <InfoPanel.Item loading={!plot1AttestationLoaded || !plot2AttestationLoaded} label="Discord">
                    <span className="text-white">
                      <HoverCard>
                        {discordAttestation1?.displayName ? <HoverCardContent align="center" className="text-white" side="top">
                          <div>Username: {discordAttestation1.value}</div>
                        </HoverCardContent> : null}
                        <HoverCardTrigger>
                          {discordAttestation1Url ? (
                            <a href={discordAttestation1Url} target="_blank" rel="noopener" className="text-link">
                              {discordAttestation1?.value ?? "?"}
                            </a>
                          ) : (
                            <span>{discordAttestation1?.value ?? "?"}</span>
                          )}
                        </HoverCardTrigger>
                      </HoverCard>
                      {" "}and{" "}
                      <HoverCard>
                        {discordAttestation2?.displayName ? <HoverCardContent align="center" className="text-white" side="top">
                          <div>Username: {discordAttestation2.value}</div>
                        </HoverCardContent> : null}
                        <HoverCardTrigger>
                          {discordAttestation2Url ? (
                            <a href={discordAttestation2Url} target="_blank" rel="noopener" className="text-link">
                              {discordAttestation2?.value ?? "?"}
                            </a>
                          ) : (
                            <span>{discordAttestation2?.value ?? "?"}</span>
                          )}
                        </HoverCardTrigger>
                      </HoverCard>
                    </span>
                  </InfoPanel.Item>

                  <InfoPanel.Item loading={!plot1AttestationLoaded || !plot2AttestationLoaded} label="Telegram">
                    <span className="text-white">
                      <HoverCard>
                        {tgAttestation1?.displayName ? <HoverCardContent align="center" className="text-white" side="top">
                          <div>Username: {tgAttestation1.value}</div>
                        </HoverCardContent> : null}
                        <HoverCardTrigger>
                          {telegramAttestation1Url ? (
                            <a href={telegramAttestation1Url} target="_blank" rel="noopener" className="text-link">
                              {tgAttestation1?.value ?? "?"}
                            </a>
                          ) : (
                            <span>{tgAttestation1?.value ?? "?"}</span>
                          )}
                        </HoverCardTrigger>
                      </HoverCard>
                      {" "}and{" "}
                      <HoverCard>
                        {tgAttestation2?.displayName ? <HoverCardContent align="center" className="text-white" side="top">
                          <div>Username: {tgAttestation2.value}</div>
                        </HoverCardContent> : null}
                        <HoverCardTrigger>
                          {telegramAttestation2Url ? (
                            <a href={telegramAttestation2Url} target="_blank" rel="noopener" className="text-link">
                              {tgAttestation2?.value ?? "?"}
                            </a>
                          ) : (
                            <span>{tgAttestation2?.value ?? "?"}</span>
                          )}
                        </HoverCardTrigger>
                      </HoverCard>
                    </span>
                  </InfoPanel.Item>
                </InfoPanel>
              </CardHeader>

              <CardContent>
                <QRButton href={url}>Claim</QRButton>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold">
                  <Link to={`/?plot=${plot1.plot_num}`} className="text-link">
                    {address1}
                  </Link>
                </h2>
              </CardHeader>
              <CardContent className="flex flex-col items-center">
                <InfoPanel className="w-full">
                  <InfoPanel.Item label="Owner">
                    <a href={`/user/${plot1.owner}`} className="text-link">
                      <span className="inline-block xl:hidden">
                        {plot1.owner!.slice(0, 5)}...{plot1.owner!.slice(-5, plot1.owner!.length)}
                      </span>
                      <span className="hidden xl:inline-block">{plot1.owner}</span>
                    </a>
                  </InfoPanel.Item>

                  <InfoPanel.Item label="Contacts" loading={loading || !plot1AttestationLoaded}>
                    {attestations1.length ? (
                      <div className="flex gap-4">
                        {attestations1.map((a) => {
                          const url = getContactUrlByUsername(a.value, a.name, a.userId);

                          return (
                            <div
                              className="flex items-center justify-between gap-1"
                              key={a.name + "-" + a.value + "-" + plot1.owner}
                            >
                              <SocialIcon type={a.name} />{" "}
                              <HoverCard>
                                {a.displayName ? <HoverCardContent align="center" className="text-white" side="top">
                                  <div>Username: {a.value}</div>
                                </HoverCardContent> : null}
                                <HoverCardTrigger>
                                  {url ? (
                                    <a href={url} target="_blank" rel="noopener" className="text-link">
                                      {a.displayName ?? a.value}
                                    </a>
                                  ) : (
                                    <div>{a.displayName ?? a.value}</div>
                                  )}
                                </HoverCardTrigger>
                              </HoverCard>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <span>No attested contacts</span>
                    )}
                  </InfoPanel.Item>
                </InfoPanel>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold">
                  <Link to={`/?plot=${plot2.plot_num}`} className="text-link">
                    {address2}
                  </Link>
                </h2>
              </CardHeader>

              <CardContent className="flex flex-col items-center">
                <InfoPanel className="w-full">
                  <InfoPanel.Item label="Owner">
                    <a href={`/user/${plot2.owner}`} className="text-link">
                      <span className="inline-block xl:hidden">
                        {plot2.owner!.slice(0, 5)}...{plot2.owner!.slice(-5, plot2.owner!.length)}
                      </span>
                      <span className="hidden xl:inline-block">{plot2.owner}</span>
                    </a>
                  </InfoPanel.Item>

                  <InfoPanel.Item label="Contacts" loading={loading || !plot2AttestationLoaded}>
                    {attestations2.length ? (
                      <div className="flex gap-4">
                        {attestations2.map((a) => {
                          const url = getContactUrlByUsername(a.value, a.name, a.userId);

                          return (
                            <div
                              className="flex items-center justify-between gap-1"
                              key={a.name + "-" + a.value + "-" + plot2.owner}
                            >
                              <SocialIcon type={a.name} />{" "}
                              <HoverCard>
                                {a.displayName ? <HoverCardContent align="center" className="text-white" side="top">
                                  <div>Username: {a.value}</div>
                                </HoverCardContent> : null}
                                <HoverCardTrigger>
                                  {url ? (
                                    <a href={url} target="_blank" rel="noopener" className="text-link">
                                      {a.displayName ?? a.value}
                                    </a>
                                  ) : (
                                    <div>{a.displayName ?? a.value}</div>
                                  )}
                                </HoverCardTrigger>
                              </HoverCard>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <span>No attested contacts</span>
                    )}
                  </InfoPanel.Item>
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

