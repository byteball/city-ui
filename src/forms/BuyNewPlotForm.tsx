import { isEmpty } from "lodash";
import { FC, memo } from "react";
import { Link } from "react-router";

import { getPlotPrice } from "@/aaLogic/getPlotPrice";

import { InfoPanel } from "@/components/ui/_info-panel";
import { QRButton } from "@/components/ui/_qr-button";

import { useAaParams, useAaStore } from "@/store/aa-store";
import { useSettingsStore } from "@/store/settings-store";

import { generateLink, getAddressFromNearestRoad, getExplorerUrl, toLocalString } from "@/lib";

import { getRoads } from "@/engine/utils/getRoads";
import { IRefData } from "@/global";

import { mapUnitsByUniqDataSelector, mapUnitsSelector } from "@/store/selectors/mapUnitsSelector";

import appConfig from "@/appConfig";

export const BuyNewPlotForm: FC = memo(() => {
  // Get AA parameters and calculate plot price details
  const params = useAaParams();
  const { price, fee, totalPrice } = getPlotPrice(params);

  // Get required state from stores
  const { loaded: stateLoaded, state } = useAaStore();
  const {
    symbol,
    asset,
    decimals,
    inited,
    selectedMapUnit: selectedMapUnitUniqData,
    walletAddress,
  } = useSettingsStore();

  const selectedMapUnit = useAaStore((state) => mapUnitsByUniqDataSelector(state, selectedMapUnitUniqData || null));

  const aaState = useAaStore((state) => state);
  const mapUnits = mapUnitsSelector(aaState);

  const mayor = aaState.state.city_city?.mayor!;

  const roads = getRoads(mapUnits, String(mayor));

  // Check if data is still loading
  const isLoading = !inited || !stateLoaded || !asset || decimals === null;

  // Format price values
  const decimalsPow = 10 ** (decimals ?? 0);
  const formattedValues = {
    price: toLocalString(price / decimalsPow),
    // Simplify fee formatting: toFixed(2) already returns a string.
    fee: (fee * 100).toFixed(2),
    total: toLocalString(totalPrice / decimalsPow),
  };

  const refData: IRefData = {};
  let address: string | undefined;

  if (selectedMapUnit) {
    if (selectedMapUnit.type === "plot" && selectedMapUnit.owner !== walletAddress) {
      refData.ref_plot_num = selectedMapUnit.plot_num;

      address = getAddressFromNearestRoad(
        roads,
        {
          x: selectedMapUnit.x,
          y: selectedMapUnit.y,
        },
        selectedMapUnit.plot_num
      )?.[0];
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

            address = getAddressFromNearestRoad(
              roads,
              {
                x: plot.x,
                y: plot.y,
              },
              plot.plot_num
            )?.[0];
          }
        }
      }
    }
  }

  // Generate payment link
  const buyUrl = generateLink({
    amount: totalPrice,
    asset: asset ?? "",
    data: { buy: 1, ...refData },
    aa: appConfig.AA_ADDRESS,
    is_single: true,
  });

  return (
    <div className="text-sm">
      <InfoPanel className="mb-4">
        <InfoPanel.Item label="Price" loading={isLoading}>
          {formattedValues.price} {symbol}
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
          {formattedValues.total} {symbol}
        </InfoPanel.Item>
      </InfoPanel>

      {!isEmpty(refData) && (selectedMapUnit?.owner !== walletAddress || !walletAddress) ? (
        <div>
          <p className="mb-4 text-muted-foreground">
            You’re using{" "}
            {refData.ref ? (
              <a href={getExplorerUrl(refData.ref, "address")} target="_blank" rel="noopener" className="text-link">
                {refData.ref!.slice(0, 5)}...{refData.ref!.slice(-5, refData.ref!.length)}
              </a>
            ) : (
              <>
                <b>{address}</b> and its owner{" "}
                {selectedMapUnit?.owner ? (
                  <a
                    href={getExplorerUrl(selectedMapUnit.owner, "address")}
                    target="_blank"
                    rel="noopener"
                    className="text-link"
                  >
                    {selectedMapUnit.owner}
                  </a>
                ) : null}
              </>
            )}
            {" "}as your referrer, which gives you a higher chance of becoming their neighbor.
          </p>
        </div>
      ) : null}

      <QRButton href={buyUrl} disabled={isLoading} variant="secondary">
        Buy
      </QRButton>
    </div>
  );
});

