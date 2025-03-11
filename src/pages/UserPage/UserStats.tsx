import { FC } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TextScramble } from "@/components/ui/text-scramble";
import { toLocalString } from "@/lib";
import { calculateOverallProbability } from "@/lib/calculateOverallProbability";
import { useAaParams, useAaStore } from "@/store/aa-store";
import { mapUnitsByOwnerAddressSelector } from "@/store/selectors/mapUnitsSelector";
import { useSettingsStore } from "@/store/settings-store";

const price = 2.8; // TODO: fix it

interface IUserStatsProps {
  address: string;
}

export const UserStats: FC<IUserStatsProps> = ({ address }) => {
  const decimals = useSettingsStore((state) => state.decimals);
  const symbol = useSettingsStore((state) => state.symbol);
  const balance = useAaStore((state) => Number(state.state?.[`user_land_${address}`] ?? 0));
  const city = useAaStore((state) => state.state.city_city)!;

  const balanceInUSDView = "$" + toLocalString(price * (balance / 10 ** (decimals ?? 0)));
  const balanceView = toLocalString(balance / 10 ** (decimals ?? 0));
  const userUnits = useAaStore((state) => mapUnitsByOwnerAddressSelector(state, address));
  const { matching_probability, referral_boost } = useAaParams();

  const overallProb = calculateOverallProbability(userUnits, city, matching_probability, referral_boost);

  return (
    <div className="grid gap-4 mt-8 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium">
            <TextScramble>Balance</TextScramble>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <TextScramble className="text-2xl font-bold">{`${balanceView} ${symbol}`}</TextScramble>
          <TextScramble className="text-xs text-muted-foreground">{balanceInUSDView}</TextScramble>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium">
            <TextScramble>Plots count</TextScramble>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <TextScramble className="text-2xl font-bold">{toLocalString(userUnits.length)}</TextScramble>
          {/* <p className="text-xs text-muted-foreground"></p> */}
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium">
            <TextScramble>Match overall chance</TextScramble>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            <TextScramble>{toLocalString((overallProb * 100).toFixed(4)) + "%"}</TextScramble>
          </div>
          {/* <TextScramble className="text-xs text-muted-foreground">{`Including ${toLocalString(0.123)}% for referrals`}</TextScramble> */}
        </CardContent>
      </Card>
    </div>
  );
};

