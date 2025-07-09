import moment from "moment";
import { FC, useCallback, useMemo } from "react";
import { Link } from "react-router";

import { InfoPanel } from "@/components/ui/_info-panel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { useAaStore } from "@/store/aa-store";
import { mapUnitsByOwnerAddressSelector, mapUnitsSelector } from "@/store/selectors/mapUnitsSelector";
import { useSettingsStore } from "@/store/settings-store";

import { AdditionalInfo } from "@/components/ui/additional_info";
import { getRoads } from "@/engine/utils/getRoads";
import { ICity } from "@/global";
import { asNonNegativeNumber, mapUnitsSortFunc, toLocalString } from "@/lib";
import { getAddressFromNearestRoad } from "@/lib/getAddressCoordinate";
import { MapUnitsSortSelect } from "./MapUnitsSortSelect";

interface IUserPlotsProps {
  address: string;
}

export const UserPlots: FC<IUserPlotsProps> = ({ address }) => {
  const userUnits = useAaStore((state) => mapUnitsByOwnerAddressSelector(state, address));
  const { symbol, decimals } = useSettingsStore();
  const aaState = useAaStore((state) => state);
  const mapUnits = mapUnitsSelector(aaState);
  const cityStats = aaState.state.city_city as ICity;
  const userPlots = useMemo(() => userUnits.filter((u) => u.type === "plot"), [userUnits]);
  const roads = getRoads(mapUnits, String(cityStats?.mayor));

  const changePlot = useCallback(({ plot_num, type }: { plot_num: number; type: "plot" }) => {
    useSettingsStore.getState().setSelectedMapUnit({ num: asNonNegativeNumber(plot_num), type });
  }, []);

  const decimalsFactor = 10 ** decimals!;

  if (userPlots.length === 0) return null;

  return (
    <div className="mt-8">
      <div className="flex flex-col items-start justify-between md:items-center md:flex-row">
        <div className="mb-4 md:mb-0">
          <h2 className="text-xl font-semibold">
            Plots <span className="text-muted-foreground">({userPlots.length})</span>
          </h2>
        </div>
        {userPlots.length > 1 ? (
          <div>
            <MapUnitsSortSelect type="plot" />
          </div>
        ) : null}
      </div>

      <div className="grid gap-4 mt-4 md:grid-cols-2 lg:grid-cols-4 auto-rows-auto">
        {userPlots
          .sort(mapUnitsSortFunc)
          .map(({ plot_num, x, y, amount, rented_amount = 0, ts, type = "plot", info }) => {
            const [address] = getAddressFromNearestRoad(roads, { x, y }, plot_num);

            return (
              <Link
                className="flex h-full"
                onClick={() => changePlot({ plot_num, type })}
                to={`/?plot=${plot_num}`}
                key={plot_num}
              >
                <Card className="flex flex-col flex-1">
                  <CardHeader className="pb-2 space-y-0 ">
                    <CardTitle>
                      <div className="text-sm font-semibold">{address ?? `Plot ${plot_num}`}</div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <InfoPanel>
                      <InfoPanel.Item label="Amount">
                        <div className="inline">{toLocalString(amount / decimalsFactor)}</div>{" "}
                        <small>
                          <div className="inline">{symbol!}</div>{" "}
                        </small>
                      </InfoPanel.Item>
                      <InfoPanel.Item label="Rented amount">
                        <div className="inline">{toLocalString(rented_amount / decimalsFactor)}</div>
                        <small>
                          {" "}
                          <div className="inline">{symbol!}</div>{" "}
                        </small>
                      </InfoPanel.Item>

                      <InfoPanel.Item label="Created on">
                        <div className="inline">{moment(ts * 1000).format("ll")}</div>
                      </InfoPanel.Item>

                      {info ? (
                        <div className="overflow-hidden text-sm">
                          <div className="mt-4 mb-1 font-semibold">Additional information</div>
                          <AdditionalInfo itemsType="info-panel" info={info} />
                        </div>
                      ) : null}
                    </InfoPanel>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
      </div>
    </div>
  );
};

