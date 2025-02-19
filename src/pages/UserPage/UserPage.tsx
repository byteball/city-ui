import obyte from "obyte";
import { Navigate, useParams } from "react-router";

import { PageLayout } from "@/components/layout/page-layout";
import { useAaStore } from "@/store/aa-store";
import { useSettingsStore } from "@/store/settings-store";

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
      UserPage - {address}
    </PageLayout>
  );
};

