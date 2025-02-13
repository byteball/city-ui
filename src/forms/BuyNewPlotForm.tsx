import { FC, memo } from "react";

import { getPlotPrice } from "@/aaLogic/getPlotPrice";

import { InfoPanel } from "@/components/ui/_info-panel";
import { QRButton } from "@/components/ui/_qr-button";

import { useAaParams, useAaStore } from "@/store/aa-store";
import { useSettingsStore } from "@/store/settings-store";

import { generateLink, toLocalString } from "@/lib";

import appConfig from "@/appConfig";

export const BuyNewPlotForm: FC = memo(() => {
  const params = useAaParams();
  const { price, fee, totalPrice } = getPlotPrice(params);

  const stateLoaded = useAaStore((state) => state.loaded);
  const symbol = useSettingsStore((state) => state.symbol);
  const asset = useSettingsStore((state) => state.asset);
  const decimals = useSettingsStore((state) => state.decimals);
  const inited = useSettingsStore((state) => state.inited);
  const refData = useSettingsStore((state) => state.refData);

  const loading = !inited || !stateLoaded || !asset || decimals === null;

  const decimalsPow = 10 ** (decimals ?? 0);

  const formattedPrice = toLocalString(price / decimalsPow);
  const formattedFee = toLocalString((fee * 100).toFixed(2));
  const formattedTotalPrice = toLocalString(totalPrice / decimalsPow);

  const buyUrl = generateLink({
    amount: totalPrice,
    asset: asset ?? "",
    data: { buy: 1, ...refData },
    aa: appConfig.AA_ADDRESS,
  });

  return (
    <div className="text-sm">
      <InfoPanel>
        <InfoPanel.Item label="Price" loading={loading}>
          {formattedPrice} {symbol}
        </InfoPanel.Item>

        <InfoPanel.Item label="Fee" loading={loading}>
          {formattedFee}%
        </InfoPanel.Item>

        <InfoPanel.Item label="Total price" loading={loading}>
          {formattedTotalPrice} {symbol}
        </InfoPanel.Item>
      </InfoPanel>

      <QRButton href={buyUrl} disabled={loading} variant="secondary">
        Buy
      </QRButton>
    </div>
  );
});

