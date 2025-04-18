import { FC, memo, useEffect, useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TextScramble } from "@/components/ui/text-scramble";
import { toLocalString } from "@/lib";
import { calculateOverallProbability } from "@/lib/calculateOverallProbability";
import { useAaParams, useAaStore } from "@/store/aa-store";
import { mapUnitsByOwnerAddressSelector } from "@/store/selectors/mapUnitsSelector";
import { useSettingsStore } from "@/store/settings-store";

import client from "@/services/obyteWsClient";

interface IUserStatsProps {
  address: string;
}

interface IWalletBalance {
  amount: number;
  loaded: boolean;
  loading: boolean;
}

export const UserStats: FC<IUserStatsProps> = memo(({ address }) => {
  const [walletBalance, setWalletBalance] = useState<IWalletBalance>({ amount: 0, loaded: false, loading: false });
  const { decimals, symbol, asset } = useSettingsStore((state) => state);
  const balance = useAaStore((state) => Number(state.state?.[`user_land_${address}`] ?? 0));
  const city = useAaStore((state) => state.state.city_city)!;

  const balanceView = toLocalString(balance / 10 ** (decimals ?? 0));
  const walletBalanceView = toLocalString(walletBalance.amount / 10 ** (decimals ?? 0));
  const userUnits = useAaStore((state) => mapUnitsByOwnerAddressSelector(state, address));
  const { matching_probability, referral_boost } = useAaParams();
  const overallProb = calculateOverallProbability(userUnits, city, matching_probability, referral_boost);

  useEffect(() => {
    let cancelled = false;
    if (!address || !asset) return;
    setWalletBalance({ amount: 0, loaded: false, loading: true });
    client.api
      .getBalances([address])
      .then((balances: any) => {
        const userBalance = balances[address];
        return userBalance?.[asset]?.total ?? 0;
      })
      .then((amount) => {
        if (!cancelled) {
          setWalletBalance({ amount, loaded: true, loading: false });
        }
      })
      .catch((error) => {
        console.error("Failed to fetch balances:", error);
        if (!cancelled) {
          setWalletBalance({ amount: 0, loaded: true, loading: false });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [address, asset]);

  return (
    <div className="grid gap-4 mt-8 md:grid-cols-2 lg:grid-cols-4 auto-rows-auto">
      {walletBalance.loaded ? (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">
              <TextScramble>Balance</TextScramble>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TextScramble className="text-2xl font-bold">{`${balanceView} ${symbol}`}</TextScramble>
            <TextScramble className="text-xs text-muted-foreground">
              {`Plus ${walletBalanceView} ${symbol!} in the wallet`}
            </TextScramble>
          </CardContent>
        </Card>
      ) : (
        <Skeleton className="w-full h-full" />
      )}

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
});

