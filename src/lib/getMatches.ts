
import { AaStoreState } from "@/store/aa-store";

interface IMatch {
  built_ts: number;
  first: string;
  ts: number;
  neighbor_plot: number;
}

export const getMatches = (state: AaStoreState) => {
  const matches = new Map<number, IMatch>();

  Object.entries(state.state).forEach(([key, value]) => {
    if (key.startsWith('match_') && value) {
      const [plot1, plot2] = key.replace('match_', '').split('_').map(v => +v);
      if (!plot1 || !plot2) throw new Error(`Invalid match key: ${key}.`);

      matches.set(plot1, { ...(value as object), neighbor_plot: plot2 } as IMatch);
      matches.set(plot2, { ...(value as object), neighbor_plot: plot1 } as IMatch);
    }
  });

  return matches;
}