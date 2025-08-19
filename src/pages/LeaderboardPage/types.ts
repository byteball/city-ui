
export interface ILeaderboardEntry {
  address: string;
  houses: number;
  plots: number;
  neighbors: number;
}

export type ILeaderboardData = ILeaderboardEntry[];
