import moment from "moment";
import { FC, useCallback, useMemo } from "react";
import { Link } from "react-router";

import { InfoPanel } from "@/components/ui/_info-panel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TextScramble } from "@/components/ui/text-scramble";

import { useAaStore } from "@/store/aa-store";
import { mapUnitsByOwnerAddressSelector, mapUnitsSelector } from "@/store/selectors/mapUnitsSelector";
import { useSettingsStore } from "@/store/settings-store";

import { getRoads } from "@/game/utils/getRoads";
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
                      <TextScramble className="text-sm font-semibold">{address ?? `Plot ${plot_num}`}</TextScramble>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <InfoPanel labelAnimated>
                      <InfoPanel.Item label="Amount">
                        <TextScramble className="inline">{toLocalString(amount / decimalsFactor)}</TextScramble>{" "}
                        <small>
                          <TextScramble className="inline">{symbol!}</TextScramble>{" "}
                        </small>
                      </InfoPanel.Item>
                      <InfoPanel.Item label="Rented amount">
                        <TextScramble className="inline">{toLocalString(rented_amount / decimalsFactor)}</TextScramble>
                        <small>
                          {" "}
                          <TextScramble className="inline">{symbol!}</TextScramble>{" "}
                        </small>
                      </InfoPanel.Item>

                      <InfoPanel.Item label="Created on">
                        <TextScramble className="inline">{moment(ts * 1000).format("ll")}</TextScramble>
                      </InfoPanel.Item>

                      {info ? (
                        <div className="text-sm">
                          <div className="mt-4 mb-1 font-semibold">Additional information</div>
                          {typeof info === "string" ? (
                            <InfoPanel.Item label="Information">
                              <TextScramble className="inline">{info}</TextScramble>
                            </InfoPanel.Item>
                          ) : (
                            Object.entries(info)
                              .slice(0, 5)
                              .map(([key, value]) => (
                                <InfoPanel.Item key={key} label={key === "homepage" ? "" : key}>
                                  <div className="inline">
                                    {String(value).startsWith("https://") || String(value).startsWith("https://") ? (
                                      <a href={value?.toString()} rel="noopener" className="text-link" target="_blank">
                                        {value}
                                      </a>
                                    ) : (
                                      value ?? ""
                                    )}
                                  </div>
                                </InfoPanel.Item>
                              ))
                          )}
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

