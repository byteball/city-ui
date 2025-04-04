import { InfoPanel } from "@/components/ui/_info-panel";
import { useAttestations } from "@/hooks/useAttestations";
import { getExplorerUrl } from "@/lib";
import { useAaStore } from "@/store/aa-store";
import { FC, useMemo } from "react";
import { AttestationList } from "./AttestationList";

const getParsedUserInfo = (userInfo?: string | object) => {
  if (!userInfo) return null;

  if (typeof userInfo === "string") {
    try {
      return JSON.parse(userInfo);
    } catch (e) {
      console.error("Failed to parse user info", e);
      return userInfo;
    }
  }
};

interface UserInfoProps {
  address: string;
}

export const UserInfo: FC<UserInfoProps> = ({ address }) => {
  const userInfo = useAaStore((state) => state.state[`user_${address}`]);

  const { data: attestations, loaded } = useAttestations(address);

  const parsedUserInfo: object | string = useMemo(() => getParsedUserInfo(userInfo), [userInfo]);

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
      <div className="md:col-span-3">
        <InfoPanel>
          <InfoPanel.Item label="Address">
            <a className="text-link" target="_blank" rel="noopener" href={getExplorerUrl(address, "address")}>
              {address}
            </a>
          </InfoPanel.Item>

          <InfoPanel.Item label="Attested contacts">
            <AttestationList data={attestations} />
          </InfoPanel.Item>

          {userInfo ? (
            <>
              <InfoPanel.Item>
                <h2 className="mt-4 text-xl font-semibold">User information</h2>
              </InfoPanel.Item>
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
          ) : null}
        </InfoPanel>
      </div>
      <div className="md:col-span-1"></div>
    </div>
  );
};

