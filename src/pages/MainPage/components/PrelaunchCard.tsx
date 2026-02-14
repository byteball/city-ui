import { ObyteLink } from "@/components/ui/_obyte_link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

import { PrelaunchForm } from "@/forms/PrelaunchForm";
import { useAaParams } from "@/store/aa-store";
import { useSettingsStore } from "@/store/settings-store";

import { toLocalString } from "@/lib";

import appConfig from "@/appConfig";

export const PrelaunchCard = () => {
  const { symbol, decimals } = useSettingsStore((state) => state);
  const { plot_price } = useAaParams();

  return (
    <Card highlight>
      <CardHeader>
        <CardTitle>Buy a new plot (Initial sale)</CardTitle>
        <CardDescription>
          It will be created at a random location. If it becomes a neighbor of another plot, you receive 2 new plots
          worth {toLocalString(plot_price / 10 ** decimals!)} {symbol} each. You also get introduced to the neighbor and receive a house on your plot.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <PrelaunchForm />
      </CardContent>

      <CardFooter className="block text-xs text-muted-foreground">
        Before buying, you need to link your Obyte address to your{" "}
        <ObyteLink href={appConfig.DISCORD_BOT_URL} className="text-link">
          discord
        </ObyteLink>{" "}
        and/or{" "}
        <ObyteLink href={appConfig.TELEGRAM_BOT_URL} className="text-link">
          {" "}
          telegram
        </ObyteLink>{" "}
        usernames. This is necessary to notify you when you get a neighbor and become eligible for rewards.
      </CardFooter>
    </Card>
  );
};

