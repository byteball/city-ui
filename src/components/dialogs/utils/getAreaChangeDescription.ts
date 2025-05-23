export const getAreaChangeDescription = (currentPlotArea: number, newPlotArea: number): string => {
  const percentageChange = (newPlotArea / currentPlotArea - 1) * 100;
  if (percentageChange > 0) return `+${Math.round(percentageChange)}%`;
  if (percentageChange < 0) return `-${Math.round(Math.abs(percentageChange))}%`;
  return "unchanged";
};

