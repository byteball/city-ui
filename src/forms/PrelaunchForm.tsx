import { isEmpty } from "lodash";
import { FC, memo } from "react";
import { Link } from "react-router";

import { getPlotPrice } from "@/aaLogic/getPlotPrice";

import { InfoPanel } from "@/components/ui/_info-panel";
import { QRButton } from "@/components/ui/_qr-button";

import { useAaParams, useAaStore } from "@/store/aa-store";
import { mapUnitsByUniqDataSelector, mapUnitsSelector } from "@/store/selectors/mapUnitsSelector";
import { useSettingsStore } from "@/store/settings-store";

import { generateLink, toLocalString } from "@/lib";
import { trackEvent } from "@/services/analytics";

import { IRefData } from "@/global";

import appConfig from "@/appConfig";

const reserveDecimals = 9;
const reserveSymbol = "GBYTE";
const reserveAsset = "base";

export const PrelaunchForm: FC = memo(() => {
  // Get AA parameters and calculate plot price details
  const params = useAaParams();
  const { price, fee, totalPrice } = getPlotPrice(params);

  // Get required state from stores
  const { loaded: stateLoaded, state } = useAaStore();
  const {
    symbol,
    decimals = 0,
    asset,
    inited,
    walletAddress,
    selectedMapUnit: selectedMapUnitUniqData,
  } = useSettingsStore();

  const selectedMapUnit = useAaStore((state) => mapUnitsByUniqDataSelector(state, selectedMapUnitUniqData || null));

  const aaState = useAaStore((state) => state);
  const mapUnits = mapUnitsSelector(aaState);

  const boughtTokens = Math.floor(price * 0.1); // Updated to use 'price' instead of '$plot_price'

  // Check if data is still loading
  const isLoading = !inited || !stateLoaded || !asset || decimals === null;

  // Format price values
  const decimalsPow = 10 ** (decimals ?? 0);
  const reserveDecimalsPow = 10 ** (reserveDecimals ?? 0);

  const formattedValues = {
    price: toLocalString(price / 1000 / reserveDecimalsPow),
    // Simplify fee formatting: toFixed(2) already returns a string.
    fee: (fee * 100).toFixed(2),
    total: toLocalString(totalPrice / 1000 / reserveDecimalsPow),
    boughtTokens: toLocalString(boughtTokens / decimalsPow),
  };

  const amount = Math.round((totalPrice + boughtTokens) / 1000);

  const refData: IRefData = {};

  if (selectedMapUnit) {
    if (selectedMapUnit.type === "plot" && selectedMapUnit.owner !== walletAddress) {
      refData.ref_plot_num = selectedMapUnit.plot_num;
    } else if (selectedMapUnit.type === "house") {
      if (selectedMapUnit.owner && selectedMapUnit.owner !== walletAddress) {
        const refererMainPlot = state[`user_main_plot_city_${selectedMapUnit.owner}`];

        if (refererMainPlot) {
          refData.ref = selectedMapUnit.owner;
        } else {
          const plot = mapUnits.find(
            (unit) => unit.owner === selectedMapUnit.owner && unit.type === "plot" && unit.status === "land"
          );

          if (plot !== undefined) {
            refData.ref_plot_num = plot.plot_num;
          }
        }
      }
    }
  }

  // Generate payment link
  const buyUrl = generateLink({
    amount,
    asset: reserveAsset,
    data: { buy: 1, ...refData },
    aa: appConfig.AA_ADDRESS,
    is_single: true,
  });

  const trackBuying = () => {
    console.log("Buying plot");
    trackEvent("buy_plot", { walletAddress });
  }

  return (
    <div className="text-sm">
      <InfoPanel compact className="mb-4">
        <InfoPanel.Item label="Price" loading={isLoading}>
          {formattedValues.price} {reserveSymbol}
        </InfoPanel.Item>

        <InfoPanel.Item
          tooltipText={
            <span>
              The fee is burned to offset emissions from reward plots (
              <Link to="/faq#what-is-the-fee-when-buying-a-plot" className="text-link">
                see the FAQ
              </Link>
              ).
            </span>
          }
          label="Fee"
          loading={isLoading}
        >
          {formattedValues.fee + "%"}
        </InfoPanel.Item>

        <InfoPanel.Item label="Total price" loading={isLoading}>
          {formattedValues.total} {reserveSymbol}
        </InfoPanel.Item>
        <InfoPanel.Item label="You will receive" loading={isLoading}>
          {formattedValues.boughtTokens} {symbol}
        </InfoPanel.Item>
      </InfoPanel>

      <p className="mb-4 text-muted-foreground">
        During the initial sale, while buying a plot, you also buy {symbol} at the fixed rate 1 GBYTE = 1000 {symbol} for 10% of the plot price.
      </p>

      {!isEmpty(refData) && (selectedMapUnit?.owner !== walletAddress || !walletAddress) ? (
        <div>
          <p className="mb-4 text-muted-foreground">
            You’re using{" "}
            {refData.ref ? (
              <Link to={`/user/${refData.ref}`} className="text-link">
                {refData.ref!.slice(0, 5)}...{refData.ref!.slice(-5, refData.ref!.length)}
              </Link>
            ) : (
              <>
                a plot belonging to{" "}
                {selectedMapUnit?.owner ? (
                  <Link
                    to={`/user/${selectedMapUnit.owner}`}
                    className="text-link"
                  >
                    {selectedMapUnit.owner}
                  </Link>
                ) : null}
              </>
            )}
            {" "}as your referrer, which gives you a higher chance of becoming their neighbor.
          </p>
        </div>
      ) : null}

      <QRButton href={buyUrl} disabled={isLoading} onClick={trackBuying} variant="secondary">
        Buy
      </QRButton>
    </div>
  );
});

