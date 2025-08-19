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
import { ICity, IHouse } from "@/global";
import { asNonNegativeNumber, mapUnitsSortFunc, toLocalString } from "@/lib";
import { getAddressFromNearestRoad } from "@/lib/getAddressCoordinate";
import { getMatches } from "@/lib/getMatches";
import { MapUnitsSortSelect } from "./MapUnitsSortSelect";

interface IUserNeighborsProps {
  address: string;
}

export const UserNeighbors: FC<IUserNeighborsProps> = ({ address }) => {
  const userUnits = useAaStore((state) => mapUnitsByOwnerAddressSelector(state, address));
  const { symbol, decimals } = useSettingsStore();
  const aaState = useAaStore((state) => state);
  const mapUnits = mapUnitsSelector(aaState);
  const cityStats = aaState.state.city_city as ICity;
  const roads = getRoads(mapUnits, String(cityStats?.mayor));
  const matches = useMemo(() => getMatches(aaState), [aaState]);

  const neighborPlots = useMemo(() => userUnits
    .filter((u) => u.type === "house")
    .map((h) => matches.get(h.plot_num))
    .filter((m) => m?.built_ts)
    .map((h) => h?.neighbor_plot),
    [userUnits, matches]);

  const changeHouse = useCallback(({ house_num, type = "house" }: { house_num: number; type: "house" }) => {
    useSettingsStore.getState().setSelectedMapUnit({ num: asNonNegativeNumber(house_num), type });
  }, []);

  const neighborHouses = useMemo(
    () =>
      mapUnitsSelector(aaState).filter(
        (u) => u.type === "house" && neighborPlots.includes(u.plot_num)
      ) as IHouse[],
    [neighborPlots, aaState]
  );

  const sortedNeighborHouses = useMemo(
    () => [...neighborHouses].sort((a, b) => mapUnitsSortFunc(a, b, true)),
    [neighborHouses]
  );

  if (neighborHouses.length === 0) return null;

  return (
    <div className="mt-8">
      <div className="flex flex-col items-start justify-between md:flex-row">
        <div className="mb-4 md:mb-0">
          <h2 className="text-xl font-semibold">
            Neighbors <span className="text-muted-foreground">({neighborHouses.length})</span>
          </h2>
        </div>

        {neighborHouses.length > 1 ? (
          <div>
            <MapUnitsSortSelect type="neighbor" />
          </div>
        ) : null}
      </div>

      <div className="grid gap-4 mt-4 md:grid-cols-2 lg:grid-cols-4 auto-rows-auto">
        {sortedNeighborHouses.map(({ owner, house_num, x, y, amount, ts, shortcode, type = "house", info }) => {
          const [address] = getAddressFromNearestRoad(roads, { x, y }, house_num);

          return (
            <Link
              onClick={() => changeHouse({ house_num, type })}
              to={`/?house=${house_num}`}
              key={house_num}
              className="flex h-full"
            >
              <Card className="flex flex-col flex-1">
                <CardHeader className="pb-2 space-y-0 ">
                  <CardTitle>
                    <div className="text-sm font-semibold">{address ?? `House ${house_num}`}</div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1">
                  <InfoPanel>
                    <InfoPanel.Item label="Amount">
                      <div className="inline">{toLocalString(amount / 10 ** decimals!)}</div>{" "}
                      <small>
                        <div className="inline">{symbol!}</div>{" "}
                      </small>
                    </InfoPanel.Item>

                    <InfoPanel.Item label="Owner">
                      <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2">
                        <Link to={`/user/${owner}`} className="truncate text-link">
                          {owner}
                        </Link>
                      </div>
                    </InfoPanel.Item>


                    {shortcode ? (
                      <InfoPanel.Item label="Shortcode">
                        <div className="inline">{shortcode.toLowerCase()}</div>
                      </InfoPanel.Item>
                    ) : null}

                    <InfoPanel.Item label="Created on">
                      <div className="inline">{moment(ts * 1000).format("ll")}</div>
                    </InfoPanel.Item>

                    {info ? (
                      <div className="overflow-hidden text-sm">
                        <div className="mt-4 mb-1 font-semibold">Additional information</div>
                        <AdditionalInfo
                          info={info}
                          itemsType="info-panel"
                        />
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

