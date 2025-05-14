import moment from "moment";

import { BuyNewPlotCard, GameCard, SelectedUnitMapCard } from "./components";
import { PrelaunchCard } from "./components/PrelaunchCard";

import { useSyncSelectedUnitQueryParams } from "@/hooks/useSyncSelectedUnitQueryParams";

import appConfig from "@/appConfig";

export default () => {
  useSyncSelectedUnitQueryParams();

  return (
    <div className="grid grid-cols-5 gap-6 px-4 md:px-0">
      <div className="col-span-5 md:col-span-3">
        <GameCard />
      </div>
      <div className="col-span-5 md:col-span-2">
        <div className="grid grid-cols-1 gap-8">
          <SelectedUnitMapCard sceneType="main" />
          {moment().utc().isAfter(moment.utc(appConfig.LAUNCH_DATE)) ? <BuyNewPlotCard /> : <PrelaunchCard />}
        </div>
      </div>
    </div>
  );
};

