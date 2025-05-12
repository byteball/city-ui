import { FC, useMemo } from "react";

import { IAttestation } from "@/hooks/useAttestations";
import { getContactUrlByUsername } from "@/lib/getContactUrlByUsername";

import appConfig from "@/appConfig";

interface IAttestationProps {
  data: IAttestation[];
  blockDisplay?: boolean;
  isOwner?: boolean;
}

interface IAttestationItemProps extends IAttestation {
  blockDisplay?: boolean;
}

export const AttestationList: FC<IAttestationProps> = ({ data, isOwner = false, blockDisplay = false }) => {
  const Wrapper = blockDisplay ? "div" : "span";

  const discordAttestation = useMemo(() => data.find((attestation) => attestation.name === "discord"), [data]);
  const telegramAttestation = useMemo(() => data.find((attestation) => attestation.name === "telegram"), [data]);

  return (
    <Wrapper>
      {data.map((attestation) => {
        return (
          <AttestationItem
            {...attestation}
            blockDisplay={blockDisplay}
            key={attestation.name + "-" + attestation.value}
          />
        );
      })}

      {!discordAttestation && isOwner ? (
        <Wrapper>
          discord:{" "}
          <a className="text-link" href={appConfig.DISCORD_BOT_URL}>
            set up
          </a>
        </Wrapper>
      ) : null}

      {!telegramAttestation && isOwner ? (
        <Wrapper>
          telegram:{" "}
          <a className="text-link" href={appConfig.TELEGRAM_BOT_URL}>
            set up
          </a>
        </Wrapper>
      ) : null}
    </Wrapper>
  );
};

const AttestationItem: FC<IAttestationItemProps> = ({ blockDisplay, name, value, userId }) => {
  const Wrapper = blockDisplay ? "div" : "span";
  const url = getContactUrlByUsername(value, name, userId);

  return (
    <Wrapper className="mr-4 last:mr-0">
      {url ? (
        <a className="text-link" target="_blank" rel="noopener" href={url}>
          {name}: {value}
        </a>
      ) : (
        <span>
          {name}: {value}
        </span>
      )}
    </Wrapper>
  );
};
