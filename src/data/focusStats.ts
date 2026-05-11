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

export const WEEK_STATS: FocusStatsData = {
  totalMinutes: 18 * 60 + 42,
  sessionCount: 12,
  completionRate: 0.87,
  daily: [
    { day: "Mon", hours: 2.8 },
    { day: "Tue", hours: 3.5 },
    { day: "Wed", hours: 2.5 },
    { day: "Thu", hours: 3.8 },
    { day: "Fri", hours: 3.6 },
    { day: "Sat", hours: 0.3 },
    { day: "Sun", hours: 2.2 },
  ],
  maxYHours: 6,
};
