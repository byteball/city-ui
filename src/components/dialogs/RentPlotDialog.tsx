import cn from "classnames";
import { FC, KeyboardEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";

import { generateLink, toLocalString } from "@/lib";
import { setWalletAddress, useSettingsStore } from "@/store/settings-store";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { QRButton } from "../ui/_qr-button";
import appConfig from "@/appConfig";
import { getCountOfDecimals } from "@/lib/getCountOfDecimals";
import { mapUnitsByCoordinatesSelector } from "@/store/selectors/mapUnitsSelector";
import { useAaParams, useAaStore } from "@/store/aa-store";
import { ICoordinates } from "@/global";
import { InfoPanel } from "../ui/_info-panel";
import { use } from "matter";
import moment from "moment";

interface IRentPlotDialogProps {
  children: React.ReactNode;
}

export const RentPlotDialog: FC<IRentPlotDialogProps> = ({ children }) => {
  const [amount, setAmount] = useState<string>("");
  const putBtnRef = useRef<HTMLButtonElement>(null);

  const { symbol, decimals, asset, inited } = useSettingsStore();

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
    [putBtnRef.current]
  );

  let error = useMemo(() => {
    if (amount !== "" && Number(amount) <= 0) {
      return `Amount should be greater than 0`;
    }

    return false;
  }, [amount]);

  const { plot_price, matching_probability, rental_surcharge_factor } = useAaParams();
  const state = useAaStore((state) => state.state);
  const city = state.city_city!;

  const count_bought = city.total_bought / plot_price;
  const rented_amount = selectedMapUnit.type === "plot" ? selectedMapUnit?.rented_amount ?? 0 : 0;

  const total_working =
    city.total_land +
    city.total_rented +
    Number(amount) * 10 ** decimals! -
    (selectedMapUnit.type === "plot" ? selectedMapUnit.rented_amount ?? 0 : 0);

  const timestamp = moment.utc().unix();
  const elapsed = timestamp - city.start_ts;

  const year = 365 * 24 * 3600;

  const count_buys_next_year = (year / elapsed) * count_bought;

  // income is overestimated if rental amount is large while $plot.amount is small, then the $plot.amount would be used in full before the year expires
  const income_from_one_buy = (2 * plot_price * matching_probability * Number(amount) * 10 ** decimals!) / total_working;

  const year_income = income_from_one_buy * count_buys_next_year;

  const rental_fee = Math.ceil(rental_surcharge_factor * year_income);

  let unused_rent = 0;

  if (selectedMapUnit.type === "plot") {
    const rented_amount = selectedMapUnit.rented_amount ?? 0;
    const rental_expiry_ts = selectedMapUnit.rental_expiry_ts ?? 0;

    if (Number(amount) * 10 ** decimals! < (selectedMapUnit.rented_amount ?? 0)) {
      error = "Rental amount cannot be decreased";
    } else if (timestamp < rental_expiry_ts) {
      unused_rent = Math.floor((rented_amount * (rental_expiry_ts - timestamp)) / year);
    }
  }

  const required_fee = (rental_fee - unused_rent) * 1.01;

  const url = generateLink({
    amount: required_fee,
    data: { rent: 1, plot_num: 8, rented_amount: Number(amount) * 10 ** (decimals ?? 0) },
    from_address: walletAddressFromStore!,
    aa: appConfig.AA_ADDRESS,
    asset: asset!,
    is_single: true,
  });

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Rent additional land around your plot</DialogTitle>
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

        <InfoPanel>
          <InfoPanel.Item label="Rented amount">
            {toLocalString(amount + rented_amount / 10 ** decimals!)} {symbol}
          </InfoPanel.Item>
          <InfoPanel.Item label="Total amount">
            {toLocalString(selectedMapUnit.amount / 10 ** decimals! + Number(amount))} {symbol}
          </InfoPanel.Item>
          <InfoPanel.Item label="Unused rent">
            {toLocalString(unused_rent / 10 ** decimals!)} {symbol}
          </InfoPanel.Item>
          <InfoPanel.Item label="Total fee">
            {toLocalString(required_fee / 10 ** decimals!)} {symbol}
          </InfoPanel.Item>
        </InfoPanel>

        <DialogFooter>
          <DialogClose asChild>
            <div className="w-full">
              <QRButton ref={putBtnRef} disabled={!inited || !!error || !amount} className="w-full" href={url}>
                Send {toLocalString(required_fee / 10 ** decimals!)} {symbol}
              </QRButton>
              <div className="mt-2 text-gray-400 text-foreground">
                <small>We added 1% to reduce the risk of a debounce. It will be back.</small>
              </div>
            </div>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

