import { ChangeEvent, FC, KeyboardEvent, useCallback, useRef, useState } from "react";

import { QRButton } from "@/components/ui/_qr-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { IHouse } from "@/global";
import { generateLink } from "@/lib";
import { useSettingsStore } from "@/store/settings-store";

import appConfig from "@/appConfig";
import { useAaParams } from "@/store/aa-store";
import { Link } from "react-router";

interface IShortcodeFormProps {
  unitData: IHouse;
}

export const ShortcodeForm: FC<IShortcodeFormProps> = ({ unitData }) => {
  const currentShortcode = unitData.shortcode || "";
  const [shortcode, setShortcode] = useState<string>(currentShortcode);
  const { plot_price } = useAaParams();
  const walletAddress = useSettingsStore((state) => state.walletAddress);
  const btnRef = useRef<HTMLButtonElement>(null);

  const mayorHouse = unitData.amount < 0;
  const isTooCheap = unitData.amount < plot_price;
  const shortcodeMoreThan20Characters = shortcode.length > 20;

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^A-Za-z0-9_-]/g, "").toUpperCase();
    setShortcode(value);
  };

  const url = generateLink({
    amount: 10000,
    data: {
      shortcode: shortcode || undefined,
      edit_house: 1,
      house_num: unitData.house_num,
      release_shortcode: shortcode.length === 0 ? 1 : undefined,
    },
    from_address: walletAddress!,
    aa: appConfig.AA_ADDRESS,
    asset: "base",
    is_single: true,
  });

  const disabled = currentShortcode === shortcode || shortcodeMoreThan20Characters || mayorHouse || isTooCheap;

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (!disabled && e.key === "Enter") {
        btnRef.current?.click();
      }
    },
    [btnRef, disabled]
  );

  if (mayorHouse || isTooCheap) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Edit shortcode</h3>

        <p className="text-sm text-red-800 text-muted-foreground">
          {mayorHouse
            ? "Mayor houses cannot be assigned shortcodes"
            : "Shortcode cannot be assigned to houses with a price lower than the plot price"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="mb-6">
        <h3 className="text-lg font-medium">Edit shortcode</h3>
        <p className="text-sm text-muted-foreground">
          You can edit or set up shortcode here, which will be <b>publicly published</b> in the DAG and linked to this
          house.
        </p>
      </div>

      {currentShortcode ? (
        <div>
          <div>
            Your current shortcode is: <b>{currentShortcode}</b>.
          </div>{" "}
          If you want to sell your shortcode, please go to the{" "}
          <Link to="/market" className="text-link">
            shortcode market page
          </Link>{" "}
        </div>
      ) : null}

      <div>
        <Label htmlFor="shortcode" className="text-sm font-medium">
          Shortcode
        </Label>

        <div className="space-y-8">
          <Input
            id="shortcode"
            autoFocus
            onKeyDown={handleKeyDown}
            error={shortcodeMoreThan20Characters ? "Please enter a shortcode with 20 characters or fewer" : false}
            value={shortcode}
            onChange={handleChange}
          />

          {shortcode.length === 0 && currentShortcode ? (
            <p className="text-sm text-red-800 text-muted-foreground">
              You have left the field empty. Are you certain you wish to delete the current shortcode?
            </p>
          ) : null}

          <div>
            <QRButton ref={btnRef} href={url} disabled={disabled}>
              Create new
            </QRButton>
          </div>
        </div>
      </div>
    </div>
  );
};

