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
  const [rentalAmount, setRentalAmount] = useState<string>("");
  const submitButtonRef = useRef<HTMLButtonElement>(null);

  const { symbol, decimals, asset, inited } = useSettingsStore();
  const walletAddressFromStore = useSettingsStore((state) => state.walletAddress);
  const selectedMapUnitCoordinates = useSettingsStore((state) => state.selectedMapUnit);
  const [selectedMapUnit] = useAaStore((state) =>
    mapUnitsByCoordinatesSelector(state, selectedMapUnitCoordinates as ICoordinates | null)
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value ?? "";
      if (
        !value ||
        (decimals &&
          getCountOfDecimals(value) <= decimals &&
          Number(value) <= 100000000)
      ) {
        setRentalAmount(value === "." || value === "," ? "0." : !isNaN(Number(value)) ? value : rentalAmount);
      }
    },
    [setRentalAmount, decimals, rentalAmount]
  );

  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      submitButtonRef.current?.click();
    }
  }, []);

  const decimalsFactor = 10 ** decimals!;

  let error = useMemo(() => {
    if (rentalAmount !== "" && Number(rentalAmount) <= 0) {
      return `Amount should be greater than 0`;
    }
    return false;
  }, [rentalAmount]);

  const { 
    plot_price: plotPrice, 
    matching_probability: matchingProbability, 
    rental_surcharge_factor: rentalSurchargeFactor, 
    referral_boost: referralBoost 
  } = useAaParams();
  const aaState = useAaStore((state) => state.state);
  const cityData = aaState.city_city!;
  const totalPlotsBought = cityData.total_bought / +plotPrice;
  const existingRentedAmount = selectedMapUnit.type === "plot" ? selectedMapUnit?.rented_amount ?? 0 : 0;
  const rentalAmountSmallestUnit = Number(rentalAmount) * decimalsFactor;
  const totalEffectiveSupply =
    cityData.total_land + cityData.total_rented + rentalAmountSmallestUnit - (selectedMapUnit.type === "plot" ? selectedMapUnit.rented_amount ?? 0 : 0);
  const currentTimestamp = moment.utc().unix();
  const elapsed = currentTimestamp - cityData.start_ts;
  const secondsInYear = 365 * 24 * 3600;
  const expectedPurchasesNextYear = (secondsInYear / elapsed) * totalPlotsBought;

  const incomePerPurchase = (2 * +plotPrice * +matchingProbability * rentalAmountSmallestUnit) / totalEffectiveSupply;
  const annualIncome = incomePerPurchase * expectedPurchasesNextYear;
  const rentalFee = Math.ceil(+rentalSurchargeFactor * annualIncome);
  let unusedRentalCredit = 0;
  let rentalExpiryFormatted = "";

  if (selectedMapUnit.type === "plot") {
    const rentalExpiryTimestamp = selectedMapUnit.rental_expiry_ts ?? 0;
    if (currentTimestamp < rentalExpiryTimestamp) {
      unusedRentalCredit = Math.floor((existingRentedAmount * (rentalExpiryTimestamp - currentTimestamp)) / secondsInYear);
      rentalExpiryFormatted = moment.unix(rentalExpiryTimestamp).format("YYYY-MM-DD HH:mm");

      if (rentalAmountSmallestUnit && rentalAmountSmallestUnit < (selectedMapUnit.rented_amount ?? 0)) {
        error = `Rental amount cannot be decreased. Min value is ${toLocalString(existingRentedAmount / decimalsFactor)} ${symbol}`;
      }
    }
  }

  const rentalFeeWithMargin = rentalFee * 1.01;
  const isFeeCoveredByUnusedCredit = unusedRentalCredit >= rentalFeeWithMargin - 0.01;

  const minTransactionAmount = 1;

  const requiredFee = isFeeCoveredByUnusedCredit
    ? minTransactionAmount
    : Math.max(minTransactionAmount, rentalFeeWithMargin - unusedRentalCredit);

  const isRenewal = Math.abs(Number(rentalAmount) - existingRentedAmount / decimalsFactor) < 0.001;

  const currentPlotArea = selectedMapUnit.amount + existingRentedAmount;
  const newPlotArea = selectedMapUnit.amount + rentalAmountSmallestUnit;

  const currentShare = currentPlotArea / (cityData.total_land + cityData.total_rented);
  const newShare = newPlotArea / (cityData.total_land + cityData.total_rented - existingRentedAmount + rentalAmountSmallestUnit);

  const hasReferrer = "ref_plot_num" in selectedMapUnit ? 1 : 0;
  const currentDistance = Math.sqrt(1e12 * +matchingProbability * (currentShare + hasReferrer * +referralBoost)) / 2;
  const newDistance = Math.sqrt(1e12 * +matchingProbability * (newShare + hasReferrer * +referralBoost)) / 2;

  const areaChangePercentage = (newPlotArea / currentPlotArea - 1) * 100;
  const matchingRangeChangePercentage = (newDistance / currentDistance - 1) * 100;

  const areaChangeDescription =
    areaChangePercentage > 0
      ? `~${Math.round(areaChangePercentage)}% larger`
      : areaChangePercentage < 0
      ? `~${Math.round(Math.abs(areaChangePercentage))}% smaller`
      : "unchanged";

  const rangeChangeDescription =
    matchingRangeChangePercentage > 0
      ? `~${Math.round(matchingRangeChangePercentage)}% farther`
      : matchingRangeChangePercentage < 0
      ? `~${Math.round(Math.abs(matchingRangeChangePercentage))}% closer`
      : "unchanged";

  if (requiredFee > rentalAmountSmallestUnit) {
    error = "Not enough paid for rental fee";
  }

  const url = generateLink({
    amount: requiredFee,
    data: {
      rent: 1,
      plot_num: selectedMapUnit.plot_num,
      rented_amount: rentalAmountSmallestUnit,
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

        {unusedRentalCredit > 0 && (
          <InfoPanel className="mb-2 text-sm text-gray-300">
            {selectedMapUnit.type === "plot" && selectedMapUnit?.rented_amount && (
              <InfoPanel.Item label="Previous rental">
                {toLocalString((selectedMapUnit.type === "plot" ? selectedMapUnit?.rented_amount ?? 0 : 0) / decimalsFactor)} {symbol}
              </InfoPanel.Item>
            )}
            <InfoPanel.Item label="Unused rental">
              {toLocalString(unusedRentalCredit / decimalsFactor)} {symbol}
            </InfoPanel.Item>
            <InfoPanel.Item label="Unused rental expires">
              {rentalExpiryFormatted}
            </InfoPanel.Item>
          </InfoPanel>
        )}

        <div className="flex flex-col space-y-2">
          <Label htmlFor="amount">New rent amount</Label>
          <Input
            id="amount"
            error={rentalAmount !== "" ? error : undefined}
            onKeyDown={handleKeyDown}
            suffix={symbol}
            onChange={handleChange}
            value={rentalAmount}
          />
        </div>

        <InfoPanel>
          <InfoPanel.Item label="Expires in">1 year</InfoPanel.Item>
          <InfoPanel.Item label="Rental fee">
            {isFeeCoveredByUnusedCredit
              ? "Covered by unused credit"
              : `${toLocalString(requiredFee / decimalsFactor)} ${symbol}`}
          </InfoPanel.Item>
          <InfoPanel.Item label="Total balance (inc. rented)">
            {toLocalString(((selectedMapUnit.amount) / decimalsFactor) + Number(rentalAmount))} {symbol}
          </InfoPanel.Item>
          {rentalAmount && Number(rentalAmount) > 0 && (
            <>
              <InfoPanel.Item label="Area change">
                {areaChangeDescription}
              </InfoPanel.Item>
              <InfoPanel.Item label="Matching range">
                {rangeChangeDescription}
              </InfoPanel.Item>
            </>
          )}
        </InfoPanel>

        <div className="my-1 text-sm text-gray-400">
          <p>
            Renting land increases your plot's effective area, extending the range for finding neighboring plots to build houses.
          </p>
        </div>

        <DialogFooter>
          <div className="w-full">
            <QRButton ref={submitButtonRef} disabled={!inited || !!error || !rentalAmount} className="w-full" href={url}>
              {isFeeCoveredByUnusedCredit
                ? `Rent with unused credit`
                : isRenewal
                ? `Renew rental for 1 year`
                : `Send ${toLocalString(requiredFee / decimalsFactor)} ${symbol}`}
            </QRButton>
            <div className="mt-2 text-gray-400 text-foreground">
              {isFeeCoveredByUnusedCredit ? (
                <small>
                  Your unused rental credit covers most of this rental. A minimal transaction amount is still required.
                </small>
              ) : isRenewal ? (
                <small>
                  Rental fee may be lower than before. Any excess will be returned to you.
                </small>
              ) : (
                <small>
                  The fee might slightly change. We added 1%, the excess will be returned to you.
                </small>
              )}
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
