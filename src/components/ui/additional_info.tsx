import { FC } from "react";

import { InfoPanel } from "./_info-panel";

import { getSocialUrl } from "@/lib/getSocialUrl";

interface IAdditionalInfoProps {
  info?: string | object;
  itemsType?: 'div' | 'info-panel';
  loading?: boolean;
  limit?: number;
}

export const AdditionalInfo: FC<IAdditionalInfoProps> = ({ info, itemsType = 'div', loading = false, limit = 8 }) => {
  if (!info) return null;

  const ItemWrapper = itemsType === 'info-panel' ? InfoPanel.Item : 'div';

  if (typeof info === "string") {
    return <ItemWrapper>{info}</ItemWrapper>;
  }

  if (typeof info !== "object") return null;

  const entries = Object.entries(info)
    .filter(([_, value]) => value != null)
    .sort(([keyA], [keyB]) => {
      if (keyA === 'name') return -1;
      if (keyB === 'name') return 1;
      const endA = keyA === 'website' || keyA === 'homepage';
      const endB = keyB === 'website' || keyB === 'homepage';
      if (endA && !endB) return 1;
      if (!endA && endB) return -1;

      return 0;
    });

  if (entries.length === 0) return null;

  return <>
    {entries.slice(0, limit).map(([key, value]) => {
      const itemWrapperProps = itemsType === 'info-panel' ? { loading, className: "overflow-hidden", textClamp: true, label: key === "homepage" ? "" : key } : {};
      const linkProps = { rel: "noopener", className: "text-link text-ellipsis overflow-hidden w-[100%] inline-block text-nowrap", target: "_blank" };

      const url = getSocialUrl(key, value?.toString());
      const haveUrl = !!url;

      return (
        <ItemWrapper key={key} {...itemWrapperProps}>
          {haveUrl ? (
            <a href={url} {...linkProps}>
              {value}
            </a>
          ) : (
            value ?? ""
          )}
        </ItemWrapper>
      );
    })}
  </>
}