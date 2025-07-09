import obyte from "obyte";
import { FC, useMemo } from "react";
import { Navigate, useParams } from "react-router";

import { PageLayout } from "@/components/layout/page-layout";
import { useAaStore } from "@/store/aa-store";
import { useSettingsStore } from "@/store/settings-store";

import { useAttestations } from "@/hooks/useAttestations";
import { UserHouses, UserPlots, UserStats } from "./components";
import { UserInfo } from "./components/UserInfo";

const ATTESTATION_MAX_LENGTH = 14; // max length of attestation to display in title

interface UserPageProps { }

const UserPage: FC<UserPageProps> = () => {
  const { address } = useParams<{ address: string }>();
  const inited = useSettingsStore((state) => state.inited);
  const stateLoaded = useAaStore((state) => state.loaded);

  if (!address || !obyte.utils.isValidAddress(address)) {
    return <Navigate to="/not-found" replace />;
  }

  const { data, loaded: attestationsLoaded } = useAttestations(address);
  const loading = !inited || !stateLoaded || !attestationsLoaded;

  const shortestAttestation = useMemo(() => {
    if (!data?.length) return undefined;
    return [...data].reduce((acc, cur) =>
      cur.value.length < acc.value.length ? cur : acc
    ).value;
  }, [data]);

  let title = `${String(address).slice(0, 5)}...${String(address).slice(-5, String(address).length)}'s profile`;

  if (attestationsLoaded && shortestAttestation) {
    title = `${(shortestAttestation).slice(0, ATTESTATION_MAX_LENGTH)}'s profile`;
  }

  return (
    // Helmet in UserInfo component
    <PageLayout ignoreSeo title={attestationsLoaded ? title : ''} loading={loading}>
      <UserInfo address={address} />
      <UserStats address={address} />
      <UserHouses address={address} />
      <UserPlots address={address} />
    </PageLayout>
  );
};

export default UserPage;

