import { IEngineOptions, IMapUnit } from '@/global';

export const shouldDisplayUnit = (engineOptions: IEngineOptions, unitData: IMapUnit): boolean => {
  const { displayedUnits, displayMode } = engineOptions ?? { displayMode: "main" };

  if (unitData.type === "plot" && unitData.status === "pending") return false; // Skip pending plots

  if (displayMode === "main") {
    return true; // Always display units in main mode
  } else if (displayMode === "claim") {
    if (unitData.type !== "plot") return false; // Only plots should be displayed in claim mode
    if (!displayedUnits || displayedUnits.length < 2) return false;
    if (unitData.plot_num !== displayedUnits[0].num && unitData.plot_num !== displayedUnits[1].num) return false; // Only display plots that are part of the claim
  } else if (displayMode === "market") {
    if (unitData.type === "house") return false; // Only plots in market mode
    if (!unitData.sale_price) return false; // Only plots with sale price
  } else if (displayMode === "followup") {
    if (unitData.type !== "house") return false; // Only houses should be displayed in follow-up mode
    if (!displayedUnits || displayedUnits.length < 2) return false;
    if (unitData.house_num !== displayedUnits[0].num && unitData.house_num !== displayedUnits[1].num) return false;
    // Only display houses that are part of the follow-up
  }

  return true;
}