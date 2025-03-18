import { FC, KeyboardEvent, useCallback, useMemo, useRef, useState } from "react";

import { generateLink, toLocalString } from "@/lib";
import { useSettingsStore } from "@/store/settings-store";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { QRButton } from "../ui/_qr-button";
import appConfig from "@/appConfig";
import { getCountOfDecimals } from "@/lib/getCountOfDecimals";
import { mapUnitsByCoordinatesSelector } from "@/store/selectors/mapUnitsSelector";
import { useAaStore } from "@/store/aa-store";
import { ICoordinates } from "@/global";

interface ISellPlotDialogProps {
  children: React.ReactNode;
}

export const SellPlotDialog: FC<ISellPlotDialogProps> = ({ children }) => {
  const [amount, setAmount] = useState<string>("");
  const putBtnRef = useRef<HTMLButtonElement>(null);

  const { symbol, decimals, inited } = useSettingsStore();

  const decimalsFactor = 10 ** decimals!;

  const walletAddressFromStore = useSettingsStore((state) => state.walletAddress);
  const selectedMapUnitCoordinates = useSettingsStore((state) => state.selectedMapUnit);

  const [selectedMapUnit] = useAaStore((state) => mapUnitsByCoordinatesSelector(state, selectedMapUnitCoordinates as ICoordinates | null));

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

  const handleKeyDawn = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        putBtnRef.current?.click();
      }
    },
    [putBtnRef]
  );

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
      return `Amount  cannot exceed ${toLocalString(selectedMapUnit.amount / decimalsFactor)}`;
    }

    return false;
  }, [amount, decimalsFactor, selectedMapUnit.amount]);

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Put your land up for sale</DialogTitle>
          {/* <DialogDescription>
            <a href="https://obyte.org/#download" target="_blank" className="text-link">
              Install Obyte wallet
            </a>{" "}
            if you don't have one yet, and copy/paste your address here.{" "}
          </DialogDescription> */}
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex flex-col space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input id="amount" error={error} onKeyDown={handleKeyDawn} suffix={symbol} onChange={handleChange} value={amount} />
          </div>
        </div>
        <DialogFooter>
          <QRButton ref={putBtnRef} disabled={!inited || !!error || !amount} className="w-full" href={url}>
            Put up
          </QRButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

