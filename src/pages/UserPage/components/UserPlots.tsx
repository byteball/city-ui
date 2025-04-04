import moment from "moment";
import { FC, useCallback } from "react";
import { Link } from "react-router";

import { InfoPanel } from "@/components/ui/_info-panel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TextScramble } from "@/components/ui/text-scramble";

import { useAaStore } from "@/store/aa-store";
import { mapUnitsByOwnerAddressSelector } from "@/store/selectors/mapUnitsSelector";
import { useSettingsStore } from "@/store/settings-store";

import { asNonNegativeNumber, toLocalString } from "@/lib";

interface IUserPlotsProps {
  address: string;
}

export const UserPlots: FC<IUserPlotsProps> = ({ address }) => {
  const userUnits = useAaStore((state) => mapUnitsByOwnerAddressSelector(state, address));
  const { symbol, decimals } = useSettingsStore();

  const userPlots = userUnits.filter((u) => u.type === "plot");

  const changePlot = useCallback(({ x, y }: { x: number; y: number }) => {
    useSettingsStore.getState().setSelectedMapUnit({ x: asNonNegativeNumber(x), y: asNonNegativeNumber(y) });
  }, []);

  const decimalsFactor = 10 ** decimals!;

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold">Plots</h2>
      <div className="grid gap-4 mt-4 md:grid-cols-2 lg:grid-cols-4">
        {userPlots.map(({ plot_num, x, y, amount, rented_amount = 0, ts }) => (
          <Link onClick={() => changePlot({ x, y })} to={`/?c=${x},${y}`} key={plot_num}>
            <Card>
              <CardHeader className="pb-2 space-y-0 ">
                <CardTitle>
                  <TextScramble className="text-sm font-semibold">{`Plot ${plot_num.toString()}`}</TextScramble>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <InfoPanel labelAnimated>
                  <InfoPanel.Item label="Total amount">
                    <TextScramble className="inline">{toLocalString((amount + rented_amount) / decimalsFactor)}</TextScramble>{" "}
                    <small>
                      <TextScramble className="inline">{symbol!}</TextScramble>{" "}
                    </small>
                  </InfoPanel.Item>
                  <InfoPanel.Item label="Rented">
                    <TextScramble className="inline">{toLocalString(rented_amount / decimalsFactor)}</TextScramble>{" "}
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

