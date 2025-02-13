import { useRef } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BuyNewPlotForm } from "@/forms/BuyNewPlotForm";
import { IRefPhaserGame, PhaserGame } from "@/game/PhaserGame";
import { useMapUnitSelection } from "@/hooks/useMapUnitSelection";
import { useAaStore } from "@/store/aa-store";
import { useSettingsStore } from "@/store/settings-store";

export default () => {
  const phaserRef = useRef<IRefPhaserGame | null>(null);
  const { loading, error } = useAaStore((state) => state);
  const settingsInited = useSettingsStore((state) => state.inited);

  const [selectedMapUnit] = useMapUnitSelection();

  return (
    <div className="grid grid-cols-3 gap-8 md:grid-cols-5">
      <div className="col-span-3">
        <Card>
          <CardHeader>
            <CardTitle>City map</CardTitle>
          </CardHeader>
          <CardContent>
            {!loading && !error && settingsInited ? (
              <PhaserGame ref={phaserRef} />
            ) : (
              <div className="game-container-placeholder">
                <Skeleton className="w-full h-[80vh] rounded-xl" />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      <div className="col-span-2">
        <div className="grid grid-cols-1 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Selected plot</CardTitle>
              <CardDescription>Click on the house to see all the information about it.</CardDescription>
            </CardHeader>

            {selectedMapUnit ? (
              <CardContent>
                {selectedMapUnit.x} - {selectedMapUnit.y}
              </CardContent>
            ) : (
              <CardContent className="text-primary">No plot selected</CardContent>
            )}
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Buy new plot</CardTitle>
              <CardDescription>When you buy a plot, it is created in a random location.</CardDescription>
            </CardHeader>

            <CardContent>
              <BuyNewPlotForm />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

