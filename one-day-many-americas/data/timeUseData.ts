export const START_MINUTE = 4 * 60;
export const SLOT_MINUTES = 60;
export const SLOTS_PER_DAY = 24;

export const ACTIVITY_CATEGORIES = [
  { key: "sleep", label: "Sleep", shortLabel: "Sleep", color: "#24324a" },
  { key: "paidWork", label: "Paid work", shortLabel: "Work", color: "#3f73b7" },
  { key: "education", label: "School", shortLabel: "School", color: "#7361a8" },
  { key: "care", label: "Care", shortLabel: "Care", color: "#c85d7e" },
  { key: "household", label: "Home & shopping", shortLabel: "Home", color: "#ce8f35" },
  { key: "travel", label: "Civic & religious", shortLabel: "Civic", color: "#5d9a9a" },
  { key: "meals", label: "Meals", shortLabel: "Meals", color: "#c45b4b" },
  { key: "leisure", label: "Leisure except TV", shortLabel: "Leisure", color: "#5a9b61" },
  { key: "media", label: "Watching television", shortLabel: "TV", color: "#8a6857" },
  { key: "other", label: "Other & personal care", shortLabel: "Other", color: "#a7a49b" }
] as const;

export type ActivityKey = (typeof ACTIVITY_CATEGORIES)[number]["key"];
type ActivityTargets = Record<ActivityKey, number>;
type Observation = Record<ActivityKey, number>;

export type Cohort = {
  key: string;
  label: string;
  shortLabel: string;
  summary: string;
  sourceHref: string;
  targets: ActivityTargets;
  observations: Observation[];
};

export type TimelinePoint = { offsetMinute: number; clockMinute: number } & Observation;

type PublishedRows = {
  personal: number[]; sleep: number[]; meals: number[]; household: number[];
  purchases: number[]; careHousehold: number[]; careOther: number[]; work: number[];
  education: number[]; civic: number[]; leisure: number[]; television: number[];
  telephone: number[]; other: number[];
};

const data2024: PublishedRows = {
  personal: [87.7,93.4,95.7,96.4,93.7,88.6,75.1,52.4,32.4,20.0,11.8,8.2,6.0,6.1,6.4,6.3,6.4,5.8,5.7,7.0,11.4,26.7,52.8,75.5],
  sleep: [86.2,92.6,95.0,95.7,92.0,84.6,67.1,43.1,24.5,14.3,7.5,4.8,3.8,3.9,4.3,4.4,3.7,3.0,2.9,3.6,7.3,21.1,47.2,72.2],
  meals: [0.5,0.2,0.2,0.1,0.3,1.0,2.7,5.0,6.5,5.9,5.5,6.9,16.6,11.0,5.8,4.6,5.7,10.2,16.3,14.1,8.8,3.6,2.0,0.8],
  household: [0.6,0.3,0.2,0.3,0.9,2.1,5.4,10.6,12.4,14.6,16.3,15.5,15.1,14.2,12.8,13.8,14.6,16.6,17.0,12.1,8.2,5.9,3.7,1.3],
  purchases: [0.1,0,0,0,0.1,0.1,0.7,0.9,2.4,3.9,5.7,7.0,7.7,6.7,6.8,6.1,6.0,5.8,4.6,2.9,1.8,1.0,0.5,0.2],
  careHousehold: [0.3,0.2,0.2,0.2,0.4,0.3,1.5,3.9,3.7,2.4,2.0,2.1,2.0,2.1,2.8,4.1,4.0,4.3,3.3,4.3,4.4,3.1,1.2,0.6],
  careOther: [0,0,0,0,0.1,0.1,0.2,0.4,0.7,0.9,1.0,0.9,1.1,1.2,1.5,1.8,1.6,1.4,1.5,1.0,0.7,0.4,0.4,0.2],
  work: [1.3,1.1,0.9,1.0,1.8,3.4,7.5,15.0,24.3,29.4,30.8,30.3,24.4,28.3,30.3,29.1,25.5,17.6,10.8,7.5,5.9,4.9,3.8,2.5],
  education: [0.2,0.1,0.1,0,0.1,0,0.2,1.0,2.5,3.7,4.3,4.6,3.3,3.6,3.8,2.8,2.2,1.8,1.7,1.5,1.8,1.3,0.7,0.3],
  civic: [0.2,0.1,0.1,0.1,0.2,0.4,0.7,1.0,1.5,2.5,3.3,3.3,2.3,1.9,1.8,1.4,1.2,1.2,1.6,2.1,2.0,1.4,0.6,0.4],
  leisure: [8.5,4.2,2.4,1.5,2.2,3.6,5.1,8.2,11.4,14.7,16.9,19.1,19.7,23.0,25.6,27.4,30.8,33.1,35.4,44.8,51.8,49.1,32.8,17.2],
  television: [4.8,2.5,1.5,0.8,1.0,1.4,1.9,3.1,4.5,5.6,6.4,7.8,8.3,9.5,10.4,10.9,13.0,14.6,18.2,25.9,33.0,31.3,20.8,9.6],
  telephone: [0.5,0.2,0.1,0.1,0,0.1,0.2,0.4,0.6,0.8,1.0,0.9,0.8,0.7,1.2,1.1,1.1,1.2,1.1,1.5,1.8,1.7,1.0,0.6],
  other: [0.3,0.1,0.1,0.1,0.2,0.3,0.7,1.0,1.5,1.2,1.4,1.3,1.0,1.1,1.2,1.6,1.2,1.1,1.0,1.3,1.3,0.8,0.6,0.5]
};

const data1519: PublishedRows = {
  personal: [86.5,92.4,94.9,95.8,93.4,88.4,74.8,52.0,31.9,19.5,12.1,8.3,6.3,6.3,6.5,6.6,6.3,6.0,5.6,6.6,10.2,22.8,47.6,72.4],
  sleep: [85.1,91.6,94.2,95.0,91.0,84.3,65.0,41.8,24.3,13.6,7.3,4.9,3.7,4.0,4.4,4.4,3.8,3.1,2.7,3.1,6.1,17.2,42.1,69.2],
  meals: [0.6,0.3,0.3,0.3,0.5,1.2,3.2,5.9,7.0,6.2,5.1,6.1,16.0,10.5,5.9,4.2,4.7,9.0,15.1,13.8,8.7,4.4,2.0,1.0],
  household: [0.7,0.4,0.3,0.3,1.0,1.8,4.5,8.2,10.9,13.4,13.9,13.6,13.0,12.4,11.7,11.8,13.0,15.0,14.9,11.4,8.0,5.3,3.1,1.4],
  purchases: [0.2,0.1,0.1,0.1,0.1,0.2,0.4,1.0,2.2,4.0,5.9,7.3,7.9,7.8,7.5,7.1,6.7,6.2,5.1,3.8,2.5,1.6,0.8,0.4],
  careHousehold: [0.3,0.2,0.2,0.2,0.4,0.4,1.7,3.9,3.6,2.6,2.4,2.3,2.1,2.0,2.5,3.5,4.0,4.0,3.7,4.4,4.6,3.2,1.5,0.6],
  careOther: [0.1,0.1,0,0,0.1,0.1,0.3,0.5,0.8,1.1,1.3,1.4,1.5,1.5,1.5,1.7,1.9,1.7,1.4,1.2,0.9,0.8,0.5,0.3],
  work: [2.2,1.7,1.5,1.5,2.3,3.9,8.1,16.2,25.2,29.1,30.6,30.7,24.2,28.4,30.3,29.5,26.4,19.6,12.1,8.3,6.6,5.5,4.5,3.3],
  education: [0.3,0.2,0.1,0.1,0.1,0.1,0.3,1.4,3.2,4.0,4.5,4.4,3.8,4.1,4.3,3.2,2.3,2.0,1.8,1.8,1.7,1.4,1.0,0.5],
  civic: [0.2,0.1,0,0.1,0.2,0.3,0.6,0.9,1.5,2.6,3.6,3.7,2.8,1.9,1.7,1.5,1.4,1.5,1.8,2.2,2.0,1.2,0.7,0.3],
  leisure: [8.3,4.2,2.4,1.5,1.8,3.1,5.4,8.6,11.7,15.2,18.4,19.8,20.2,22.8,25.9,28.2,30.8,32.8,36.4,44.2,52.4,51.4,36.5,18.7],
  television: [4.4,2.1,1.2,0.8,1.0,1.4,2.2,3.6,5.0,6.3,7.5,8.3,8.3,9.6,10.8,12.0,13.7,15.3,18.9,25.9,33.6,34.4,23.6,11.1],
  telephone: [0.3,0.2,0.1,0.1,0.1,0.1,0.2,0.3,0.5,0.7,0.8,0.8,0.8,0.8,0.9,1.0,1.1,1.0,1.0,1.2,1.2,1.3,1.2,0.7],
  other: [0.3,0.1,0.1,0.1,0.2,0.3,0.6,1.2,1.3,1.5,1.5,1.5,1.4,1.3,1.4,1.5,1.4,1.3,1.2,1.1,1.2,1.0,0.7,0.4]
};

function observations(rows: PublishedRows): Observation[] {
  return Array.from({ length: 24 }, (_, hour) => ({
    sleep: rows.sleep[hour],
    paidWork: rows.work[hour],
    education: rows.education[hour],
    care: rows.careHousehold[hour] + rows.careOther[hour],
    household: rows.household[hour] + rows.purchases[hour],
    travel: rows.civic[hour],
    meals: rows.meals[hour],
    leisure: Math.max(0, rows.leisure[hour] - rows.television[hour]),
    media: rows.television[hour],
    other: Math.max(0, rows.personal[hour] - rows.sleep[hour]) + rows.telephone[hour] + rows.other[hour]
  }));
}

function dailyHours(items: Observation[]): ActivityTargets {
  return Object.fromEntries(ACTIVITY_CATEGORIES.map(({ key }) => [key, items.reduce((sum, item) => sum + item[key] / 100, 0)])) as ActivityTargets;
}

function cohort(key: string, label: string, shortLabel: string, summary: string, sourceHref: string, rows: PublishedRows): Cohort {
  const items = observations(rows);
  return { key, label, shortLabel, summary, sourceHref, observations: items, targets: dailyHours(items) };
}

export const COHORTS: Cohort[] = [
  cohort("2024", "All people · 2024", "2024", "BLS snapshots of the main activity people age 15+ reported at each hour in 2024.", "https://www.bls.gov/tus/tables/a3-2024.htm", data2024),
  cohort("2015-19", "All people · 2015–19", "2015–19", "The comparable five-year ATUS average published before the pandemic.", "https://www.bls.gov/tus/tables/a3-1519.htm", data1519)
];

const categoryKeys = ACTIVITY_CATEGORIES.map((category) => category.key);

export function buildTimeline(selected: Cohort): TimelinePoint[] {
  const startHour = START_MINUTE / 60;
  const ordered = Array.from({ length: 24 }, (_, index) => selected.observations[(startHour + index) % 24]);
  const points = ordered.map((item, index) => ({ offsetMinute: index * 60, clockMinute: (START_MINUTE + index * 60) % 1440, ...item }));
  return [...points, { ...points[0], offsetMinute: 1440 }];
}

export function getDailyHours(points: TimelinePoint[]): Record<ActivityKey, number> {
  const totals = Object.fromEntries(categoryKeys.map((key) => [key, 0])) as Record<ActivityKey, number>;
  for (const point of points.slice(0, SLOTS_PER_DAY)) for (const key of categoryKeys) totals[key] += point[key] / 100;
  return totals;
}

export function formatClockTime(clockMinute: number): string {
  const normalized = ((clockMinute % 1440) + 1440) % 1440;
  const hour = Math.floor(normalized / 60), minute = normalized % 60;
  const suffix = hour >= 12 ? "PM" : "AM", displayHour = hour % 12 === 0 ? 12 : hour % 12;
  return minute === 0 ? `${displayHour} ${suffix}` : `${displayHour}:${String(minute).padStart(2, "0")} ${suffix}`;
}
