import moment from "moment";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PrelaunchForm } from "@/forms/PrelaunchForm";
import { useSettingsStore } from "@/store/settings-store";

import appConfig from "@/appConfig";

export const PrelaunchCard = () => {
  const { symbol } = useSettingsStore((state) => state);

  return (
    <Card highlight>
      <CardHeader>
        <CardTitle>Buy new plot (Prelaunch)</CardTitle>
        <CardDescription>
          You can purchase new plots of land during the pre-launch phase and earn {symbol} tokens. The pre-launch phase
          ends on <b>{moment.utc(appConfig.LAUNCH_DATE).format("LLL")}</b>, after which CITY will launch.
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

