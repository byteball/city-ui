
import { AaStoreState } from "@/store/aa-store";

interface IRewardNumberInfo {
  first: string;
  ts: number;
  paid_ts?: number;
}

export interface IFollowUp {
  reward: number;
  [key: number]: IRewardNumberInfo;
}

export const getFollowUp = (state: AaStoreState, house1Num: number, house2Num: number): IFollowUp | null => {
  return state.state[`followup_${house1Num}_${house2Num}`] as IFollowUp | null;
}
