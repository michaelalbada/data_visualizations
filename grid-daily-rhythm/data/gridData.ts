import generated from "./grid.generated.json";

export const SLOT_MINUTES = 60;
export const SLOTS_PER_DAY = 24;

export const POWER_SOURCES = [
  { key: "nuclear", label: "Nuclear", shortLabel: "Nuclear", color: "#7163ad" },
  { key: "hydro", label: "Hydropower and pumped storage", shortLabel: "Hydro", color: "#3f9078" },
  { key: "wind", label: "Wind", shortLabel: "Wind", color: "#5e98c4" },
  { key: "solar", label: "Solar", shortLabel: "Solar", color: "#e7a72f" },
  { key: "imports", label: "Net imports", shortLabel: "Imports", color: "#918d83" },
  { key: "battery", label: "Coal", shortLabel: "Coal", color: "#4f627e" },
  { key: "gas", label: "Natural gas and other fuels", shortLabel: "Gas + other", color: "#c85c42" }
] as const;

export type SourceKey = (typeof POWER_SOURCES)[number]["key"];
type SourceValues = Record<SourceKey, number>;

export type GridPoint = {
  period: string;
  offsetMinute: number;
  clockMinute: number;
  demand: number;
  netLoad: number;
  cleanShare: number;
  carbonRate: number;
} & SourceValues;

export type GridRegion = {
  key: string;
  respondent: string;
  label: string;
  shortLabel: string;
  date: string;
  summary: string;
  points: GridPoint[];
};

export const GRID_REGIONS = generated.regions as GridRegion[];
const sourceKeys = POWER_SOURCES.map((source) => source.key);

export function buildGridTimeline(region: GridRegion): GridPoint[] {
  return [...region.points, { ...region.points[0], offsetMinute: 24 * 60, clockMinute: 0 }];
}

export function getDailyEnergy(points: GridPoint[]): SourceValues {
  const totals = Object.fromEntries(sourceKeys.map((key) => [key, 0])) as SourceValues;
  for (const point of points.slice(0, SLOTS_PER_DAY)) for (const key of sourceKeys) totals[key] += point[key];
  return totals;
}

export function formatClockTime(clockMinute: number): string {
  const normalized = ((clockMinute % 1440) + 1440) % 1440;
  const hour = Math.floor(normalized / 60), minute = normalized % 60;
  const suffix = hour >= 12 ? "PM" : "AM", displayHour = hour % 12 === 0 ? 12 : hour % 12;
  return minute === 0 ? `${displayHour} ${suffix}` : `${displayHour}:${String(minute).padStart(2, "0")} ${suffix}`;
}
