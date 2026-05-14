export type DayStat = {
  day: string;
  hours: number;
};

export type FocusStatsData = {
  totalMinutes: number;
  sessionCount: number;
  completionRate: number;
  daily: DayStat[];
  maxYHours: number;
};
