import { IRoad } from "@/global";

interface RoadDistance {
  dx: number;
  dy: number;
  distance: number;
  along: number;
  offset: number;
}

interface IRoadWithDistance extends RoadDistance, IRoad {}

const { abs } = Math;

export const getNearestRoads = (roads: IRoad[], x: number, y: number, count: number = 4): IRoadWithDistance[] => {
  return roads
    .map((road) => {
      const dx = road.x - x;
      const dy = road.y - y;
      const isAvenue = road.orientation === "vertical"; // assumes IRoad includes `type: "street" | "avenue"`
      const distance = isAvenue ? abs(dx) : abs(dy);

      const along = isAvenue ? dy : dx;
      const offset = isAvenue ? dx : dy;

      return { road, distance, dx, dy, along, offset };
    })
    .sort((a, b) => a.distance - b.distance)
    .slice(0, count)
    .map(({ road, ...r }) => ({ ...r, ...road }));
};

