import { ContactField } from "@/components/ui/_contact-field";
import { InfoPanel } from "@/components/ui/_info-panel";
import { useAttestations } from "@/hooks/useAttestations";
import { FC } from "react";

interface INeighborContactProps {
  address: string;
}

export const NeighborContacts: FC<INeighborContactProps> = ({ address }) => {
  const { data: attestations, loaded } = useAttestations(address);

  return <InfoPanel>
    <InfoPanel.Item loading={!loaded}>
      <ContactField attestations={attestations} />
    </InfoPanel.Item>
  </InfoPanel>
}