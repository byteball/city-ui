import { IEngineOptions, IUnitUniqData } from "@/global";



export const validateDisplayedUnits = (displayedUnits: IUnitUniqData[] | undefined | null, sceneType: IEngineOptions["displayMode"]): boolean => {
  if (sceneType === "main" || sceneType === "market") {
    if (displayedUnits && displayedUnits.length > 0) return false;
  } else {
    if (!displayedUnits || displayedUnits.length === 0) return false; // Ensure displayedUnits is provided for non-main modes

    if (sceneType === "claim") {
      if (!displayedUnits.every(unit => unit.type === "plot")) {
        return false; // All displayed units in claim mode must be plots
      }

      if (displayedUnits.length !== 2) return false; // Claim mode requires exactly two plots
    } else if (sceneType === "followup") {
      if (!displayedUnits.every(unit => unit.type === "house")) {
        return false; // All displayed units in follow-up mode must be houses
      }

      if (displayedUnits.length !== 2) return false; // Follow-up mode requires exactly two houses
    }
  }

  return true;
}