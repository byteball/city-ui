
import { AaStoreState } from "@/store/aa-store";

interface ITierInfo {
  first: string;
  ts: number;
  paid_ts?: number;
}

export interface IFollowUp {
  reward: number;
  [key: number]: ITierInfo;
}

export const getFollowUp = (state: AaStoreState, house1Num: number, house2Num: number): IFollowUp | null => {
  return state.state[`followup_${house1Num}_${house2Num}`] as IFollowUp | null;
}
