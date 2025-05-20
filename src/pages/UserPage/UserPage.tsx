import obyte from "obyte";
import { FC } from "react";
import { Navigate, useParams } from "react-router";

import { PageLayout } from "@/components/layout/page-layout";
import { useAaStore } from "@/store/aa-store";
import { useSettingsStore } from "@/store/settings-store";

import { UserHouses, UserPlots, UserStats } from "./components";
import { UserInfo } from "./components/UserInfo";

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
    // Helmet in UserInfo component
    <PageLayout title="User page" loading={loading}>
      <UserInfo address={address} />
      <UserStats address={address} />
      <UserPlots address={address} />
      <UserHouses address={address} />
    </PageLayout>
  );
};

export default UserPage;

