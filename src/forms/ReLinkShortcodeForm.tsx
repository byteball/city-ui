import obyte from "obyte";
import { FC, KeyboardEvent, useCallback, useRef, useState } from "react";

import { QRButton } from "@/components/ui/_qr-button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { generateLink } from "@/lib";
import { useSettingsStore } from "@/store/settings-store";

import appConfig from "@/appConfig";

interface ReLinkShortcodeFormProps {
  children?: React.ReactNode;
  shortcode: string;
  houseNum: number;
  currentAddress?: string;
}

export const ReLinkShortcodeForm: FC<ReLinkShortcodeFormProps> = ({
  children,
  shortcode,
  houseNum,
  currentAddress,
}) => {
  const [address, setAddress] = useState<string | undefined>(currentAddress);
  const submitButtonRef = useRef<HTMLButtonElement>(null);

  const { walletAddress, inited } = useSettingsStore((state) => state!);

  const url = generateLink({
    amount: 10000,
    data: { edit_house: 1, shortcode, house_num: Number(houseNum), to: address },
    from_address: walletAddress!,
    aa: appConfig.AA_ADDRESS,
    asset: "base",
    is_single: true,
  });

  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      submitButtonRef.current?.click();
    }
  }, []);

  if (!inited) return null;

  return (
    <Collapsible className="inline">
      <CollapsibleTrigger>{children}</CollapsibleTrigger>
      <CollapsibleContent className="w-full">
        <div className="grid gap-4 p-4 mt-2 mb-4 bg-primary/5 rounded-xl">
          <div>
            <Label htmlFor="adr" className="z-50">
              New address
            </Label>
            <Input
              error={!!address && !obyte.utils.isValidAddress(address)}
              id="adr"
              onKeyDown={handleKeyDown}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>
          <QRButton
            href={url}
            ref={submitButtonRef}
            disabled={!address || !obyte.utils.isValidAddress(address) || address === currentAddress}
          >
            Change
          </QRButton>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

