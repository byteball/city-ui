import { FC, memo, useEffect, useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toLocalString } from "@/lib";
import { calculateUserProbability } from "@/lib/calculateUserProbability";
import { useAaParams, useAaStore } from "@/store/aa-store";
import { mapUnitsByOwnerAddressSelector } from "@/store/selectors/mapUnitsSelector";
import { useSettingsStore } from "@/store/settings-store";

import httpClient from "@/services/obyteHttpClient";
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
  const overallProb = calculateUserProbability(
    userUnits.filter((unit) => unit.type === "plot"),
    city,
    matching_probability,
    referral_boost
  );

  useEffect(() => {
    let cancelled = false;
    if (!address || !asset) return;

    setWalletBalance({ amount: 0, loaded: false, loading: true });

    const balanceRequest = client ? client.api
      .getBalances([address]) : httpClient.getBalances([address]);

    balanceRequest.then((balances) => {
      const typedBalances = balances as Record<string, Record<string, { total: number }>>;
      const userBalance = typedBalances[address];
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
              <div>Balance</div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{`${balanceView} ${symbol}`}</div>
            <div className="text-xs text-muted-foreground">
              {`Plus ${walletBalanceView} ${symbol!} in the wallet`}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Skeleton className="w-full h-full" />
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium">
            <div>Probability of matching</div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            <div>{toLocalString((overallProb * 100).toFixed(4)) + "%"}</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

