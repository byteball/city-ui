import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PrelaunchForm } from "@/forms/PrelaunchForm";
import { useSettingsStore } from "@/store/settings-store";

import appConfig from "@/appConfig";

export const PrelaunchCard = () => {
  const { symbol } = useSettingsStore((state) => state);

  return (
    <Card highlight>
      <CardHeader>
        <CardTitle>Buy a new plot (Initial sale)</CardTitle>
        <CardDescription>
          During the initial sale, while buying a plot, you also buy {symbol} at the fixed rate 1 GBYTE = 1000 {symbol}{" "}
          for 10% of the plot price.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <PrelaunchForm />
      </CardContent>

      <CardFooter className="block text-xs text-muted-foreground">
        Before buying, you need to link your Obyte address to your{" "}
        <a href={appConfig.DISCORD_BOT_URL} className="text-link">
          discord
        </a>{" "}
        and/or
        <a href={appConfig.TELEGRAM_BOT_URL} className="text-link">
          {" "}
          telegram
        </a>{" "}
        usernames. This is necessary to notify you when you get a neighbor and become eligible for rewards.
      </CardFooter>
    </Card>
  );
};

