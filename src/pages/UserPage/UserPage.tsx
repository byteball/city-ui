import obyte from "obyte";
import { Navigate, useParams } from "react-router";

import { PageLayout } from "@/components/layout/page-layout";
import { InfoPanel } from "@/components/ui/_info-panel";
import { useAaStore } from "@/store/aa-store";
import { useSettingsStore } from "@/store/settings-store";
import { UserStats } from "./UserStats";
import { UserPlots } from "./UserPlots";
import appConfig from "@/appConfig";
import { UserHouses } from "./UserHouses";

export default () => {
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
          <a className="text-link" target="_blank" href={`https://${appConfig.TESTNET ? 'testnet' : ''}explorer.obyte.org/address/${address}`}>
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

