import { createSelector } from "reselect";
import { AaStoreState } from "../aa-store";

interface IVotes {
  [address: string]: {
    [voteKey: string]: {
      balance: number;
      value: number;
    };
  };
}

interface IUserVotesByValue {
  [paramName: string]: {
    [paramValue: string | number]: {
      balance: number;
      address: string;
    }[];
  };
}

export const votesSelector = createSelector(
  (state: AaStoreState) => state.governanceState,
  (governanceState) => {
    if (!governanceState) return null;

    const userVotesByValue: IUserVotesByValue = {};

    Object.entries(governanceState).forEach(([key, value]) => {
      if (key.startsWith("votes_")) {
        const address = key.split("_")[1];

        value = value as IVotes;

        if (typeof value !== "object") {
          throw new Error(`Invalid value for key ${key}: ${value}`);
        }

        Object.entries(value).forEach(([key, { balance, value }]) => {
          if (!(key in userVotesByValue)) userVotesByValue[key] = {};

          if (value in userVotesByValue[key]) {
            userVotesByValue[key][value].push({ address, balance });
          } else {
            userVotesByValue[key][value] = [{ address, balance }];
          }
        });
      }
    });
    
    return userVotesByValue;
  }
);

