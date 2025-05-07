type TimeRange = "day" | "week" | "month" | "year";

type Application = {
  applicationTime?: number;
  _creationTime: number;
};

export function countApplicationsByTimeRange(
  applications: Application[],
  range: TimeRange,
): number {
  const now = Date.now();

  const timeThreshold = {
    day: now - 1 * 24 * 60 * 60 * 1000,
    week: now - 7 * 24 * 60 * 60 * 1000,
    month: now - 30 * 24 * 60 * 60 * 1000,
    year: now - 365 * 24 * 60 * 60 * 1000,
  }[range];

  return applications.filter((app) => {
    const time = app.applicationTime ?? app._creationTime;
    return time >= timeThreshold;
  }).length;
}
