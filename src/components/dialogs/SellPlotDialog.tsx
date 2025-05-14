import { FC, KeyboardEvent, useCallback, useMemo, useRef, useState } from "react";

import { generateLink, getCountOfDecimals, toLocalString } from "@/lib";
import { useAaParams, useAaStore } from "@/store/aa-store";
import { mapUnitsByUniqDataSelector } from "@/store/selectors/mapUnitsSelector";
import { useSettingsStore } from "@/store/settings-store";
import { InfoPanel } from "../ui/_info-panel";
import { QRButton } from "../ui/_qr-button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

import appConfig from "@/appConfig";

interface ISellPlotDialogProps {
  children: React.ReactNode;
}

export const SellPlotDialog: FC<ISellPlotDialogProps> = ({ children }) => {
  const [amount, setAmount] = useState<string>("");
  const putBtnRef = useRef<HTMLButtonElement>(null);

  const { symbol, decimals, inited } = useSettingsStore();
  const { p2p_sale_fee } = useAaParams();

  const decimalsFactor = 10 ** decimals!;

  const walletAddressFromStore = useSettingsStore((state) => state.walletAddress);
  const selectedMapUnitUniqData = useSettingsStore((state) => state.selectedMapUnit);

  const selectedMapUnit = useAaStore((state) => mapUnitsByUniqDataSelector(state, selectedMapUnitUniqData || null));

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

  if (!selectedMapUnit || selectedMapUnit.type !== "plot") return null;

  const url = generateLink({
    amount: 10000,
    data: { sell: 1, plot_num: selectedMapUnit.plot_num, sale_price: Number(amount) * 10 ** (decimals ?? 0) },
    from_address: walletAddressFromStore!,
    aa: appConfig.AA_ADDRESS,
    asset: "base",
    is_single: true,
  });

  const error = useMemo(() => {
    if (Number(amount) && Number(amount) * decimalsFactor < selectedMapUnit.amount) {
      return `It doesn't exceed ${toLocalString(selectedMapUnit.amount / decimalsFactor)}`;
    }

    return false;
  }, [amount, decimalsFactor, selectedMapUnit]);

  const fee = p2p_sale_fee * decimalsFactor * Number(amount);
  const finalPrice = Number(amount) * decimalsFactor - fee;

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Put your land on sale</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex flex-col space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              error={error}
              onKeyDown={handleKeyDown}
              suffix={symbol}
              onChange={handleChange}
              value={amount}
            />
          </div>
        </div>
        <InfoPanel>
          {selectedMapUnit.sale_price ? (
            <InfoPanel.Item label="Current price" loading={!inited} textClamp>
              {toLocalString(selectedMapUnit.sale_price / decimalsFactor)} {symbol}
            </InfoPanel.Item>
          ) : null}

          <InfoPanel.Item label="p2p fee 1%" loading={!inited} textClamp>
            {toLocalString(fee / decimalsFactor)} {symbol}
          </InfoPanel.Item>

          <InfoPanel.Item label="You will receive" loading={!inited} textClamp>
            {toLocalString(finalPrice / decimalsFactor)} {symbol}
          </InfoPanel.Item>
        </InfoPanel>
        <DialogFooter>
          <QRButton ref={putBtnRef} disabled={!inited || !!error || !amount} className="w-full" href={url}>
            Put on sale
          </QRButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

