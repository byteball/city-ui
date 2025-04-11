import { PageLayout } from "@/components/layout/page-layout";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { IRefPhaserGame, PhaserGame } from "@/game/PhaserGame";
import { useAaStore } from "@/store/aa-store";
import { useSettingsStore } from "@/store/settings-store";
import { useRef } from "react";

export default () => {
  const phaserRef = useRef<IRefPhaserGame | null>(null);
  const { loading, error, loaded } = useAaStore((state) => state);
  const settingsInited = useSettingsStore((state) => state.inited);
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
              <h2 className="text-xl font-semibold">Plots</h2>
            </CardHeader>
            <CardContent>
              {!shownSkeleton ? (
                <PhaserGame key="phaser-game" ref={phaserRef} />
              ) : (
                <div className="game-container-placeholder">
                  <Skeleton className="w-full h-[80vh] rounded-xl" />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        <div className="col-span-3">
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">Shortcodes</h2>
            </CardHeader>
            <CardContent>test</CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
};

