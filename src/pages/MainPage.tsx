import { useRef } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { IRefPhaserGame, PhaserGame } from "@/game/PhaserGame";

export default () => {
  const phaserRef = useRef<IRefPhaserGame | null>(null);

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

          <CardContent>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Quasi maiores similique vero vel placeat dolor laborum ratione.
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
