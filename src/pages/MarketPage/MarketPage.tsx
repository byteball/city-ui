import { useRef } from "react";

import { PageLayout } from "@/components/layout/page-layout";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ShortcodesOnSaleList } from "./components/ShortcodesOnSaleList";

import { useAaParams, useAaStore } from "@/store/aa-store";
import { useSettingsStore } from "@/store/settings-store";

import { PhaserGame } from "@/game/PhaserGame";

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
        <div className="col-span-5">
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">Plots on sale</h2>
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

        <div className="col-span-3">
          <Card className="mb-8">
            <CardHeader>
              <h2 className="text-xl font-semibold">Selected plot</h2>
            </CardHeader>
            <CardContent>Selected</CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">Shortcodes</h2>
              <CardDescription>Lorem ipsum for shortcodes</CardDescription>
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

