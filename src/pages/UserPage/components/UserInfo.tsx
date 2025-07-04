import { CheckIcon, CopyIcon, UserPenIcon } from "lucide-react";
import { FC, useMemo, useState } from "react";
import { CopyToClipboard } from "react-copy-to-clipboard";

import appConfig from "@/appConfig";
import { EditUserInfoDialog } from "@/components/dialogs/EditUserInfoDialog";
import { SetUserMainPlotDialog } from "@/components/dialogs/SetUserMainPlotDialog";
import { ContactField } from "@/components/ui/_contact-field";
import { InfoPanel } from "@/components/ui/_info-panel";
import { Button } from "@/components/ui/button";
import { ButtonWithTooltip } from "@/components/ui/ButtonWithTooltip";
import { IMapUnitInfo } from "@/global";
import { useAttestations } from "@/hooks/useAttestations";
import { getExplorerUrl, toLocalString } from "@/lib";
import { getReferralUrl } from "@/lib/getReferralUrl";
import { useAaParams, useAaStore } from "@/store/aa-store";
import { mapUnitsSelector } from "@/store/selectors/mapUnitsSelector";
import { useSettingsStore } from "@/store/settings-store";
import cn from "classnames";
import { Helmet } from "react-helmet-async";
import { UserMainPlot } from "./UserMainPlot";

const getParsedUserInfo = (userInfo?: string | object) => {
  if (!userInfo) return "";

  if (typeof userInfo === "string") {
    try {
      return JSON.parse(userInfo) as IMapUnitInfo;
    } catch (e) {
      console.error("Failed to parse user info", e);
      return userInfo;
    }
  }
  return userInfo as IMapUnitInfo;
};

interface UserInfoProps {
  address: string;
}

export const UserInfo: FC<UserInfoProps> = ({ address }) => {
  const userInfo = useAaStore((state) => state.state[`user_${address}`]);
  const walletAddress = useSettingsStore((state) => state.walletAddress);
  const { data: attestations, loaded } = useAttestations(address);
  const parsedUserInfo = useMemo(() => getParsedUserInfo(userInfo), [userInfo]);
  const aaState = useAaStore((state) => state);
  const userPlot = mapUnitsSelector(aaState).find((unit) => unit.owner === address && unit.type === "plot");
  const userMainPlotNum = useAaStore((state) => state.state[`user_main_plot_city_${address}`]) as number | undefined;
  const { referral_boost, matching_probability } = useAaParams();
  const [copied, setCopied] = useState(false);

  const referralUrl = (userMainPlotNum || userPlot) ? getReferralUrl(address || null) : null;

  const copy = () => {
    if (copied) return;

    setCopied(() => {
      setTimeout(() => {
        setCopied(false);
      }, 2000);
      return true;
    });
  };

  let title = "";
  let description = "";
  let discordAttestation;
  let tgAttestation;

  if (loaded) {
    discordAttestation = attestations.find((att) => att.name === "discord")?.value;
    tgAttestation = attestations.find((att) => att.name === "telegram")?.value;
    const infoName = typeof parsedUserInfo === "object" ? parsedUserInfo?.name : "";
    const name = infoName || tgAttestation || discordAttestation;

    title = `Obyte City — ${name}'s profile`;
    description = `Personal page of citizen  ${name}, ${walletAddress} in Obyte City, a community engagement space for Obyte`;
  }

  return (
    <div>
      {/* for User page */}
      <Helmet>
        {title ? (
          <>
            <title>{title}</title>
            <meta name="og:title" content={title} />
            <meta name="twitter:title" content={title} />
          </>
        ) : null}

        {description ? (
          <>
            <meta name="og:description" content={description} />
            <meta name="twitter:description" content={description} />
            <meta name="description" content={description} />
          </>
        ) : null}
        <meta property="og:image" content={`${appConfig.OG_IMAGE_URL}/og/user`} />
      </Helmet>
      <InfoPanel>
        <InfoPanel.Item label="Address">
          <a className="text-link" target="_blank" rel="noopener" href={getExplorerUrl(address, "address")}>
            {address}
          </a>
        </InfoPanel.Item>

        <InfoPanel.Item
          label="Linked accounts"
          tooltipText="Use attestation bots to link your telegram and discord accounts to your Obyte address and receive notifications when you get a neighbor."
          loading={!loaded}
        >
          <ContactField
            attestations={attestations}
            showDiscordLink={walletAddress === address && !discordAttestation}
            showTgLink={walletAddress === address && !tgAttestation}
          />
        </InfoPanel.Item>

        <InfoPanel.Item label="Main plot">
          <UserMainPlot address={address} />
        </InfoPanel.Item>

        <InfoPanel.Item
          label="Referral link"
          tooltipText={`When other users use your referral link to buy a new plot, your main plot’s matching area expands by ${toLocalString(referral_boost * 100)}% of the total matching area of all plots. This increases the probability that the new user will become your neighbor and you'll earn rewards. The probability becomes ${toLocalString(matching_probability * referral_boost * 100)}%, so you earn, on average, ${toLocalString(matching_probability * referral_boost * 100)}% of what your referrals spend (without fees), and need, on average, ${Math.round(1 / matching_probability / referral_boost)} referrals to get a neighbor.`}
        >
          {referralUrl ? (
            <CopyToClipboard text={referralUrl} onCopy={copy}>
              <div className={cn("flex items-center space-x-2 cursor-pointer", { "text-green-400": copied })}>
                <div className="underline underline-offset-4">{referralUrl}</div>{" "}
                {copied ? <CheckIcon className="w-4 h-4 stroke-green-400" /> : <CopyIcon className="w-4 h-4" />}
              </div>
            </CopyToClipboard>
          ) : walletAddress === address ? (
            <SetUserMainPlotDialog referralBoost={referral_boost} plotNum={userMainPlotNum}>
              <Button variant="link" className="h-auto p-0 rounded-xl">
                Please set up your main plot first
              </Button>
            </SetUserMainPlotDialog>
          ) : (
            <div className="text-gray-500">Main plot not set up yet</div>
          )}
        </InfoPanel.Item>

        <InfoPanel.Item>
          <h2 className="mt-4 text-xl font-semibold">
            Additional information{" "}
            {address === walletAddress ? (
              <EditUserInfoDialog address={address} info={parsedUserInfo}>
                <ButtonWithTooltip tooltipText="Edit user" variant="link" className="rounded-xl">
                  <UserPenIcon className="w-4 h-4" />
                </ButtonWithTooltip>
              </EditUserInfoDialog>
            ) : null}
          </h2>
        </InfoPanel.Item>

        {userInfo ? (
          <>
            {typeof parsedUserInfo === "string" ? (
              <div>{parsedUserInfo}</div>
            ) : (
              <>
                {Object.entries(parsedUserInfo).sort(([keyA], [keyB]) => keyA === "name" ? -1 : keyB === "name" ? 1 : 0).map(([key, value]) => {
                  return (
                    <InfoPanel.Item key={key} label={key === "homepage" ? "" : key} loading={!loaded}>
                      {String(value).startsWith("https://") || String(value).startsWith("https://") ? (
                        <a href={value?.toString()} rel="noopener" className="text-link" target="_blank">
                          {value}
                        </a>
                      ) : (
                        value ?? ""
                      )}
                    </InfoPanel.Item>
                  );
                })}
              </>
            )}
          </>
        ) : (
          <div className="text-gray-500">No information provided</div>
        )}
      </InfoPanel>
    </div>
  );
};

