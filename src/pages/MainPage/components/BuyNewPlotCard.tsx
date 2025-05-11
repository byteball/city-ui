import appConfig from "@/appConfig";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { BuyNewPlotForm } from "@/forms/BuyNewPlotForm";

export const BuyNewPlotCard = () => (
  <Card highlight>
    <CardHeader>
      <CardTitle>Buy new plot</CardTitle>
      <CardDescription>When you buy a plot, it is created in a random location.</CardDescription>
    </CardHeader>

    <CardContent>
      <BuyNewPlotForm />
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

