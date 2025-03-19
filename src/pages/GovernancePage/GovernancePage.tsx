import { PageLayout } from "@/components/layout/page-layout"
import { GovernanceProfile } from "./GovernanceProfile";

import { useAaStore } from "@/store/aa-store";
import { useSettingsStore } from "@/store/settings-store";

export default () => {
    const { asset, decimals, inited } = useSettingsStore((state) => state);
    const stateVarsLoaded = useAaStore((state) => state.loaded);

    return <PageLayout title="Governance" loading={!inited || !asset || decimals === null || !stateVarsLoaded}>
        <div className="max-w-4xl">
            <GovernanceProfile />
        </div>
    </PageLayout>
}