import moment from "moment";

import { IFollowUp } from "@/lib/getFollowUp";
import { IMatch } from "@/lib/getMatches";

export const FOLLOWUP_CLAIM_TERM = 10; // days

export type TFollowUpRewardNumber = typeof FOLLOWUP_REWARD_DAYS[number] | null;

export const FOLLOWUP_REWARD_DAYS = [
  60,  // +2 months 1st
  150, // +3 months 2nd
  270, // +4 months 3rd
  450, // +6 months 4th
  720, // +9 months 5th
  1080, // +12 months 6th
  1620, // +18 months 7th
];

// from 1 to 7
export const getFollowupRewardNumber = (daysSinceNeighboring: number): number | null => {
  const lastIndex = FOLLOWUP_REWARD_DAYS.length - 1;
  const lastRewardNumberDeadline = FOLLOWUP_REWARD_DAYS[lastIndex] + FOLLOWUP_CLAIM_TERM;
  if (daysSinceNeighboring > lastRewardNumberDeadline) return null;

  for (let i = FOLLOWUP_REWARD_DAYS.length - 1; i >= 0; i--) {
    if (daysSinceNeighboring >= FOLLOWUP_REWARD_DAYS[i]) {
      return i + 1;            // counted from 1
    }
  }

  return 1;
};

type FollowupRewardStatus = 'ACTIVE' | 'EXPIRED' | 'GOT' | 'GOT_ALL' | 'NOT_STARTED';

export const getFollowupRewardStatus = (matchData: IMatch, followup: IFollowUp | null): FollowupRewardStatus => {
  const ts = moment.unix(matchData.built_ts);
  const days = moment.utc().diff(ts, 'days');
  const rewardNumber = getFollowupRewardNumber(days);

  if (rewardNumber === null) return 'GOT_ALL';

  const lastRewardNumberDay = FOLLOWUP_REWARD_DAYS[rewardNumber - 1] + FOLLOWUP_CLAIM_TERM;

  const rewardNumberDays = FOLLOWUP_REWARD_DAYS[rewardNumber - 1];
  const rewardNumberData = followup ? followup[Number(rewardNumberDays)] : undefined;

  if (days < 60) return 'NOT_STARTED'; // Reward not started yet
  if (rewardNumberData && rewardNumberData.paid_ts) return 'GOT'; // Reward already claimed
  if (days <= lastRewardNumberDay) return 'ACTIVE'; // No data for this reward number, reward is still active

  if (days > (rewardNumberDays + FOLLOWUP_CLAIM_TERM)) return 'EXPIRED'; // Reward expired

  return 'ACTIVE';
}

export const getDaysSinceNeighboring = (matchData: IMatch): number => {
  const ts = moment.unix(matchData.built_ts);
  return moment.utc().diff(ts, 'days');
}
