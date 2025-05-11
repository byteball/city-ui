import { FC, KeyboardEvent, useCallback, useMemo, useRef, useState } from "react";

import appConfig from "@/appConfig";
import { generateLink, getCountOfDecimals, toLocalString } from "@/lib";
import { useAaParams, useAaStore } from "@/store/aa-store";
import { mapUnitsByCoordinatesSelector } from "@/store/selectors/mapUnitsSelector";
import { useSettingsStore } from "@/store/settings-store";
import { Link } from "react-router";
import { InfoPanel } from "../ui/_info-panel";
import { QRButton } from "../ui/_qr-button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

interface IShortCodeManageDialog {
  children: React.ReactNode;
  plot_num: number;
  shortcode: string;
}
export const ShortCodeSellDialog: FC<IShortCodeManageDialog> = ({ children, plot_num, shortcode }) => {
  const [amount, setAmount] = useState<string>("");
  const putBtnRef = useRef<HTMLButtonElement>(null);

  const { symbol, decimals, inited } = useSettingsStore();
  const { p2p_sale_fee } = useAaParams();

  const decimalsFactor = 10 ** decimals!;

  const walletAddressFromStore = useSettingsStore((state) => state.walletAddress);
  const selectedMapUnitCoordinates = useSettingsStore((state) => state.selectedMapUnit);

  const selectedMapUnit = useAaStore((state) => mapUnitsByCoordinatesSelector(state, selectedMapUnitCoordinates!));

  if (selectedMapUnit?.type !== "house") throw new Error("Selected map unit is not a house");

  const url = generateLink({
    amount: 10000,
    data: {
      house_num: selectedMapUnit.house_num,
      edit_house: 1,

      sell_shortcode: 1,
      shortcode_price: Number(amount) * 10 ** (decimals ?? 0),
    },
    from_address: walletAddressFromStore!,
    aa: appConfig.AA_ADDRESS,
    asset: "base",
    is_single: true,
  });

  const error = useMemo(() => {
    // if (Number(amount) && Number(amount) * decimalsFactor < selectedMapUnit.amount) {
    //   return `It doesn't exceed ${toLocalString(selectedMapUnit.amount / decimalsFactor)}`;
    // }

    return false;
  }, [amount, decimalsFactor, selectedMapUnit]);

  const fee = p2p_sale_fee * decimalsFactor * Number(amount);
  const finalPrice = Number(amount) * decimalsFactor - fee;

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value ?? "";

      if (!value || (decimals && getCountOfDecimals(value) <= decimals && Number(value) <= 100000000)) {
        if (value === "." || value === ",") {
          setAmount("0.");
        } else if (!isNaN(Number(value))) {
          setAmount(value);
        } else {
          console.error("Invalid input");
        }
      }
    },
    [setAmount, decimals]
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        putBtnRef.current?.click();
      }
    },
    [putBtnRef]
  );

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="z-50">
        <DialogHeader>
          <DialogTitle>Sell shortcode</DialogTitle>
          <DialogDescription>
            Shortcodes can be traded peer-to-peer — set any price you want. To buy one, visit the{" "}
            <Link className="text-link" to="/market">
              Market page
            </Link>{" "}
            and browse listings from other users.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="flex flex-col mt-4 space-y-2">
            <Label htmlFor="amount">Price</Label>
            <Input
              id="amount"
              error={error}
              onKeyDown={handleKeyDown}
              suffix={symbol}
              onChange={handleChange}
              value={amount}
            />
          </div>

          <InfoPanel>
            {selectedMapUnit.shortcode_price ? (
              <InfoPanel.Item label="Current price" loading={!inited} textClamp>
                {toLocalString(selectedMapUnit.shortcode_price / decimalsFactor)} {symbol}
              </InfoPanel.Item>
            ) : null}

            <InfoPanel.Item label="p2p fee" loading={!inited} textClamp>
              {toLocalString(fee / decimalsFactor)} {symbol}
            </InfoPanel.Item>

            <InfoPanel.Item label="You will receive" loading={!inited} textClamp>
              {toLocalString(finalPrice / decimalsFactor)} {symbol}
            </InfoPanel.Item>
          </InfoPanel>

          <QRButton ref={putBtnRef} href={url}>
            Put on sale
          </QRButton>
        </div>
      </DialogContent>
    </Dialog>
  );
};

