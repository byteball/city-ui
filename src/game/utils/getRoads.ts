import { IMapUnit, IRoad } from "@/global";

export const getRoads = (mapUnits: IMapUnit[], mayor: string): IRoad[] => {
  return mapUnits
    .filter((unit) => (unit.owner === mayor || !unit.owner) && unit.type === "house" && unit.info && typeof unit.info === "object")
    .flatMap((unit) => {
      const name: string | undefined = typeof unit?.info === "object" ? unit?.info?.name : undefined;

      if (name && typeof name === "string") {
        return [
          {
            x: unit.x,
            y: unit.y,
            name: `${name} Street`,
            orientation: "horizontal",
          },
          {
            x: unit.x,
            y: unit.y,
            name: `${name} Avenue`,
            orientation: "vertical",
          },
        ];
      } else {
        return [];
      }
    });
};

