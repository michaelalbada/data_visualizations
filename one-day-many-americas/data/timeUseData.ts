export const START_MINUTE = 4 * 60;
export const SLOT_MINUTES = 30;
export const SLOTS_PER_DAY = 24 * 60 / SLOT_MINUTES;

export const ACTIVITY_CATEGORIES = [
  {
    key: "sleep",
    label: "Sleep",
    shortLabel: "Sleep",
    color: "#24324a"
  },
  {
    key: "paidWork",
    label: "Paid work",
    shortLabel: "Work",
    color: "#3f73b7"
  },
  {
    key: "education",
    label: "School",
    shortLabel: "School",
    color: "#7361a8"
  },
  {
    key: "care",
    label: "Care",
    shortLabel: "Care",
    color: "#c85d7e"
  },
  {
    key: "household",
    label: "Household",
    shortLabel: "Home",
    color: "#ce8f35"
  },
  {
    key: "travel",
    label: "Travel",
    shortLabel: "Travel",
    color: "#5d9a9a"
  },
  {
    key: "meals",
    label: "Meals",
    shortLabel: "Meals",
    color: "#c45b4b"
  },
  {
    key: "leisure",
    label: "Leisure",
    shortLabel: "Leisure",
    color: "#5a9b61"
  },
  {
    key: "media",
    label: "TV & media",
    shortLabel: "Media",
    color: "#8a6857"
  },
  {
    key: "other",
    label: "Other",
    shortLabel: "Other",
    color: "#a7a49b"
  }
] as const;

export type ActivityKey = (typeof ACTIVITY_CATEGORIES)[number]["key"];

export type ActivityCategory = {
  key: ActivityKey;
  label: string;
  shortLabel: string;
  color: string;
};

type ActivityTargets = Record<ActivityKey, number>;

type RhythmProfile = {
  sleepCenter: number;
  sleepSpread: number;
  workStart: number;
  workEnd: number;
  schoolStart: number;
  schoolEnd: number;
  careMorning: number;
  careEvening: number;
  householdMorning: number;
  householdEvening: number;
  leisurePeak: number;
  mediaPeak: number;
  mealShift: number;
  travelBias: number;
};

export type Cohort = {
  key: string;
  label: string;
  shortLabel: string;
  summary: string;
  targets: ActivityTargets;
  rhythm: RhythmProfile;
};

export type TimelinePoint = {
  offsetMinute: number;
  clockMinute: number;
} & Record<ActivityKey, number>;

const defaultRhythm: RhythmProfile = {
  sleepCenter: 2 * 60,
  sleepSpread: 245,
  workStart: 8 * 60 + 45,
  workEnd: 17 * 60 + 15,
  schoolStart: 8 * 60 + 30,
  schoolEnd: 15 * 60 + 30,
  careMorning: 7 * 60,
  careEvening: 18 * 60 + 30,
  householdMorning: 8 * 60,
  householdEvening: 18 * 60,
  leisurePeak: 19 * 60 + 30,
  mediaPeak: 21 * 60 + 15,
  mealShift: 0,
  travelBias: 1
};

export const COHORTS: Cohort[] = [
  {
    key: "all-adults",
    label: "All adults",
    shortLabel: "All",
    summary: "A broad weekday and weekend blend across the adult population.",
    targets: {
      sleep: 8.8,
      paidWork: 3.5,
      education: 0.5,
      care: 0.7,
      household: 1.9,
      travel: 1.1,
      meals: 1.2,
      leisure: 2.7,
      media: 2.6,
      other: 1.0
    },
    rhythm: defaultRhythm
  },
  {
    key: "full-time-workers",
    label: "Full-time workers",
    shortLabel: "Workers",
    summary: "A workday-shaped rhythm with compressed leisure and a commute spine.",
    targets: {
      sleep: 8.0,
      paidWork: 7.5,
      education: 0.1,
      care: 0.5,
      household: 1.1,
      travel: 1.3,
      meals: 1.1,
      leisure: 2.1,
      media: 1.5,
      other: 0.8
    },
    rhythm: {
      ...defaultRhythm,
      sleepCenter: 1 * 60 + 35,
      sleepSpread: 220,
      workStart: 8 * 60 + 20,
      workEnd: 17 * 60 + 35,
      householdEvening: 19 * 60,
      leisurePeak: 20 * 60,
      mediaPeak: 21 * 60 + 35,
      travelBias: 1.35
    }
  },
  {
    key: "parents-young-kids",
    label: "Parents with young kids",
    shortLabel: "Parents",
    summary: "Care and household work rise before breakfast and again after school.",
    targets: {
      sleep: 8.2,
      paidWork: 5.2,
      education: 0.1,
      care: 2.7,
      household: 1.8,
      travel: 1.2,
      meals: 1.1,
      leisure: 1.4,
      media: 1.4,
      other: 0.9
    },
    rhythm: {
      ...defaultRhythm,
      sleepCenter: 1 * 60 + 20,
      sleepSpread: 215,
      workStart: 8 * 60 + 40,
      workEnd: 16 * 60 + 40,
      careMorning: 6 * 60 + 45,
      careEvening: 18 * 60 + 10,
      householdMorning: 7 * 60 + 15,
      householdEvening: 19 * 60,
      leisurePeak: 20 * 60 + 20,
      mediaPeak: 21 * 60 + 45,
      travelBias: 1.25
    }
  },
  {
    key: "students-young-adults",
    label: "Students and young adults",
    shortLabel: "Students",
    summary: "School fills the day, with later sleep, social time, and media.",
    targets: {
      sleep: 9.4,
      paidWork: 1.5,
      education: 3.4,
      care: 0.2,
      household: 0.7,
      travel: 1.0,
      meals: 1.2,
      leisure: 3.3,
      media: 2.4,
      other: 0.9
    },
    rhythm: {
      ...defaultRhythm,
      sleepCenter: 3 * 60 + 10,
      sleepSpread: 245,
      workStart: 15 * 60,
      workEnd: 21 * 60,
      schoolStart: 8 * 60 + 50,
      schoolEnd: 15 * 60 + 20,
      householdMorning: 11 * 60,
      householdEvening: 18 * 60,
      leisurePeak: 20 * 60 + 30,
      mediaPeak: 22 * 60 + 20,
      mealShift: 20
    }
  },
  {
    key: "older-adults",
    label: "Adults 65+",
    shortLabel: "65+",
    summary: "A slower day with more media, household work, meals, and daylight leisure.",
    targets: {
      sleep: 9.0,
      paidWork: 0.6,
      education: 0.1,
      care: 0.4,
      household: 2.2,
      travel: 0.8,
      meals: 1.4,
      leisure: 3.8,
      media: 4.4,
      other: 1.3
    },
    rhythm: {
      ...defaultRhythm,
      sleepCenter: 1 * 60 + 10,
      sleepSpread: 250,
      workStart: 9 * 60,
      workEnd: 13 * 60,
      householdMorning: 10 * 60,
      householdEvening: 16 * 60,
      leisurePeak: 15 * 60 + 30,
      mediaPeak: 20 * 60 + 25,
      mealShift: -10,
      travelBias: 0.75
    }
  },
  {
    key: "weekends",
    label: "Weekend adults",
    shortLabel: "Weekend",
    summary: "Less paid work, more sleep, errands, leisure, and media.",
    targets: {
      sleep: 9.5,
      paidWork: 1.1,
      education: 0.2,
      care: 0.7,
      household: 2.2,
      travel: 1.0,
      meals: 1.4,
      leisure: 4.1,
      media: 2.9,
      other: 0.9
    },
    rhythm: {
      ...defaultRhythm,
      sleepCenter: 2 * 60 + 40,
      sleepSpread: 260,
      workStart: 10 * 60,
      workEnd: 15 * 60,
      householdMorning: 11 * 60,
      householdEvening: 16 * 60,
      leisurePeak: 16 * 60 + 30,
      mediaPeak: 21 * 60 + 20,
      mealShift: 25,
      travelBias: 0.9
    }
  }
];

const categoryKeys = ACTIVITY_CATEGORIES.map((category) => category.key);

export function buildTimeline(cohort: Cohort): TimelinePoint[] {
  const matrix = Array.from({ length: SLOTS_PER_DAY }, (_, slot) => {
    const clockMinute = (START_MINUTE + slot * SLOT_MINUTES) % (24 * 60);
    return categoryKeys.map((key) => Math.max(0.005, shapeWeight(key, clockMinute, cohort.rhythm)));
  });

  const targetColumnSums = categoryKeys.map((key) => cohort.targets[key] * (100 / (SLOT_MINUTES / 60)));

  for (let iteration = 0; iteration < 80; iteration += 1) {
    for (let column = 0; column < categoryKeys.length; column += 1) {
      const current = matrix.reduce((sum, row) => sum + row[column], 0);
      const scale = current === 0 ? 0 : targetColumnSums[column] / current;
      for (const row of matrix) {
        row[column] *= scale;
      }
    }

    for (const row of matrix) {
      const rowTotal = row.reduce((sum, value) => sum + value, 0);
      const scale = rowTotal === 0 ? 0 : 100 / rowTotal;
      for (let column = 0; column < row.length; column += 1) {
        row[column] *= scale;
      }
    }
  }

  const points = matrix.map((row, slot) => {
    const offsetMinute = slot * SLOT_MINUTES;
    const clockMinute = (START_MINUTE + offsetMinute) % (24 * 60);
    return rowToPoint(row, offsetMinute, clockMinute);
  });

  return [
    ...points,
    rowToPoint(matrix[0], 24 * 60, START_MINUTE)
  ];
}

export function getDailyHours(points: TimelinePoint[]): Record<ActivityKey, number> {
  const totals = Object.fromEntries(categoryKeys.map((key) => [key, 0])) as Record<ActivityKey, number>;

  for (const point of points.slice(0, SLOTS_PER_DAY)) {
    for (const key of categoryKeys) {
      totals[key] += point[key] / 100 * (SLOT_MINUTES / 60);
    }
  }

  return totals;
}

export function formatClockTime(clockMinute: number): string {
  const normalized = ((clockMinute % (24 * 60)) + 24 * 60) % (24 * 60);
  const hour = Math.floor(normalized / 60);
  const minute = normalized % 60;
  const suffix = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;

  if (minute === 0) {
    return `${displayHour} ${suffix}`;
  }

  return `${displayHour}:${String(minute).padStart(2, "0")} ${suffix}`;
}

function rowToPoint(row: number[], offsetMinute: number, clockMinute: number): TimelinePoint {
  const values = Object.fromEntries(
    categoryKeys.map((key, index) => [key, row[index]])
  ) as Record<ActivityKey, number>;

  return {
    offsetMinute,
    clockMinute,
    ...values
  };
}

function shapeWeight(key: ActivityKey, minute: number, rhythm: RhythmProfile): number {
  switch (key) {
    case "sleep":
      return 0.04 + bump(minute, rhythm.sleepCenter, rhythm.sleepSpread, 4.6);
    case "paidWork":
      return 0.03 + plateau(minute, rhythm.workStart, rhythm.workEnd, 54) * 3.8;
    case "education":
      return 0.02 + plateau(minute, rhythm.schoolStart, rhythm.schoolEnd, 48) * 4.2;
    case "care":
      return 0.08 +
        bump(minute, rhythm.careMorning, 75, 2.4) +
        bump(minute, rhythm.careEvening, 95, 2.7);
    case "household":
      return 0.16 +
        bump(minute, rhythm.householdMorning, 115, 2.0) +
        bump(minute, rhythm.householdEvening, 120, 2.2);
    case "travel":
      return 0.05 +
        bump(minute, rhythm.workStart - 45, 44, 2.9 * rhythm.travelBias) +
        bump(minute, rhythm.workEnd + 25, 55, 2.5 * rhythm.travelBias) +
        bump(minute, 13 * 60, 110, 0.55);
    case "meals":
      return 0.07 +
        bump(minute, 7 * 60 + 35 + rhythm.mealShift, 42, 1.8) +
        bump(minute, 12 * 60 + 35 + rhythm.mealShift, 48, 2.0) +
        bump(minute, 18 * 60 + 35 + rhythm.mealShift, 58, 2.1);
    case "leisure":
      return 0.22 +
        bump(minute, rhythm.leisurePeak, 165, 2.7) +
        bump(minute, 14 * 60, 180, 1.0);
    case "media":
      return 0.12 +
        bump(minute, rhythm.mediaPeak, 145, 3.0) +
        bump(minute, 13 * 60 + 30, 125, 0.55);
    case "other":
      return 0.55 +
        bump(minute, 9 * 60 + 30, 165, 0.35) +
        bump(minute, 22 * 60 + 30, 120, 0.45);
  }
}

function bump(minute: number, center: number, spread: number, amplitude: number): number {
  const distance = circularDistance(minute, center);
  return amplitude * Math.exp(-0.5 * Math.pow(distance / spread, 2));
}

function plateau(minute: number, start: number, end: number, softness: number): number {
  return sigmoid((minute - start) / softness) * sigmoid((end - minute) / softness);
}

function sigmoid(value: number): number {
  return 1 / (1 + Math.exp(-value));
}

function circularDistance(a: number, b: number): number {
  const day = 24 * 60;
  const difference = Math.abs((((a - b) % day) + day) % day);
  return Math.min(difference, day - difference);
}
