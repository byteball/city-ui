export const getReferralUrl = (plotNum: number | null): string | null => {
  if (plotNum === null) return null;

  return `${window.location.protocol}//${window.location.hostname}${
    window.location.port ? `:${window.location.port}` : ""
  }/?unit=${plotNum},plot`;
};

