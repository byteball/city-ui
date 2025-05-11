import { useRef } from "react";

import { PageLayout } from "@/components/layout/page-layout";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ShortcodesOnSaleList } from "./components/ShortcodesOnSaleList";

import { useAaParams, useAaStore } from "@/store/aa-store";
import { useSettingsStore } from "@/store/settings-store";

import { PhaserGame } from "@/game/PhaserGame";
import { SelectedPlotOnSale } from "./components/SelectedPlotOnSale";

export default () => {
  const { loading, error, loaded } = useAaStore((state) => state);
  const settingsInited = useSettingsStore((state) => state.inited);
  const gameColumnRef = useRef<HTMLDivElement>(null);
  const params = useAaParams();

  const shownSkeleton = loading || !!error || !settingsInited || !loaded;

  return (
    <PageLayout title="P2P Market" description="Buy plots and shortcodes from other users here" loading={false}>
      <div className="grid grid-cols-8 gap-8">
        <div className="col-span-8 md:col-span-5">
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">Plots for sale</h2>
              <CardDescription>Click the plot you want to purchase.</CardDescription>
            </CardHeader>
            <CardContent>
              <div ref={gameColumnRef}>
                {!shownSkeleton ? (
                  <PhaserGame gameOptions={{ displayMode: "market", params }} />
                ) : (
                  <div className="game-container-placeholder">
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

