import { useMemo } from "react";

import { PageLayout } from "@/components/layout/page-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { columns } from "./components/Columns";
import { LeaderboardTable } from "./components/LeaderboardTable";

import { useAaStore } from "@/store/aa-store";
import { mapUnitsSelector } from "@/store/selectors/mapUnitsSelector";
import { useSettingsStore } from "@/store/settings-store";

import { toLocalString } from "@/lib";
import { ILeaderboardData } from "./types";
import { getLeaderboardData } from "./utils/getLeaderboardData";

export default () => {
  const { decimals, symbol, inited } = useSettingsStore((state) => state);
  const aaState = useAaStore((state) => state);

  const { loaded, state } = aaState;
  const stats = state?.city_city ?? { total_land: 0, total_houses: 0, count_houses: 0, count_plots: 0 };

  const totalLand = stats.total_land ?? 0;
  const totalHouses = stats.count_houses ?? 0;
  const totalPlots = stats.count_plots ?? 0;

  const mapUnits = mapUnitsSelector(aaState);
  const leaderboardData: ILeaderboardData = useMemo(() => getLeaderboardData(mapUnits), [mapUnits]);

  return <PageLayout
    title="Leaderboard"
    ogImageKey="leaderboard"
    loading={!inited || !loaded}
    description="Top real estate owners in the City"
  >
    <div className="grid gap-4 mt-8 mb-8 md:grid-cols-2 lg:grid-cols-4 auto-rows-auto">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium">
            <div>Total {symbol}</div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{toLocalString(+totalLand / 10 ** decimals!)} <small>{symbol}</small></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium">
            <div>Total plots</div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalPlots}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium">
            <div>Total houses</div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalHouses}</div>
        </CardContent>
      </Card>
    </div>

    <div>
      <LeaderboardTable data={leaderboardData} columns={columns} />
    </div>
  </PageLayout>
}