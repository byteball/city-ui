import obyte from "obyte";
import { FC } from "react";
import { Navigate, useParams } from "react-router";

import { PageLayout } from "@/components/layout/page-layout";
import { InfoPanel } from "@/components/ui/_info-panel";
import { getExplorerUrl } from "@/lib/getExplorerUrl";
import { useAaStore } from "@/store/aa-store";
import { useSettingsStore } from "@/store/settings-store";
import { UserHouses } from "./UserHouses";
import { UserPlots } from "./UserPlots";
import { UserStats } from "./UserStats";

interface UserPageProps {}

const UserPage: FC<UserPageProps> = () => {
  const { address } = useParams<{ address: string }>();
  const inited = useSettingsStore((state) => state.inited);
  const stateLoaded = useAaStore((state) => state.loaded);

  if (!address || !obyte.utils.isValidAddress(address)) {
    return <Navigate to="/not-found" replace />;
  }

  const loading = !inited || !stateLoaded;

  return (
    <PageLayout title="User page" loading={loading}>
      <InfoPanel>
        <InfoPanel.Item label="Address" loading={loading}>
          <a className="text-link" target="_blank" rel="noopener" href={getExplorerUrl(address, "address")}>
            {address}
          </a>
        </InfoPanel.Item>
      </InfoPanel>

      <UserStats address={address} />

      <UserPlots address={address} />

      <UserHouses address={address} />
    </PageLayout>
  );
};

export default UserPage;
