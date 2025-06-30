import moment from "moment";
import { memo } from "react";

import { BuyNewPlotCard, MapEngineCard, SelectedUnitMapCard } from "./components";
import { PrelaunchCard } from "./components/PrelaunchCard";

import { useSyncSelectedUnitQueryParams } from "@/hooks/useSyncSelectedUnitQueryParams";

import appConfig from "@/appConfig";

const MainPageContent = memo(() => {
  const isAfterLaunch = moment().utc().isAfter(moment.utc(appConfig.LAUNCH_DATE));

  return (
    <div className="grid grid-cols-5 gap-6 px-4 md:px-0">
      <div className="col-span-5 md:col-span-3">
        <MapEngineCard />
      </div>
      <div className="col-span-5 md:col-span-2">
        <div className="grid grid-cols-1 gap-8">
          <SelectedUnitMapCard sceneType="main" />
          {isAfterLaunch ? <BuyNewPlotCard /> : <PrelaunchCard />}
        </div>
      </div>
    </div>
  );
});

MainPageContent.displayName = "MainPageContent";

export default () => {
  useSyncSelectedUnitQueryParams();
  return <MainPageContent />;
};

