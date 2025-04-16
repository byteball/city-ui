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
import { asNonNegativeNumber, mapUnitsSortFunc, toLocalString } from "@/lib";
import { getAddressFromNearestRoad } from "@/lib/getAddressCoordinate";
import { MapUnitsSortSelect } from "./MapUnitsSortSelect";

interface IUserHousesProps {
  address: string;
}

export const UserHouses: FC<IUserHousesProps> = ({ address }) => {
  const userUnits = useAaStore((state) => mapUnitsByOwnerAddressSelector(state, address));
  const { symbol, decimals } = useSettingsStore();
  const aaState = useAaStore((state) => state);
  const mapUnits = mapUnitsSelector(aaState);
  const cityStats = aaState.state.city_city as ICity;
  const roads = getRoads(mapUnits, String(cityStats?.mayor));

  const userHouses = userUnits.filter((u) => u.type === "house");

  const changeHouse = useCallback(({ x, y, type = "plot" }: { x: number; y: number; type: "house" | "plot" }) => {
    useSettingsStore.getState().setSelectedMapUnit({ x: asNonNegativeNumber(x), y: asNonNegativeNumber(y), type });
  }, []);

  if (userHouses.length === 0) return null;

  return (
    <div className="mt-8">
      <div className="flex flex-col items-start justify-between md:flex-row">
        <div className="mb-4 md:mb-0">
          <h2 className="text-xl font-semibold">Houses</h2>
        </div>
        <div>
          <MapUnitsSortSelect type="house" />
        </div>
      </div>
      <div className="grid gap-4 mt-4 md:grid-cols-2 lg:grid-cols-4">
        {userHouses.sort(mapUnitsSortFunc).map(({ house_num, x, y, amount, ts, type = "house" }) => {
          const [address] = getAddressFromNearestRoad(roads, { x, y }, house_num);

          return (
            <Link onClick={() => changeHouse({ x, y, type })} to={`/?c=${x},${y},${type}`} key={house_num}>
              <Card>
                <CardHeader className="pb-2 space-y-0 ">
                  <CardTitle>
                    <TextScramble className="text-sm font-semibold">{address ?? `House ${house_num}`}</TextScramble>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <InfoPanel labelAnimated>
                    <InfoPanel.Item label="Amount">
                      <TextScramble className="inline">{toLocalString(amount / 10 ** decimals!)}</TextScramble>{" "}
                      <small>
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

