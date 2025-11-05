/**
 * Converts an integer number to a string with an English ordinal suffix.
 * For example: 1 → "1st", 2 → "2nd", 3 → "3rd", 4 → "4th", 11 → "11th", 21 → "21st".
 *
 * @param n — the input number (can be negative or non-integer; non-integer values are floored and sign preserved).
 * @returns the input number followed by its English ordinal suffix.
 */
export function toOrdinal(n: number): string {
  // Extract integer part and preserve sign for formatting.
  const sign = n < 0 ? "-" : "";
  const absInt = Math.floor(Math.abs(n));

  // Use Intl.PluralRules for the English locale with ordinal type if available.
  if (typeof Intl !== "undefined" && typeof Intl.PluralRules === "function") {
    const pr = new Intl.PluralRules("en-US", { type: "ordinal" });
    // Map the plural rule categories to appropriate suffixes.
    const suffixMap: Record<string, string> = {
      one: "st",
      two: "nd",
      few: "rd",
      other: "th",
    };
    const rule = pr.select(absInt);
    const suffix = suffixMap[rule] ?? "th";
    return `${sign}${absInt}${suffix}`;
  }

  // Fallback manual logic for environments lacking Intl.PluralRules support.
  const tens = absInt % 100;
  if (tens >= 11 && tens <= 13) {
    return `${sign}${absInt}th`;
  }
  switch (absInt % 10) {
    case 1: return `${sign}${absInt}st`;
    case 2: return `${sign}${absInt}nd`;
    case 3: return `${sign}${absInt}rd`;
    default: return `${sign}${absInt}th`;
  }
}
