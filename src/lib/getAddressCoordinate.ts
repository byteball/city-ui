import { ICoordinates, IRoad } from "@/global";

type RoadType = "street" | "avenue";

interface RoadDistance {
  dx: number;
  dy: number;
  distance: number;
  along: number;
  offset: number;
}

interface IRoadWithDistance extends RoadDistance, IRoad {}

export const getNearestRoads = (roads: IRoad[], x: number, y: number, count: number = 4): IRoadWithDistance[] => {
  return roads
    .map((road) => {
      const dx = road.x - x;
      const dy = road.y - y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const isAvenue = road.orientation === "vertical";
      const along = isAvenue ? dy : dx;
      const offset = isAvenue ? dx : dy;
      return { road, distance, dx, dy, along, offset };
    })
    .sort((a, b) => a.distance - b.distance)
    .slice(0, count)
    .map(({ road, ...r }) => ({ ...r, ...road }));
};

export function getAddressCoordinate(mapUnit: ICoordinates, road: ICoordinates, roadType: RoadType, name: string): string {
  let alongCoord: number;
  let offsetValue: number;
  let direction: string;

  if (roadType === "street") {
    alongCoord = mapUnit.x;
    offsetValue = mapUnit.y - road.y;
    direction = offsetValue >= 0 ? "N" : "S";
  } else {
    alongCoord = mapUnit.y;
    offsetValue = mapUnit.x - road.x;
    direction = offsetValue >= 0 ? "E" : "W";
  }

  const mainCoordStr = alongCoord.toString().padStart(6, "0");
  const offset = Math.abs(Math.round(offsetValue));

  const coordCode = `${mainCoordStr}/${direction}${offset}`;

  return `${name}, ${coordCode}`;
}

export function getAddressFromNearestRoad(roads: IRoad[], home: ICoordinates): string[] {
  const nearestRoads = getNearestRoads(roads, home.x, home.y, 1);
  return nearestRoads.map((nearestRoad) =>
    getAddressCoordinate(
      home,
      { x: nearestRoad.x, y: nearestRoad.y },
      nearestRoad.orientation === "vertical" ? "avenue" : "street",
      nearestRoad.name
    )
  );
}

