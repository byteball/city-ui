import moment from "moment";

import { IFollowUp } from "@/lib/getFollowUp";
import { IMatch } from "@/lib/getMatches";

export const FOLLOWUP_CLAIM_TERM = 10; // days

export type TFollowUpRewardTier = typeof FOLLOWUP_REWARD_DAYS[number] | null;

export const FOLLOWUP_REWARD_DAYS = [
  60,  // +2 months 1st tier
  150, // +3 months 2nd tier
  270, // +4 months 3rd tier
  450, // +6 months 4th tier
  720, // +9 months 5th tier
  1080, // +12 months 6th tier
  1620, // +18 months 7th tier
];

// from 1 to 7
export const getFollowupRewardTier = (daysSinceNeighboring: number): number | null => {
  const lastIndex = FOLLOWUP_REWARD_DAYS.length - 1;
  const lastTierDeadline = FOLLOWUP_REWARD_DAYS[lastIndex] + FOLLOWUP_CLAIM_TERM;
  if (daysSinceNeighboring > lastTierDeadline) return null;

  for (let i = FOLLOWUP_REWARD_DAYS.length - 1; i >= 0; i--) {
    if (daysSinceNeighboring >= FOLLOWUP_REWARD_DAYS[i]) {
      return i + 1;            // tiers counted from 1
    }
  }

  return 1;
};

type FollowupRewardStatus = 'ACTIVE' | 'EXPIRED' | 'GOT' | 'GOT_ALL' | 'NOT_STARTED';

export const getFollowupRewardStatus = (matchData: IMatch, followup: IFollowUp | null): FollowupRewardStatus => {
  const ts = moment.unix(matchData.built_ts);
  const days = moment.utc().diff(ts, 'days');
  const tier = getFollowupRewardTier(days);

  if (tier === null) return 'GOT_ALL';

  const lastTierDay = FOLLOWUP_REWARD_DAYS[tier - 1] + FOLLOWUP_CLAIM_TERM;


  const tierDays = FOLLOWUP_REWARD_DAYS[tier - 1];
  const tierData = followup ? followup[Number(tierDays)] : undefined;

  if (days < 60) return 'NOT_STARTED'; // Reward not started yet
  if (tierData && tierData.paid_ts) return 'GOT'; // Reward already claimed
  if (days <= lastTierDay) return 'ACTIVE'; // No data for this tier, reward is still active

  if (days > (tierDays + FOLLOWUP_CLAIM_TERM)) return 'EXPIRED'; // Reward expired

  return 'ACTIVE';
}

export const getDaysSinceNeighboring = (matchData: IMatch): number => {
  const ts = moment.unix(matchData.built_ts);
  return moment.utc().diff(ts, 'days');
}
