import { FC } from "react";

import { IAttestation } from "@/hooks/useAttestations";
import { getContactUrlByUsername } from "@/lib/getContactUrlByUsername";

interface IAttestationProps {
  data: IAttestation[];
}

export const AttestationList: FC<IAttestationProps> = ({ data }) => (
  <div className="space-x-4">
    {data.map((attestation, index) => {
      const url = getContactUrlByUsername(attestation.value, attestation.name, attestation.userId);

      if (!url)
        return (
          <span key={index}>
            {attestation.value} ({attestation.name})
          </span>
        );

      return (
        <a key={index} className="text-link" target="_blank" rel="noopener" href={url}>
          {attestation.value} ({attestation.name})
        </a>
      );
    })}
  </div>
);

