import { FC } from "react";

import { IAttestation } from "@/hooks/useAttestations";
import { getContactUrlByUsername } from "@/lib/getContactUrlByUsername";
import { SocialIcon } from "@/pages/MainPage/components/SocialIcon";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "./hover-card";

import appConfig from "@/appConfig";

interface IContractFieldProps {
  attestations: IAttestation[];
  unknownPlug?: ""
  showDiscordLink?: boolean;
  showTgLink?: boolean;
}

export const ContactField: FC<IContractFieldProps> = ({ attestations, unknownPlug = "", showDiscordLink = false, showTgLink = false }) => {

  if (attestations.length === 0 && !showDiscordLink && !showTgLink) {
    return <span>No attested contacts</span>;
  }

  return (<div className="flex gap-4">
    {attestations.map((a) => {
      const url = getContactUrlByUsername(a.value, a.name, a.userId);

      return (
        <div className="flex items-center justify-between gap-1" key={a.name + "-" + a.value + "-"}>
          <SocialIcon type={a.name} />{" "}
          <HoverCard>
            {a.displayName ? <HoverCardContent align="center" className="text-white" side="top">
              <div>Username: {a.value}</div>
            </HoverCardContent> : null}
            <HoverCardTrigger asChild>
              {url ? (
                <a href={url} target="_blank" rel="noopener" className="text-link">
                  {a.displayName ?? a.value ?? unknownPlug}
                </a>
              ) : (
                <span className="cursor-default">{a.displayName ?? a.value ?? unknownPlug}</span>
              )}
            </HoverCardTrigger>
          </HoverCard>
        </div>
      );
    })}

    {showDiscordLink ? <div className="flex items-center justify-between gap-1">
      <SocialIcon type="discord" />{" "}
      <a href={appConfig.DISCORD_BOT_URL} className="text-link">
        Set up
      </a>
    </div> : null}

    {showTgLink ? <div className="flex items-center justify-between gap-1">
      <SocialIcon type="telegram" />{" "}
      <a href={appConfig.TELEGRAM_BOT_URL} className="text-link">
        Set up
      </a>
    </div> : null}
  </div>)
}