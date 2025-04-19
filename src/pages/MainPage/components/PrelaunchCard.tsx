import appConfig from "@/appConfig";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PrelaunchForm } from "@/forms/PrelaunchForm";
import { useSettingsStore } from "@/store/settings-store";
import moment from "moment";

export const PrelaunchCard = () => {
  const { symbol } = useSettingsStore((state) => state);

  return (
    <Card>
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
    </Card>
  );
};

