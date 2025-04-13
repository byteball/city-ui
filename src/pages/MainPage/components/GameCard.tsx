import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { IRefPhaserGame, PhaserGame } from "@/game/PhaserGame";
import { IGameOptions } from "@/global";
import { useSyncCoordinates } from "@/hooks/useSyncCoordinates";
import { useAaParams, useAaStore } from "@/store/aa-store";
import { useSettingsStore } from "@/store/settings-store";
import { memo, useMemo, useRef } from "react";

export const GameCard = memo(() => {
  const phaserRef = useRef<IRefPhaserGame | null>(null);
  const { loading, error, loaded } = useAaStore((state) => state);
  const settingsInited = useSettingsStore((state) => state.inited);
  const params = useAaParams();

  useSyncCoordinates();

  const shownSkeleton = loading || !!error || !settingsInited || !loaded;

  const gameOptions = useMemo<IGameOptions>(() => ({ displayMode: "main", params }), [params]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>City map</CardTitle>
      </CardHeader>
      <CardContent>
        {!shownSkeleton ? (
          <PhaserGame ref={phaserRef} gameOptions={gameOptions} />
        ) : (
          <div className="game-container-placeholder">
            <Skeleton className="w-full h-[80vh] rounded-xl" />
          </div>
        )}
      </CardContent>
    </Card>
  );
});

GameCard.displayName = "GameCard";

