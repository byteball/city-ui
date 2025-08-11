import { InfoIcon } from "lucide-react";
import { FC, memo, useEffect, useState } from "react";

import { QRButton } from "@/components/ui/_qr-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

import { getPlotPrice } from "@/aaLogic/getPlotPrice";
import { generateLink, toLocalString } from "@/lib";
import { calculateUserProbability } from "@/lib/calculateUserProbability";

import { useAaParams, useAaStore } from "@/store/aa-store";
import { mapUnitsByOwnerAddressSelector } from "@/store/selectors/mapUnitsSelector";
import { useSettingsStore } from "@/store/settings-store";

import httpClient from "@/services/obyteHttpClient";
import client from "@/services/obyteWsClient";

import appConfig from "@/appConfig";

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
  const { decimals, symbol, asset, walletAddress } = useSettingsStore((state) => state);
  const balance = useAaStore((state) => Number(state.state?.[`user_land_${address}`] ?? 0));
  const followUpBalance = useAaStore((state) => Number(state.state?.[`balance_${address}`] ?? 0));
  const city = useAaStore((state) => state.state.city_city)!;

  const params = useAaParams();
  const { totalPrice } = getPlotPrice(params);

  const balanceView = toLocalString(balance / 10 ** (decimals ?? 0));
  const walletBalanceView = toLocalString(walletBalance.amount / 10 ** (decimals ?? 0));
  const userUnits = useAaStore((state) => mapUnitsByOwnerAddressSelector(state, address));
  const { matching_probability, referral_boost } = params;

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

  const canBuyFromBalance = totalPrice <= followUpBalance;

  const buyFromBalanceUrl = generateLink({
    amount: 1e4,
    aa: appConfig.AA_ADDRESS,
    from_address: address,
    is_single: true,
    data: {
      buy_from_balance: 1,
      buy: 1
    }
  });

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
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="flex space-x-1 text-sm font-medium">
            <div>Rewards balance</div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger className="cursor-pointer">
                  <InfoIcon className="w-3 h-3 ml-1 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent className="w-auto max-w-[200px]">
                  <div className="text-sm">Accumulated from follow-up rewards</div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            <div>{toLocalString((followUpBalance / 10 ** decimals!).toFixed(4))} {symbol}</div>
          </div>

          {canBuyFromBalance ? <div className="mt-2">
            <QRButton href={buyFromBalanceUrl} disabled={address !== walletAddress} size="sm" variant="secondary">
              Buy a plot from this balance
            </QRButton>
          </div> : <div className="mt-2 text-xs">Accumulate at least {toLocalString(totalPrice / 10 ** decimals!)} CITY to buy a plot from this balance</div>}
        </CardContent>
      </Card>
    </div >
  );
});

