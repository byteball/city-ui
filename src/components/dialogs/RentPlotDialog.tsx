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
import { useAaParams, useAaStore } from "@/store/aa-store";
import { ICoordinates } from "@/global";
import { InfoPanel } from "../ui/_info-panel";

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
        setAmount(value === "." || value === "," ? "0." : !isNaN(Number(value)) ? value : amount);
      }
    },
    [setAmount, decimals, amount]
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        putBtnRef.current?.click();
      }
    },
    []
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
  const countBought = city.total_bought / plot_price;
  const rentedAmount = selectedMapUnit.type === "plot" ? selectedMapUnit?.rented_amount ?? 0 : 0; 
  const amountInSmallestUnit = Number(amount) * 10 ** decimals!;
  const totalWorking = city.total_land + city.total_rented + amountInSmallestUnit - (selectedMapUnit.type === "plot" ? selectedMapUnit.rented_amount ?? 0 : 0);
  const timestamp = moment.utc().unix();
  const elapsed = timestamp - city.start_ts;
  const year = 365 * 24 * 3600;
  const countBuysNextYear = (year / elapsed) * countBought;

  const incomeFromOneBuy = (2 * plot_price * matching_probability * amountInSmallestUnit) / totalWorking;
  const yearIncome = incomeFromOneBuy * countBuysNextYear;
  const rental_fee = Math.ceil(rental_surcharge_factor * yearIncome);
  let unusedRent = 0;

  if (selectedMapUnit.type === "plot") {
    const rentalExpiryTs = selectedMapUnit.rental_expiry_ts ?? 0;
    if (timestamp < rentalExpiryTs) {
      unusedRent = Math.floor((rentedAmount * (rentalExpiryTs - timestamp)) / year);
      if (amountInSmallestUnit && (amountInSmallestUnit < (selectedMapUnit.rented_amount ?? 0))) {
        error =  `Rental amount cannot be decreased. Min value is ${toLocalString(rentedAmount / 10 ** decimals!)} ${symbol}`;
      }
    }
  }

  const requiredFee = (rental_fee * 1.01 - unusedRent);
  if (requiredFee > amountInSmallestUnit) {
    error = "Not enough paid for rental fee";
  }

  const url = generateLink({
    amount: requiredFee,
    data: {
      rent: 1,
      plot_num: selectedMapUnit.plot_num,
      rented_amount: amountInSmallestUnit,
    },
    from_address: walletAddressFromStore!,
    aa: appConfig.AA_ADDRESS,
    asset: asset!,
    is_single: true,
  });

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rent additional land around your plot</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex flex-col space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input id="amount" error={error} onKeyDown={handleKeyDown} suffix={symbol} onChange={handleChange} value={amount} />
          </div>
        </div>

        <InfoPanel>
          <InfoPanel.Item label="Rented amount">
            {toLocalString(Number(amount || '0') + rentedAmount / 10 ** decimals!)} {symbol}
          </InfoPanel.Item>
          <InfoPanel.Item label="Total amount">
            {toLocalString(selectedMapUnit.amount / 10 ** decimals! + Number(amount || '0'))} {symbol}
          </InfoPanel.Item>
          {unusedRent > 0 && (
            <InfoPanel.Item label="Unused rental credit">
              {toLocalString(unusedRent / 10 ** (decimals || 0))} {symbol}
            </InfoPanel.Item>
          )}
          <InfoPanel.Item label="Rental period">
            1 year
          </InfoPanel.Item>
          <InfoPanel.Item label="Total fee">
            {toLocalString(requiredFee / 10 ** decimals!)} {symbol}
          </InfoPanel.Item>
        </InfoPanel>

        <DialogFooter>
          <div className="w-full">
            <QRButton ref={putBtnRef} disabled={!inited || !!error || !amount} className="w-full" href={url}>
              Send {requiredFee > 0 ? toLocalString(requiredFee / 10 ** decimals!) : ''} {symbol}
            </QRButton>
            <div className="mt-2 text-gray-400 text-foreground">
              <small>The fee might slightly change. We added 1%, the excess will be returned to you.</small>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
