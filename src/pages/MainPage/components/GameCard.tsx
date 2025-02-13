import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { IRefPhaserGame, PhaserGame } from "@/game/PhaserGame";
import { useSyncCoordinates } from "@/hooks/useSyncCoordinates";
import { useAaStore } from "@/store/aa-store";
import { useSettingsStore } from "@/store/settings-store";
import { useRef } from "react";

export const GameCard = () => {
  const phaserRef = useRef<IRefPhaserGame | null>(null);
  const { loading, error, loaded } = useAaStore((state) => state);
  const settingsInited = useSettingsStore((state) => state.inited);
  useSyncCoordinates();

  const shownSkeleton = loading || !!error || !settingsInited || !loaded;

  return (
    <Card>
      <CardHeader>
        <CardTitle>City map</CardTitle>
      </CardHeader>
      <CardContent>
        {!shownSkeleton ? (
          <PhaserGame ref={phaserRef} />
        ) : (
          <div className="game-container-placeholder">
            <Skeleton className="w-full h-[80vh] rounded-xl" />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

