import { UserPenIcon } from "lucide-react";
import { FC, useMemo } from "react";

import { EditUserInfoDialog } from "@/components/dialogs/EditUserInfoDialog";
import { InfoPanel } from "@/components/ui/_info-panel";
import { ButtonWithTooltip } from "@/components/ui/ButtonWithTooltip";
import { IMapUnitInfo } from "@/global";
import { useAttestations } from "@/hooks/useAttestations";
import { getExplorerUrl } from "@/lib";
import { useAaStore } from "@/store/aa-store";
import { useSettingsStore } from "@/store/settings-store";
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

  return (
    <div>
      <InfoPanel>
        <InfoPanel.Item label="Address">
          <a className="text-link" target="_blank" rel="noopener" href={getExplorerUrl(address, "address")}>
            {address}
          </a>
        </InfoPanel.Item>

        <InfoPanel.Item label="Main plot">
          <UserMainPlot address={address} />
        </InfoPanel.Item>

        <InfoPanel.Item
          label="Linked accounts"
          tooltipText="Use attestation bots to link your telegram and discord accounts to your Obyte address and receive notifications when you get a neighbor."
          loading={!loaded}
        >
          <AttestationList isOwner={address === walletAddress} data={attestations} />
        </InfoPanel.Item>

        <InfoPanel.Item>
          <h2 className="mt-4 text-xl font-semibold">
            Additional user information{" "}
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
          <div className="text-gray-500">No information available</div>
        )}
      </InfoPanel>
    </div>
  );
};

