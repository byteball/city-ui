import { FC, memo } from "react";

import { getPlotPrice } from "@/aaLogic/getPlotPrice";

import { InfoPanel } from "@/components/ui/_info-panel";
import { QRButton } from "@/components/ui/_qr-button";

import { useAaParams, useAaStore } from "@/store/aa-store";
import { useSettingsStore } from "@/store/settings-store";

import { generateLink, toLocalString } from "@/lib";

import appConfig from "@/appConfig";

const reserveDecimals = 9;
const reserveSymbol = "GBYTE";
const reserveAsset = "base";

export const PrelaunchForm: FC = memo(() => {
  // Get AA parameters and calculate plot price details
  const params = useAaParams();
  const { price, fee, totalPrice } = getPlotPrice(params);

  // Get required state from stores
  const { loaded: stateLoaded } = useAaStore();
  const { symbol, decimals, asset, inited, refData } = useSettingsStore();

  const boughtTokens = Math.floor(price * 0.1); // Updated to use 'price' instead of '$plot_price'

  // Check if data is still loading
  const isLoading = !inited || !stateLoaded || !asset || decimals === null;

  // Format price values
  const decimalsPow = 10 ** (decimals ?? 0);
  const reserveDecimalsPow = 10 ** (reserveDecimals ?? 0);

  const formattedValues = {
    price: toLocalString(price / 1000 / decimalsPow),
    // Simplify fee formatting: toFixed(2) already returns a string.
    fee: (fee * 100).toFixed(2),
    total: toLocalString(totalPrice / 1000 / decimalsPow),
    boughtTokens: toLocalString(boughtTokens / reserveDecimalsPow),
  };

  const amount = Math.round((totalPrice + boughtTokens) / 1000);

  // Generate payment link
  const buyUrl = generateLink({
    amount,
    asset: reserveAsset,
    data: { buy: 1, ...refData },
    aa: appConfig.AA_ADDRESS,
  });

  return (
    <div className="text-sm">
      <InfoPanel className="mb-4">
        <InfoPanel.Item label="Price" loading={isLoading}>
          {formattedValues.price} {reserveSymbol}
        </InfoPanel.Item>

        <InfoPanel.Item
          tooltipText="A fee applies to prevent misuse. See the governance page for details."
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

      <QRButton href={buyUrl} disabled={isLoading} variant="secondary">
        Buy
      </QRButton>
    </div>
  );
});

