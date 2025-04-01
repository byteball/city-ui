import { ChangeEvent, FC, useState } from "react";

import { QRButton } from "@/components/ui/_qr-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { IMapUnit } from "@/global";
import { generateLink } from "@/lib";
import { useSettingsStore } from "@/store/settings-store";

import appConfig from "@/appConfig";

interface IShortcodeFormProps {
  defaultValue?: string;
  plotNum: number;
  unitData: IMapUnit;
}

export const ShortcodeForm: FC<IShortcodeFormProps> = ({ defaultValue = "", plotNum }) => {
  const [shortcode, setShortcode] = useState<string>(defaultValue);

  const walletAddress = useSettingsStore((state) => state.walletAddress);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.trim().toUpperCase();

    setShortcode(value);
  };

  const url = generateLink({
    amount: 10000,
    data: { shortcode, plot_num: plotNum },
    from_address: walletAddress!,
    aa: appConfig.AA_ADDRESS,
    asset: "base",
    is_single: true,
  });

  return (
    <div className="z-50">
      <div>
        <Label htmlFor="shortcode" className="text-sm font-medium">
          Shortcode
        </Label>

        <div className="space-y-8">
          <Input id="shortcode" value={shortcode} onChange={handleChange} />

          <QRButton href={url}>Send</QRButton>
        </div>
      </div>
    </div>
  );
};

