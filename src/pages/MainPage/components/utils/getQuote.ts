import { random } from 'lodash';

import { IQuote, quotes } from "../quotes";

export const getQuote = (name?: string, plotNum?: number): IQuote | null => {
  let availableQuotes: IQuote[];

  if (!name || plotNum === undefined) {
    const randomIndex = random(0, quotes.length - 1);

    return quotes[randomIndex] || null;
  } else {
    availableQuotes = quotes.filter(quote => quote.author === name);
  }

  if (availableQuotes.length === 0) return null;

  return availableQuotes[plotNum % availableQuotes.length] || null;
}
