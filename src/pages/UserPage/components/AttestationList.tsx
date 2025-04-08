import { FC } from "react";

import { IAttestation } from "@/hooks/useAttestations";
import { getContactUrlByUsername } from "@/lib/getContactUrlByUsername";

interface IAttestationProps {
  data: IAttestation[];
  blockDisplay?: boolean;
}

export const AttestationList: FC<IAttestationProps> = ({ data, blockDisplay = false }) => {
  const Wrapper = blockDisplay ? "div" : "span";

  return (
    <Wrapper>
      {data.map((attestation) => {
        const url = getContactUrlByUsername(attestation.value, attestation.name, attestation.userId);

        return (
          <Wrapper className="mr-4 last:mr-0" key={attestation.name + "-" + attestation.value}>
            {url ? (
              <a className="text-link" target="_blank" rel="noopener" href={url}>
                {attestation.value} ({attestation.name})
              </a>
            ) : (
              <span>
                {attestation.value} ({attestation.name})
              </span>
            )}
          </Wrapper>
        );
      })}
    </Wrapper>
  );
};

