import { memo, useMemo, useRef } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { IRefPhaserMapEngine, PhaserMapEngine } from "@/engine/PhaserMapEngine";
import { IEngineOptions } from "@/global";
import { useAaParams, useAaStore } from "@/store/aa-store";
import { useSettingsStore } from "@/store/settings-store";

export const MapEngineCard = memo(() => {
  const phaserRef = useRef<IRefPhaserMapEngine | null>(null);
  const { loading, error, loaded } = useAaStore((state) => state);
  const settingsInited = useSettingsStore((state) => state.inited);
  const params = useAaParams();

  const shownSkeleton = loading || !!error || !settingsInited || !loaded;

  const engineOptions = useMemo<IEngineOptions>(() => ({ displayMode: "main", params }), [params]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your space in the decentralized future</CardTitle>
      </CardHeader>
      <CardContent>
        {!shownSkeleton ? (
          <PhaserMapEngine ref={phaserRef} engineOptions={engineOptions} />
        ) : (
          <div className="engine-container-placeholder">
            <Skeleton className="w-full h-[80vh] rounded-xl" />
          </div>
        )}
      </CardContent>
    </Card>
  );
});

MapEngineCard.displayName = "MapEngineCard";

