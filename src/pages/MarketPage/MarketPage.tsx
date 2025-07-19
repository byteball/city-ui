import { useEffect, useMemo, useRef } from "react";

import { PageLayout } from "@/components/layout/page-layout";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ShortcodesOnSaleList } from "./components/ShortcodesOnSaleList";

import { useAaParams, useAaStore } from "@/store/aa-store";
import { useSettingsStore } from "@/store/settings-store";

import { PhaserMapEngine } from "@/engine/PhaserMapEngine";
import { IEngineOptions } from "@/global";
import { SelectedPlotOnSale } from "./components/SelectedPlotOnSale";

export default () => {
  const { loading, error, loaded } = useAaStore((state) => state);
  const settingsInited = useSettingsStore((state) => state.inited);
  const engineColumnRef = useRef<HTMLDivElement>(null);
  const params = useAaParams();

  const shownSkeleton = loading || !!error || !settingsInited || !loaded;

  // Memoize engineOptions to prevent unnecessary re-creation and scene destruction
  const engineOptions = useMemo(
    () => ({
      displayMode: "market" as const,
      params,
    } as IEngineOptions),
    [params]
  );

  useEffect(() => {
    useSettingsStore.getState().setSelectedMarketPlot(null);
  }, []);

  return (
    <PageLayout
      title="P2P Market"
      seoTitle="buy and sell plots of land"
      description="Buy plots and shortcodes from other users here"
      seoDescription="P2P market where existing plots of land can be bought and sold"
      loading={!settingsInited}
    >
      <div className="grid grid-cols-8 gap-8">
        <div className="col-span-8 md:col-span-5">
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">Plots for sale</h2>
              <CardDescription>Click the plot you want to purchase.</CardDescription>
            </CardHeader>
            <CardContent>
              <div ref={engineColumnRef}>
                {!shownSkeleton ? (
                  <PhaserMapEngine engineOptions={engineOptions} />
                ) : (
                  <div className="engine-container-placeholder">
                    <Skeleton className="w-full h-[80vh] rounded-xl" />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="col-span-8 md:col-span-3">
          <div className="mb-8">
            <SelectedPlotOnSale />
          </div>

          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">Shortcodes for sale</h2>
            </CardHeader>

            <CardContent>
              <ShortcodesOnSaleList />
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
};

