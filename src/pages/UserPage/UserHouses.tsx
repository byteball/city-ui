import moment from "moment";
import { FC, useCallback } from "react";
import { Link } from "react-router";

import { InfoPanel } from "@/components/ui/_info-panel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TextScramble } from "@/components/ui/text-scramble";

import { asNonNegativeNumber } from "@/lib/asNonNegativeNumber";
import { useAaStore } from "@/store/aa-store";
import { mapUnitsByOwnerAddressSelector } from "@/store/selectors/mapUnitsSelector";
import { useSettingsStore } from "@/store/settings-store";

import { toLocalString } from "@/lib";

interface IUserHousesProps {
  address: string;
}

export const UserHouses: FC<IUserHousesProps> = ({ address }) => {
  const userUnits = useAaStore((state) => mapUnitsByOwnerAddressSelector(state, address));
  const { symbol, decimals } = useSettingsStore();

  const userHouses = userUnits.filter((u) => u.type === "house");

  const changeHouse = useCallback(({ x, y }: { x: number; y: number }) => {
    useSettingsStore.getState().setSelectedMapUnit({ x: asNonNegativeNumber(x), y: asNonNegativeNumber(y) });
  }, []);

  if (userHouses.length === 0) return null;

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold">Houses</h2>
      <div className="grid gap-4 mt-4 md:grid-cols-2 lg:grid-cols-4">
        {userHouses.map(({ plot_num, x, y, amount, ts }) => (
          <Link onClick={() => changeHouse({ x, y })} to={`/?c=${x},${y}`} key={plot_num}>
            <Card>
              <CardHeader className="pb-2 space-y-0 ">
                <CardTitle>
                  <TextScramble className="text-sm font-semibold">{`House ${plot_num.toString()}`}</TextScramble>
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
        ))}
      </div>
    </div>
  );
};

