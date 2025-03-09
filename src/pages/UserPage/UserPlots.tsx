import { InfoPanel } from "@/components/ui/_info-panel";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { toLocalString } from "@/lib";
import { asNonNegativeNumber } from "@/lib/asNonNegativeNumber";
import { useAaStore } from "@/store/aa-store";
import { mapUnitsByOwnerAddressSelector } from "@/store/selectors/mapUnitsSelector";
import { useSettingsStore } from "@/store/settings-store";
import { FC } from "react";
import { Link } from "react-router";

interface IUserPlotsProps {
  address: string;
}

export const UserPlots: FC<IUserPlotsProps> = ({ address }) => {
  const userUnits = useAaStore((state) => mapUnitsByOwnerAddressSelector(state, address));
  const city = useAaStore((state) => state.state.city_city)!;
  const { symbol, decimals, asset, inited } = useSettingsStore();

  const userPlots = userUnits.filter((u) => u.type === "plot");

  console.log("userPlots", userPlots);

  const changePlot = ({ x, y }: { x: number; y: number }) => {
    useSettingsStore.getState().setSelectedMapUnit({ x: asNonNegativeNumber(x), y: asNonNegativeNumber(y) });
  };

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold">Plots</h2>
      <div className="grid gap-4 mt-4 md:grid-cols-2 lg:grid-cols-4">
        {userPlots.map(({ plot_num, x, y, amount, rented_amount = 0 }) => (
          <Link onClick={() => changePlot({ x, y })} to={`/?c=${x},${y}`} key={plot_num}>
            <Card key={plot_num}>
              <CardHeader>
                <p className="text-sm font-semibold">Plot {plot_num}</p>
              </CardHeader>
              <CardContent>
                <InfoPanel>
                  <InfoPanel.Item label="Total amount">
                    {toLocalString((amount + rented_amount) / 10 ** decimals!)} <small>{symbol}</small>{" "}
                  </InfoPanel.Item>
                  <InfoPanel.Item label="Rented">
                    {toLocalString((rented_amount) / 10 ** decimals!)} <small>{symbol}</small>{" "}
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

