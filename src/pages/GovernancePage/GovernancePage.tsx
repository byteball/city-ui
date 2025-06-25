import { PageLayout } from "@/components/layout/page-layout";
import { GovernanceProfile } from "./GovernanceProfile";

import { GovernanceParamItem } from "@/components/ui/_governance-param-item";
import { NonNegativeNumber, paramName } from "@/global";
import { useAaParams, useAaStore } from "@/store/aa-store";
import { votesSelector } from "@/store/selectors/votesSelector";
import { useSettingsStore } from "@/store/settings-store";

export default () => {
  const { asset, decimals, inited } = useSettingsStore((state) => state);
  const stateVarsLoaded = useAaStore((state) => state.loaded);
  const allowedParams: paramName[] = [
    "matching_probability",
    "plot_price",
    "referral_boost",
    "randomness_aa",
    "randomness_price",
    "p2p_sale_fee",
    "shortcode_sale_fee",
    "rental_surcharge_factor",
    "followup_reward_share",
    "attestors",
    "mayor",
  ];
  const governanceState = useAaStore((state) => state.governanceState);
  const votesByValue = useAaStore(votesSelector);

  const currentParamValue = useAaParams();

  return (
    <PageLayout
      title="Governance"
      ogImageKey="governance"
      loading={!inited || !asset || decimals === null || !stateVarsLoaded}
      seoDescription="Governance of Obyte City, a community engagement space for Obyte"
    >
      <div className="max-w-4xl">
        <GovernanceProfile />

        <div className="grid gap-4 mt-12">
          {allowedParams.map((name) => (
            <GovernanceParamItem
              name={name}
              key={name}
              votes={votesByValue?.[name + (name === "mayor" ? '|city' : '')] ?? {}}
              currentValue={currentParamValue[name]}
              leader={governanceState[`leader_${name}`] as string | undefined | NonNegativeNumber}
            />
          ))}
        </div>
      </div>
    </PageLayout>
  );
};

