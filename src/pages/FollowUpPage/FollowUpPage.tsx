import { Loader } from "lucide-react";
import { useMemo, useRef } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useParams } from "react-router";

import { asNonNegativeNumber, generateLink, getAddressFromNearestRoad, toLocalString } from "@/lib";
import { useSettingsStore } from "@/store/settings-store";

import { getRoads } from "@/engine/utils/getRoads";
import { useAttestations } from "@/hooks/useAttestations";
import { useAaParams, useAaStore } from "@/store/aa-store";
import { mapUnitsSelector } from "@/store/selectors/mapUnitsSelector";

import { ContactField } from "@/components/ui/_contact-field";
import { InfoPanel } from "@/components/ui/_info-panel";
import { QRButton } from "@/components/ui/_qr-button";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Skeleton } from "@/components/ui/skeleton";
import { IRefPhaserMapEngine, PhaserMapEngine } from "@/engine/PhaserMapEngine";

import { IEngineOptions, IHouse, IUnitUniqData } from "@/global";
import { getContactUrlByUsername } from "@/lib/getContactUrlByUsername";
import { IMatch } from "@/lib/getMatches";

import appConfig from "@/appConfig";
import { getFollowUp } from "@/lib/getFollowUp";
import { InvalidHouseAlert } from "./components/InvalidHouseAlert";
import { NotFound } from "./components/NotFound";
import { FOLLOWUP_CLAIM_TERM, FOLLOWUP_REWARD_DAYS, getDaysSinceNeighboring, getFollowupRewardStatus, getFollowupRewardTier, TFollowUpRewardTier } from "./utils";

const FollowUpPage = () => {
  const { walletAddress, inited, decimals, symbol } = useSettingsStore((state) => state);

  const aaState = useAaStore((state) => state);
  const { nums } = useParams<{ nums: string }>();
  const mapUnits = mapUnitsSelector(aaState);
  const engineColumnRef = useRef<HTMLDivElement>(null);
  const phaserRef = useRef<IRefPhaserMapEngine | null>(null);
  const params = useAaParams();
  const lastPlotNum = aaState.state.state?.last_plot_num ?? null;
  const nCount = useSettingsStore((s) => s.notifications.length);
  const countView = nCount > 0 ? `(${nCount}) ` : "";

  const { loaded, loading } = aaState;

  const [house1_num, house2_num] = nums?.split("-").map(Number) || [];

  const isValidPlotNumbers =
    nums && !isNaN(house1_num) && !isNaN(house2_num) && Number.isInteger(house1_num) && Number.isInteger(house2_num) && house2_num > house1_num;
  const house1 = mapUnits.find((unit) => unit.type === "house" && unit.house_num === house1_num) ?? null as IHouse | null;
  const house2 = mapUnits.find((unit) => unit.type === "house" && unit.house_num === house2_num) ?? null as IHouse | null;

  const { data: attestations1, loaded: plot1AttestationLoaded } = useAttestations(house1?.owner);
  const { data: attestations2, loaded: plot2AttestationLoaded } = useAttestations(house2?.owner);

  const match = aaState.state[`match_${house1?.plot_num}_${house2?.plot_num}`] as IMatch | undefined;

  // Hooks for skeleton display and engine options must be at top level before any return
  const shownSkeleton = loading || !loaded || !inited;

  const engineOptions = useMemo(() => ({
    displayMode: "followup" as const,
    params,
    displayedUnits: [{ type: "house", num: asNonNegativeNumber(house1_num) }, { type: "house", num: asNonNegativeNumber(house2_num) }] as IUnitUniqData[],
  } as IEngineOptions), [params, house1_num, house2_num, house1?.plot_num, house1?.owner]);


  if (loading || !loaded || !inited || lastPlotNum === null) {
    return (
      <div className="text-lg text-center min-h-[75vh] mt-10">
        <Loader className="mx-auto mb-5 w-14 h-14 animate-spin" />
      </div>
    );
  } else if (!isValidPlotNumbers) {
    return <InvalidHouseAlert />;
  } else if (!house1 || !house2 || !match) {
    return <NotFound />
  }

  const followup = getFollowUp(aaState, house1_num, house2_num);
  const daysSinceNeighboring = getDaysSinceNeighboring(match);
  const rewardTier: TFollowUpRewardTier = getFollowupRewardTier(daysSinceNeighboring);
  const followupRewardStatus = getFollowupRewardStatus(match, followup);
  const forwardReward = followup?.reward ?? params.followup_reward_share * house1.amount;

  const mayor: string = aaState.state.city_city?.mayor!;

  const roads = getRoads(mapUnits, String(mayor));

  const [address1] = getAddressFromNearestRoad(
    roads,
    {
      x: house1.x,
      y: house1.y,
    },
    house1.plot_num
  );

  const [address2] = getAddressFromNearestRoad(
    roads,
    {
      x: house2.x,
      y: house2.y,
    },
    house2.plot_num
  );

  const url = generateLink({
    amount: 1e4,
    aa: appConfig.AA_ADDRESS!,
    is_single: true,
    data: { days: String(FOLLOWUP_REWARD_DAYS[rewardTier! - 1]), house1_num, house2_num, followup: 1 },
    from_address: walletAddress || undefined,
  });

  const seoDescription =
    "Claim your follow-up rewards for being a good neighbor!";

  const discordAttestation1 = attestations1.find((att) => att.name === "discord");
  const discordAttestation2 = attestations2.find((att) => att.name === "discord");

  const tgAttestation1 = attestations1.find((att) => att.name === "telegram");
  const tgAttestation2 = attestations2.find((att) => att.name === "telegram");

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

  const seoTitle = `Obyte City — Follow-up rewards`;
  const titleWithNotifications = countView + seoTitle;

  return (
    <>
      <Helmet>
        <title>{titleWithNotifications}</title>
        <meta name="og:title" content={seoTitle} />
        <meta name="twitter:title" content={seoTitle} />

        <meta name="og:description" content={seoDescription} />
        <meta name="twitter:description" content={seoDescription} />
        <meta name="description" content={seoDescription} />

        <meta property="og:image" content={`${appConfig.OG_IMAGE_URL}/og/followup`} />
      </Helmet>

      <div className="grid grid-cols-5 gap-6 px-4 md:px-0">
        <div className="col-span-5 md:col-span-3">
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">Claim your follow-up rewards!</h2>
            </CardHeader>
            <CardContent>
              <div ref={engineColumnRef}>
                {!shownSkeleton ? (
                  <PhaserMapEngine
                    ref={phaserRef}
                    engineOptions={engineOptions}
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
                <h2 className="text-xl font-semibold">
                  Claim your {followupRewardStatus === 'GOT_ALL' ? '' : `${rewardTier}st`} follow-up rewards
                </h2>
                <CardDescription>
                  {followupRewardStatus === 'NOT_STARTED' ? <div>
                    You became neighbors only {daysSinceNeighboring} days ago. The 1st follow-up reward becomes available after 60 days. Please check back in {60 - daysSinceNeighboring} days to claim your reward.
                  </div> : null}

                  {followupRewardStatus === 'ACTIVE' ? <div>
                    You became neighbors {daysSinceNeighboring} days ago and are now eligible for your {rewardTier}st follow-up reward, {toLocalString(forwardReward / 10 ** decimals!)} {symbol} to each of you. Please contact your neighbor over discord or telegram and send your claim requests within 10 minutes of each other.
                  </div> : null}

                  {followupRewardStatus === 'GOT' ? <div>
                    You’ve already claimed your {rewardTier}st follow-up reward. No additional reward is available at this time.
                  </div> : null}

                  {followupRewardStatus === 'GOT_ALL' ? <div>
                    You’ve now completed the follow-up program.
                  </div> : null}

                  {followupRewardStatus === 'EXPIRED' ? <div>
                    The {FOLLOWUP_CLAIM_TERM}-days window for sending claim requests has passed. Please wait for the next follow-up reward milestone.

                    Next follow-up reward will be available after {FOLLOWUP_REWARD_DAYS[rewardTier!]} days.
                  </div> : null}
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
                              {discordAttestation1?.displayName ?? discordAttestation1?.value ?? "?"}
                            </a>
                          ) : (
                            <span>{discordAttestation1?.displayName ?? discordAttestation1?.value ?? "?"}</span>
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
                              {discordAttestation2?.displayName ?? discordAttestation2?.value ?? "?"}
                            </a>
                          ) : (
                            <span>{discordAttestation2?.displayName ?? discordAttestation2?.value ?? "?"}</span>
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
                              {tgAttestation1?.displayName ?? tgAttestation1?.value ?? "?"}
                            </a>
                          ) : (
                            <span>{tgAttestation1?.displayName ?? tgAttestation1?.value ?? "?"}</span>
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
                              {tgAttestation2?.displayName ?? tgAttestation2?.value ?? "?"}
                            </a>
                          ) : (
                            <span>{tgAttestation2?.displayName ?? tgAttestation2?.value ?? "?"}</span>
                          )}
                        </HoverCardTrigger>
                      </HoverCard>
                    </span>
                  </InfoPanel.Item>
                </InfoPanel>
              </CardHeader>

              <CardContent>
                <QRButton href={url} disabled={followupRewardStatus !== "ACTIVE"}>Claim</QRButton>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold">
                  <Link to={`/?house=${house1.plot_num}`} className="text-link">
                    {address1}
                  </Link>
                </h2>
              </CardHeader>
              <CardContent className="flex flex-col items-center">
                <InfoPanel className="w-full">
                  <InfoPanel.Item label="Owner">
                    <a href={`/user/${house1.owner}`} className="text-link">
                      <span className="inline-block xl:hidden">
                        {house1.owner!.slice(0, 5)}...{house1.owner!.slice(-5, house1.owner!.length)}
                      </span>
                      <span className="hidden xl:inline-block">{house1.owner}</span>
                    </a>
                  </InfoPanel.Item>

                  <InfoPanel.Item label="Contacts" loading={loading || !plot1AttestationLoaded}>
                    <ContactField attestations={attestations1} />
                  </InfoPanel.Item>
                </InfoPanel>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold">
                  <Link to={`/?house=${house2.plot_num}`} className="text-link">
                    {address2}
                  </Link>
                </h2>
              </CardHeader>

              <CardContent className="flex flex-col items-center">
                <InfoPanel className="w-full">
                  <InfoPanel.Item label="Owner">
                    <a href={`/user/${house2.owner}`} className="text-link">
                      <span className="inline-block xl:hidden">
                        {house2.owner!.slice(0, 5)}...{house2.owner!.slice(-5, house2.owner!.length)}
                      </span>
                      <span className="hidden xl:inline-block">{house2.owner}</span>
                    </a>
                  </InfoPanel.Item>

                  <InfoPanel.Item label="Contacts" loading={loading || !plot2AttestationLoaded}>
                    <ContactField attestations={attestations2} />
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

export default FollowUpPage;
