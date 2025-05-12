import { IPlot } from "@/global";

export const getReferralUrl = (plot: IPlot | null): string | null => {
  if (!plot) return null;

  return `${window.location.protocol}//${window.location.hostname}${
    window.location.port ? `:${window.location.port}` : ""
  }/?c=${plot.x},${plot.y},plot`;
};
