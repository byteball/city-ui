import { FC, memo } from "react";

import { getPlotPrice } from "@/aaLogic/getPlotPrice";

import { InfoPanel } from "@/components/ui/_info-panel";
import { QRButton } from "@/components/ui/_qr-button";

import { useAaParams, useAaStore } from "@/store/aa-store";
import { useSettingsStore } from "@/store/settings-store";

import { generateLink, toLocalString } from "@/lib";

import appConfig from "@/appConfig";

export const BuyNewPlotForm: FC = memo(() => {
  // Get AA parameters and calculate plot price details
  const params = useAaParams();
  const { price, fee, totalPrice } = getPlotPrice(params);

  // Get required state from stores
  const { loaded: stateLoaded } = useAaStore();
  const { symbol, asset, decimals, inited, refData } = useSettingsStore();

  // Check if data is still loading
  const isLoading = !inited || !stateLoaded || !asset || decimals === null;

  // Format price values
  const decimalsPow = 10 ** (decimals ?? 0);
  const formattedValues = {
    price: toLocalString(price / decimalsPow),
    fee: toLocalString((fee * 100).toFixed(2)),
    total: toLocalString(totalPrice / decimalsPow),
  };

  // Generate payment link
  const buyUrl = generateLink({
    amount: totalPrice,
    asset: asset ?? "",
    data: { buy: 1, ...refData },
    aa: appConfig.AA_ADDRESS,
  });

  return (
    <div className="text-sm">
      <InfoPanel>
        <InfoPanel.Item label="Price" loading={isLoading}>
          {formattedValues.price} {symbol}
        </InfoPanel.Item>

        <InfoPanel.Item label="Fee" loading={isLoading}>
          {formattedValues.fee}%
        </InfoPanel.Item>

        <InfoPanel.Item label="Total price" loading={isLoading}>
          {formattedValues.total} {symbol}
        </InfoPanel.Item>
      </InfoPanel>

      <QRButton href={buyUrl} disabled={isLoading} variant="secondary">
        Buy
      </QRButton>
    </div>
  );
});
