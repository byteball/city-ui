import obyte from "obyte";
import { ChangeEvent, FC, KeyboardEvent, useCallback, useEffect, useRef, useState } from "react";

import { QRButton } from "@/components/ui/_qr-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { useAaParams, useAaStore } from "@/store/aa-store";
import { shortcodesSelector } from "@/store/selectors/shortcodesSelector";
import { useSettingsStore } from "@/store/settings-store";

import { IHouse } from "@/global";
import { generateLink } from "@/lib";

import appConfig from "@/appConfig";
import { Link } from "react-router";

interface IShortcodeFormProps {
  unitData: IHouse;
}

export const ShortcodeForm: FC<IShortcodeFormProps> = ({ unitData }) => {
  const currentShortcode = unitData.shortcode?.toLowerCase() || "";
  const [shortcode, setShortcode] = useState<string>(currentShortcode);
  const { plot_price } = useAaParams();
  const walletAddress = useSettingsStore((state) => state.walletAddress);
  const [address, setAddress] = useState<string | null>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const existingShortcodes = useAaStore((state) => shortcodesSelector(state.state));

  const mayorHouse = unitData.amount < 0;
  const isTooCheap = unitData.amount < plot_price;
  const shortcodeMoreThan20Characters = shortcode.length > 20;
  const isTaken = (shortcode in existingShortcodes) && currentShortcode !== shortcode;

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^A-Za-z0-9_.-]/g, "").toLowerCase();
    setShortcode(value);
  };

  useEffect(() => {
    setAddress(existingShortcodes[shortcode] || null);
  }, [existingShortcodes]);

  let to;
  const newShortcodeAddressIsValid = address && obyte.utils.isValidAddress(address);

  if (shortcode && shortcode.length > 0 && newShortcodeAddressIsValid) {
    if (address !== walletAddress) {
      to = address;
    }
  }

  const url = generateLink({
    amount: 10000,
    data: {
      shortcode: shortcode || undefined,
      edit_house: 1,
      house_num: unitData.house_num,
      release_shortcode: shortcode.length === 0 ? 1 : undefined,
      to,
    },
    from_address: walletAddress!,
    aa: appConfig.AA_ADDRESS,
    asset: "base",
    is_single: true,
  });

  const disabled =
    shortcodeMoreThan20Characters || mayorHouse || isTooCheap || isTaken || (address && (!newShortcodeAddressIsValid || unitData.owner === address)) || address === existingShortcodes[shortcode];

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
          Assign a unique shortcode to your house. It can be used instead of your Obyte address to send tokens to you,
          or you can sell the shortcode for profit.
        </p>
      </div>

      <div>
        <Label htmlFor="shortcode" className="text-sm font-medium">
          Shortcode
        </Label>

        <div className="space-y-4">
          <Input
            id="shortcode"
            autoFocus
            onKeyDown={handleKeyDown}
            error={
              shortcodeMoreThan20Characters
                ? "Please enter a shortcode with 20 characters or fewer"
                : (isTaken && currentShortcode !== shortcode)
                  ? "This shortcode is already taken"
                  : ""
            }
            value={shortcode}
            onChange={handleChange}
          />

          <div>
            <Label htmlFor="address" className="text-sm font-medium">
              Address (leave empty to use your profile address {walletAddress?.slice(0, 4)}...)
            </Label>

            <Input
              id="address"
              error={!!address && !obyte.utils.isValidAddress(address)}
              onKeyDown={handleKeyDown}
              onChange={(e) => setAddress(e.target.value)}
              value={address || ""}
            />
          </div>

          <div className="mt-8">
            {shortcode.length === 0 && currentShortcode ? (
              <div className="mb-4">
                <p className="text-sm text-red-800 text-muted-foreground">
                  You have left the field empty. Are you certain you wish to delete the current shortcode?
                </p>
              </div>
            ) : null}

            <div>
              <QRButton ref={btnRef} href={url} disabled={!!disabled}>
                {currentShortcode && shortcode.length === 0 ? "Release shortcode" : "Assign"}
              </QRButton>
            </div>
          </div>

          <div>
            <p className="text-xs text-muted-foreground">
              If you want to use a shortcode that is already taken, you might be able to buy it on the{" "}
              <Link to="/market" className="text-link">
                market page
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

