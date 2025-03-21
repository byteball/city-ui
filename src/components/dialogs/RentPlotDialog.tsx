import { FC, KeyboardEvent, useCallback, useMemo, useRef, useState } from "react";
import moment from "moment";

import { generateLink, toLocalString } from "@/lib";
import { useSettingsStore } from "@/store/settings-store";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { QRButton } from "../ui/_qr-button";
import { getCountOfDecimals } from "@/lib/getCountOfDecimals";
import { mapUnitsByCoordinatesSelector } from "@/store/selectors/mapUnitsSelector";
import { useAaParams, useAaStore } from "@/store/aa-store";
import { ICoordinates } from "@/global";
import { InfoPanel } from "../ui/_info-panel";

import appConfig from "@/appConfig";

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

  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      putBtnRef.current?.click();
    }
  }, []);

  const decimalsFactor = 10 ** decimals!;

  let error = useMemo(() => {
    if (amount !== "" && Number(amount) <= 0) {
      return `Amount should be greater than 0`;
    }

    return false;
  }, [amount]);

  const { plot_price, matching_probability, rental_surcharge_factor, referral_boost } = useAaParams();
  const state = useAaStore((state) => state.state);
  const city = state.city_city!;
  const countBought = city.total_bought / +plot_price;
  const rentedAmount = selectedMapUnit.type === "plot" ? selectedMapUnit?.rented_amount ?? 0 : 0;
  const amountInSmallestUnit = Number(amount) * decimalsFactor;
  const totalWorking =
    city.total_land + city.total_rented + amountInSmallestUnit - (selectedMapUnit.type === "plot" ? selectedMapUnit.rented_amount ?? 0 : 0);
  const timestamp = moment.utc().unix();
  const elapsed = timestamp - city.start_ts;
  const year = 365 * 24 * 3600;
  const countBuysNextYear = (year / elapsed) * countBought;

  const incomeFromOneBuy = (2 * +plot_price * +matching_probability * amountInSmallestUnit) / totalWorking;
  const yearIncome = incomeFromOneBuy * countBuysNextYear;
  const rental_fee = Math.ceil(+rental_surcharge_factor * yearIncome);
  let unusedRent = 0;
  let rentalExpiryFormatted = "";

  if (selectedMapUnit.type === "plot") {
    const rentalExpiryTs = selectedMapUnit.rental_expiry_ts ?? 0;
    if (timestamp < rentalExpiryTs) {
      unusedRent = Math.floor((rentedAmount * (rentalExpiryTs - timestamp)) / year);
      rentalExpiryFormatted = moment.unix(rentalExpiryTs).format("YYYY-MM-DD HH:mm");

      if (amountInSmallestUnit && amountInSmallestUnit < (selectedMapUnit.rented_amount ?? 0)) {
        error = `Rental amount cannot be decreased. Min value is ${toLocalString(rentedAmount / decimalsFactor)} ${symbol}`;
      }
    }
  }

  const rentalFeeWithMargin = rental_fee * 1.01;
  const isCoveredByUnusedRent = unusedRent >= rentalFeeWithMargin - 0.01;
  
  const minPositiveAmount = 1;
  
  const requiredFee = isCoveredByUnusedRent 
    ? minPositiveAmount 
    : Math.max(minPositiveAmount, rentalFeeWithMargin - unusedRent);

  // Check if the user extends the rental with the same amount
  const isSameAmount = Math.abs(Number(amount) - rentedAmount / decimalsFactor) < 0.001;
  
  // Calculate the increase in area for finding neighbors
  const currentPlotArea = selectedMapUnit.amount + rentedAmount;
  const newPlotArea = selectedMapUnit.amount + amountInSmallestUnit;
  
  // Calculate the share of the plot from the total area
  const oldShare = currentPlotArea / (city.total_land + city.total_rented);
  const newShare = newPlotArea / (city.total_land + city.total_rented - rentedAmount + amountInSmallestUnit);
  
  // Calculate distance according to the contract formula
  const isReferrerMatch = "ref_plot_num" in selectedMapUnit ? 1 : 0;
  const oldDistance = Math.sqrt(1e12 * +matching_probability * (oldShare + isReferrerMatch * +referral_boost)) / 2;
  const newDistance = Math.sqrt(1e12 * +matching_probability * (newShare + isReferrerMatch * +referral_boost)) / 2;
  
  // Percentage distance increase
  const areaIncrease = (newPlotArea / currentPlotArea - 1) * 100;
  const matchingRangeIncrease = (newDistance / oldDistance - 1) * 100;

  // Format text based on the value
  const areaChangeText = areaIncrease > 0 
    ? `~${Math.round(areaIncrease)}% larger` 
    : areaIncrease < 0 
      ? `~${Math.round(Math.abs(areaIncrease))}% smaller` 
      : "unchanged";
      
  const rangeChangeText = matchingRangeIncrease > 0 
    ? `~${Math.round(matchingRangeIncrease)}% farther` 
    : matchingRangeIncrease < 0 
      ? `~${Math.round(Math.abs(matchingRangeIncrease))}% closer` 
      : "unchanged";

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
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Rent additional land around your plot</DialogTitle>
        </DialogHeader>

        {unusedRent > 0 && (
          <InfoPanel className="mb-2 text-sm text-gray-300">
            {selectedMapUnit.type === "plot" && selectedMapUnit?.rented_amount && <InfoPanel.Item label="Previous rental">
              {toLocalString((selectedMapUnit.type === "plot" ? selectedMapUnit?.rented_amount ?? 0 : 0 ) / decimalsFactor)} {symbol}
            </InfoPanel.Item>}
            <InfoPanel.Item label="Unused rental">
              {toLocalString(unusedRent / decimalsFactor)} {symbol}
            </InfoPanel.Item>
            <InfoPanel.Item label="Unused rental expires">{rentalExpiryFormatted}</InfoPanel.Item>
          </InfoPanel>
        )}

        <div className="flex flex-col space-y-2">
          <Label htmlFor="amount">New rent amount</Label>
          <Input id="amount" error={amount !== "" ? error : undefined} onKeyDown={handleKeyDown} suffix={symbol} onChange={handleChange} value={amount} />
        </div>

        <InfoPanel>
          <InfoPanel.Item label="Expires in">1 year</InfoPanel.Item>
          <InfoPanel.Item label="Rental fee">
            {isCoveredByUnusedRent ? "Covered by unused credit" : `${toLocalString(requiredFee / decimalsFactor)} ${symbol}`}
          </InfoPanel.Item>
          <InfoPanel.Item label="Total balance (inc. rented)">
            {toLocalString(((selectedMapUnit.amount ) / decimalsFactor) + Number(amount))} {symbol}
          </InfoPanel.Item>
          {amount && Number(amount) > 0 && (
            <>
              <InfoPanel.Item label="Area change">
                {areaChangeText}
              </InfoPanel.Item>
              <InfoPanel.Item label="Matching range">
                {rangeChangeText}
              </InfoPanel.Item>
            </>
          )}
        </InfoPanel>

        <div className="my-1 text-sm text-gray-400">
          <p>Renting land increases your plot's effective area, extending the range for finding neighboring plots to build houses.</p>
        </div>

        <DialogFooter>
          <div className="w-full">
            <QRButton ref={putBtnRef} disabled={!inited || !!error || !amount} className="w-full" href={url}>
              {isCoveredByUnusedRent 
                ? `Rent with unused credit` 
                : isSameAmount 
                  ? `Renew rental for 1 year` 
                  : `Send ${toLocalString(requiredFee / decimalsFactor)} ${symbol}`}
            </QRButton>
            <div className="mt-2 text-gray-400 text-foreground">
              {isCoveredByUnusedRent ? (
                <small>Your unused rental credit covers most of this rental. A minimal transaction amount is still required.</small>
              ) : isSameAmount ? (
                <small>Rental fee may be lower than before. Any excess will be returned to you.</small>
              ) : (
                <small>The fee might slightly change. We added 1%, the excess will be returned to you.</small>
              )}
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
