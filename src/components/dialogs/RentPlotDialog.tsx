import moment from "moment";
import { FC, KeyboardEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useAaParams, useAaStore } from "@/store/aa-store";
import { mapUnitsByUniqDataSelector } from "@/store/selectors/mapUnitsSelector";
import { useSettingsStore } from "@/store/settings-store";
import { InfoPanel } from "../ui/_info-panel";
import { QRButton } from "../ui/_qr-button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

import { generateLink, getCountOfDecimals, toLocalString } from "@/lib";
import { getAreaChangeDescription } from "./utils";

import { IPlot } from "@/global";

import appConfig from "@/appConfig";

interface IRentPlotDialogProps {
  children: React.ReactNode;
}

const secondsInYear = 365 * 24 * 3600; // seconds in a year

export const RentPlotDialog: FC<IRentPlotDialogProps> = ({ children }) => {
  const [rentalAmount, setRentalAmount] = useState<string>("");
  const submitButtonRef = useRef<HTMLButtonElement>(null);
  const [currentTimestamp, setCurrentTimestamp] = useState(moment.utc().unix());
  const aaState = useAaStore((state) => state.state);
  const { symbol, decimals, asset, inited } = useSettingsStore();
  const walletAddressFromStore = useSettingsStore((state) => state.walletAddress);
  const selectedPlotUniqData = useSettingsStore((state) => state.selectedMapUnit);
  const selectedPlot = useAaStore((state) => mapUnitsByUniqDataSelector(state, selectedPlotUniqData || null)) as IPlot;
  const {
    plot_price: plotPrice,
    matching_probability: matchingProbability,
    rental_surcharge_factor: rentalSurchargeFactor,
  } = useAaParams();

  const decimalsFactor = 10 ** decimals!;
  const cityData = aaState.city_city!;

  const oldRentedAmountSmallestUnit = selectedPlot?.rented_amount ?? 0;
  const currentPlotArea = selectedPlot.amount + oldRentedAmountSmallestUnit;
  const rentalAmountSmallestUnit = Number(rentalAmount) * decimalsFactor;
  const rentalExpiryTs = selectedPlot.rental_expiry_ts ?? 0;

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTimestamp(moment.utc().unix());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // views
  const isActualRental = currentTimestamp < rentalExpiryTs;
  const rentalExpiryFormatted = moment.unix(rentalExpiryTs).format("YYYY-MM-DD HH:mm");

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      let value = e.target.value ?? "";

      if (value.startsWith(".") || value.startsWith(",")) {
        value = "0" + value;
      }

      if (!value || (decimals && getCountOfDecimals(value) <= decimals && Number(value) <= 100000000)) {
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

  const isRenewal = Math.abs(Number(rentalAmount) - oldRentedAmountSmallestUnit / decimalsFactor) < 0.001;

  const newPlotArea = selectedPlot.amount + rentalAmountSmallestUnit;
  const areaChangeDescription = getAreaChangeDescription(currentPlotArea, newPlotArea);

  const totalWorking =
    cityData.total_land + cityData.total_rented + rentalAmountSmallestUnit - oldRentedAmountSmallestUnit;

  const elapsed = currentTimestamp - cityData.start_ts;

  const countBought = cityData.total_bought / +plotPrice;
  const countBuysNextYear = (secondsInYear / elapsed) * countBought;

  // "2" because there are two users, each earns one additional plot
  const incomeFromOneBuyPerRentedToken = (2 * plotPrice * matchingProbability) / totalWorking;

  // surcharge factor * yearly income per rented token
  const feePerRentedToken = rentalSurchargeFactor * incomeFromOneBuyPerRentedToken * countBuysNextYear;

  const rentalFee = Math.ceil(feePerRentedToken * rentalAmountSmallestUnit);

  let unusedRent = 0;

  if (oldRentedAmountSmallestUnit && isActualRental) {
    const unusedRentalTime = rentalExpiryTs - currentTimestamp;
    unusedRent = Math.floor((feePerRentedToken * oldRentedAmountSmallestUnit * unusedRentalTime) / secondsInYear);
  }

  const requiredFee = rentalFee - unusedRent;
  // const excess = rentalAmountSmallestUnit - requiredFee;

  const requiredFeeWithMargin = requiredFee * 1.01;
  const isFeeCoveredByUnusedRental = requiredFee <= 0;

  const tooFewPlotsBought = countBought < 10;

  const url = generateLink({
    amount: requiredFeeWithMargin,
    data: {
      rent: 1,
      plot_num: selectedPlot.plot_num,
      rented_amount: rentalAmountSmallestUnit,
    },
    from_address: walletAddressFromStore!,
    aa: appConfig.AA_ADDRESS,
    asset: asset!,
    is_single: true,
  });

  const error = useMemo(() => {
    if (rentalAmount !== "" && Number(rentalAmount) <= 0) {
      return `Amount should be greater than 0`;
    } else if (tooFewPlotsBought) {
      return `Rent is not available yet there are too few plots in the city`;
    } else if (
      rentalAmount &&
      Number(rentalAmount) > 0 &&
      rentalAmountSmallestUnit < (selectedPlot.rented_amount ?? 0)
    ) {
      return `Rental amount cannot be decreased. Min value is ${toLocalString(
        oldRentedAmountSmallestUnit / decimalsFactor
      )} ${symbol}`;
    }

    return false;
  }, [rentalAmount]);

  if (!selectedPlot || selectedPlot.type !== "plot") return null;

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Rent additional land around your plot</DialogTitle>
          <DialogDescription>
            Your plot balance is {toLocalString(+Number(selectedPlot.amount / decimalsFactor).toFixed(decimals!))}{" "}
            {symbol}. You can rent additional land to increase the plot's matching probability.
          </DialogDescription>
        </DialogHeader>

        {unusedRent > 0 && (
          <InfoPanel className="mb-2 text-sm text-gray-300">
            {selectedPlot.type === "plot" && selectedPlot?.rented_amount && (
              <InfoPanel.Item label="Previous rental">
                {toLocalString((selectedPlot?.rented_amount ?? 0) / decimalsFactor)} {symbol}
              </InfoPanel.Item>
            )}
            <InfoPanel.Item label="Unused rental">
              {toLocalString(unusedRent / decimalsFactor)} {symbol}
            </InfoPanel.Item>
            <InfoPanel.Item label="Unused rental expires">{rentalExpiryFormatted}</InfoPanel.Item>
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
          <InfoPanel.Item label="Rental fee" tooltipText="The amount you will pay to rent additional plot space.">
            {isFeeCoveredByUnusedRental
              ? "Covered by unused rental"
              : `${toLocalString(rentalFee / decimalsFactor)} ${symbol}`}
          </InfoPanel.Item>
          <InfoPanel.Item label="New total balance (inc. rented)">
            {toLocalString(selectedPlot.amount / decimalsFactor + Number(rentalAmount))} {symbol}
          </InfoPanel.Item>

          {rentalAmount && Number(rentalAmount) > 0 && (
            <>
              <InfoPanel.Item label="Area change">{areaChangeDescription}</InfoPanel.Item>
            </>
          )}
        </InfoPanel>

        <DialogFooter>
          <div className="w-full">
            <QRButton
              ref={submitButtonRef}
              disabled={!inited || !!error || !rentalAmount || tooFewPlotsBought} // || notEnoughRentalFee
              className="w-full"
              href={url}
            >
              {isFeeCoveredByUnusedRental
                ? `Send ${symbol}`
                : isRenewal
                ? `Renew rental for 1 year`
                : `Send ${toLocalString(requiredFee / decimalsFactor)} ${symbol}`}
            </QRButton>
          </div>
        </DialogFooter>
        <DialogFooter className="text-xs text-muted-foreground">
          1% of this amount will be added to protect against rental price volatility, you will receive this amount back
          if prices do not change.
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

