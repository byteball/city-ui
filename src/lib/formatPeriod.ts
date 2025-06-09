import moment from 'moment';

// Ensure English locale (default, but set explicitly for clarity)
moment.locale('en');

function plural(unit: string, value: number): string {
  return value === 1 ? unit : `${unit}s`;
}

/**
 * Returns a string like "3 days 4 hours 12 minutes"
 * @param {number} periodEndTs  Unix-timestamp (seconds) of the period end
 */
export const formatPeriod = (periodEndTs: number) => {
  const end = moment.unix(periodEndTs);   // target moment (UTC seconds)
  const now = moment.utc();               // current moment (UTC)
  const diff = moment.duration(end.diff(now));

  // Everything that already passed or < 1 minute → "0 minutes"
  if (diff.asMinutes() <= 0) {
    return '0 minutes';
  }

  // Full days, then remainder hours/minutes
  const days = Math.floor(diff.asDays());
  const hours = diff.hours();
  const minutes = diff.minutes();

  const parts: string[] = [];
  if (days) parts.push(`${days} ${plural('day', days)}`);
  if (hours) parts.push(`${hours}h`);
  if (minutes || !parts.length) // always show minutes
    if (!parts.length) {
      parts.push(`${minutes} minutes`);
    } else {
      parts.push(`${minutes}m`);
    }

  return parts.join(' ');
}