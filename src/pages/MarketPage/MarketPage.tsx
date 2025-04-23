import { useRef } from "react";

import { PageLayout } from "@/components/layout/page-layout";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ShortcodesOnSaleList } from "./components/ShortcodesOnSaleList";

import { useAaParams, useAaStore } from "@/store/aa-store";
import { useSettingsStore } from "@/store/settings-store";

import { PhaserGame } from "@/game/PhaserGame";
import { Link } from "react-router";
import { SelectedPlotOnSale } from "./components/SelectedPlotOnSale";

export default () => {
  const { loading, error, loaded } = useAaStore((state) => state);
  const settingsInited = useSettingsStore((state) => state.inited);
  const gameColumnRef = useRef<HTMLDivElement>(null);
  const params = useAaParams();

  const shownSkeleton = loading || !!error || !settingsInited || !loaded;

  return (
    <PageLayout
      title="Market"
      description="lorem ipsum dolor sit amet consectetur adipisicing elit. Quas cupiditate laboriosam fugiat."
      loading={false}
    >
      <div className="grid grid-cols-8 gap-8">
        <div className="col-span-8 md:col-span-5">
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">Plots on sale</h2>
              <CardDescription>Click on the plot you want to purchase.</CardDescription>
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
              <h2 className="text-xl font-semibold">Shortcodes</h2>
              <CardDescription>
                To sell a shortcode, select your house on the{" "}
                <Link to="/" className="text-link">
                  main map
                </Link>{" "}
                and click "Sell Shortcode" button.
              </CardDescription>
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

