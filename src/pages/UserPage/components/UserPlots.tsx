import moment from "moment";
import { FC, useCallback } from "react";
import { Link } from "react-router";

import { InfoPanel } from "@/components/ui/_info-panel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TextScramble } from "@/components/ui/text-scramble";

import { useAaStore } from "@/store/aa-store";
import { mapUnitsByOwnerAddressSelector, mapUnitsSelector } from "@/store/selectors/mapUnitsSelector";
import { useSettingsStore } from "@/store/settings-store";

import { getRoads } from "@/game/utils/getRoads";
import { ICity } from "@/global";
import { asNonNegativeNumber, toLocalString } from "@/lib";
import { getAddressFromNearestRoad } from "@/lib/getAddressCoordinate";
import { mapUnitsSortFunc } from "@/lib/mapUnitsSortFunc";
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
  const userPlots = userUnits.filter((u) => u.type === "plot");
  const roads = getRoads(mapUnits, String(cityStats?.mayor));

  const changePlot = useCallback(({ x, y, type }: { x: number; y: number; type: "plot" | "house" }) => {
    useSettingsStore.getState().setSelectedMapUnit({ x: asNonNegativeNumber(x), y: asNonNegativeNumber(y), type });
  }, []);

  const decimalsFactor = 10 ** decimals!;

  return (
    <div className="mt-8">
      <div className="flex flex-col items-start justify-between md:items-center md:flex-row">
        <div className="mb-4 md:mb-0">
          <h2 className="text-xl font-semibold">Plots</h2>
        </div>
        <div>
          <MapUnitsSortSelect type="plot" />
        </div>
      </div>

      <div className="grid gap-4 mt-4 md:grid-cols-2 lg:grid-cols-4">
        {userPlots.sort(mapUnitsSortFunc).map(({ plot_num, x, y, amount, rented_amount = 0, ts, type = "plot" }) => {
          const [address] = getAddressFromNearestRoad(roads, { x, y }, plot_num);

          return (
            <Link onClick={() => changePlot({ x, y, type })} to={`/?c=${x},${y},${type}`} key={plot_num}>
              <Card>
                <CardHeader className="pb-2 space-y-0 ">
                  <CardTitle>
                    <TextScramble className="text-sm font-semibold">{address ?? `Plot ${plot_num}`}</TextScramble>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <InfoPanel labelAnimated>
                    <InfoPanel.Item label="Total amount">
                      <TextScramble className="inline">
                        {toLocalString((amount + rented_amount) / decimalsFactor)}
                      </TextScramble>{" "}
                      <small>
                        <TextScramble className="inline">{symbol!}</TextScramble>{" "}
                      </small>
                    </InfoPanel.Item>
                    <InfoPanel.Item label="Rented">
                      <TextScramble className="inline">{toLocalString(rented_amount / decimalsFactor)}</TextScramble>
                      <small>
                        {" "}
                        <TextScramble className="inline">{symbol!}</TextScramble>{" "}
                      </small>
                    </InfoPanel.Item>
                    <InfoPanel.Item label="Created on">
                      <TextScramble className="inline">{moment(ts * 1000).format("ll")}</TextScramble>
                    </InfoPanel.Item>
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

