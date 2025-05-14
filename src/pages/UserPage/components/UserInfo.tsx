import { CheckIcon, CopyIcon, UserPenIcon } from "lucide-react";
import { FC, useMemo, useState } from "react";
import { CopyToClipboard } from "react-copy-to-clipboard";

import { EditUserInfoDialog } from "@/components/dialogs/EditUserInfoDialog";
import { SetUserMainPlotDialog } from "@/components/dialogs/SetUserMainPlotDialog";
import { InfoPanel } from "@/components/ui/_info-panel";
import { Button } from "@/components/ui/button";
import { ButtonWithTooltip } from "@/components/ui/ButtonWithTooltip";
import { IMapUnitInfo, IPlot } from "@/global";
import { useAttestations } from "@/hooks/useAttestations";
import { getExplorerUrl } from "@/lib";
import { getReferralUrl } from "@/lib/getReferralUrl";
import { useAaStore } from "@/store/aa-store";
import { useSettingsStore } from "@/store/settings-store";
import cn from "classnames";
import { AttestationList } from "./AttestationList";
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
  const userMainPlotNum = useAaStore((state) => state.state[`user_main_plot_city_${address}`]) as number | undefined;
  const mainPlot = useAaStore((state) =>
    userMainPlotNum ? state.state[`plot_${userMainPlotNum}`] : null
  ) as IPlot | null;

  const [copied, setCopied] = useState(false);

  const referralUrl = getReferralUrl(userMainPlotNum);

  const copy = () => {
    if (copied) return;

    setCopied(() => {
      setTimeout(() => {
        setCopied(false);
      }, 2000);
      return true;
    });
  };

  return (
    <div>
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
          <AttestationList isOwner={address === walletAddress} data={attestations} />
        </InfoPanel.Item>

        <InfoPanel.Item label="Main plot">
          <UserMainPlot address={address} />
        </InfoPanel.Item>

        <InfoPanel.Item
          label="Referral link"
          tooltipText="When other users use your referral link to buy a new plot, your main plot’s matching area expands by 10% of the total matching area of all plots. This increases the probability that the new user will become your neighbor."
        >
          {referralUrl ? (
            <CopyToClipboard text={referralUrl} onCopy={copy}>
              <div className={cn("flex items-center space-x-2 cursor-pointer", { "text-green-400": copied })}>
                <div className="underline underline-offset-4">{referralUrl}</div>{" "}
                {copied ? <CheckIcon className="w-4 h-4 stroke-green-400" /> : <CopyIcon className="w-4 h-4" />}
              </div>
            </CopyToClipboard>
          ) : walletAddress === address ? (
            <SetUserMainPlotDialog plotNum={userMainPlotNum}>
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
                {Object.entries(parsedUserInfo).map(([key, value]) => {
                  return (
                    <InfoPanel.Item key={key} label={key} loading={!loaded}>
                      {value}
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

