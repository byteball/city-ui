import { getNearestRoads } from "@/game/utils/getNearestRoads";
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

export function getAddressCoordinate(
  mapUnit: ICoordinates,
  road: ICoordinates,
  roadType: RoadType,
  name: string
): string {
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
  const nearestRoads = getNearestRoads(roads, home.x, home.y);
  return nearestRoads.map((nearestRoad) =>
    getAddressCoordinate(
      home,
      { x: nearestRoad.x, y: nearestRoad.y },
      nearestRoad.orientation === "vertical" ? "avenue" : "street",
      nearestRoad.name
    )
  );
}

