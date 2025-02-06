import { useRef } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { IRefPhaserGame, PhaserGame } from "@/game/PhaserGame";
import { useSettingsStore } from "@/store/settings-store";

export default () => {
  const phaserRef = useRef<IRefPhaserGame | null>(null);
  const selectedPlot = useSettingsStore((state) => state.selectedPlot);

  return (
    <div className="grid grid-cols-3 gap-8 md:grid-cols-5">
      <div className="col-span-3">
        <Card>
          <CardHeader>
            <CardTitle>City map</CardTitle>
          </CardHeader>
          <CardContent>
            <PhaserGame ref={phaserRef} />
          </CardContent>
        </Card>
      </div>
      <div className="col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Selected plot</CardTitle>
            <CardDescription>Click on the house to see all the information about it.</CardDescription>
          </CardHeader>

          {selectedPlot ? (
            <CardContent>
              {selectedPlot.x} - {selectedPlot.y}
            </CardContent>
          ) : (
            <CardContent className="text-primary">No plot selected</CardContent>
          )}
        </Card>
      </div>
    </div>
  );
};

