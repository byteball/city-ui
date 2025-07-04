import obyte from "obyte";

export const getReferralUrl = (address: string | null): string | null => {
  if (!address || !obyte.utils.isValidAddress(address)) return null;

  return `${window.location.protocol}//${window.location.hostname}${window.location.port ? `:${window.location.port}` : ""}/?ref=${address}`;
};
