export const SLOT_MINUTES = 30;
export const SLOTS_PER_DAY = 24 * 60 / SLOT_MINUTES;

export const POWER_SOURCES = [
  {
    key: "nuclear",
    label: "Nuclear",
    shortLabel: "Nuclear",
    color: "#7163ad"
  },
  {
    key: "hydro",
    label: "Hydro",
    shortLabel: "Hydro",
    color: "#3f9078"
  },
  {
    key: "wind",
    label: "Wind",
    shortLabel: "Wind",
    color: "#5e98c4"
  },
  {
    key: "solar",
    label: "Solar",
    shortLabel: "Solar",
    color: "#e7a72f"
  },
  {
    key: "imports",
    label: "Imports",
    shortLabel: "Imports",
    color: "#918d83"
  },
  {
    key: "battery",
    label: "Battery discharge",
    shortLabel: "Battery",
    color: "#4f627e"
  },
  {
    key: "gas",
    label: "Gas",
    shortLabel: "Gas",
    color: "#c85c42"
  }
] as const;

export type SourceKey = (typeof POWER_SOURCES)[number]["key"];

type SourceValues = Record<SourceKey, number>;

export type GridPoint = {
  offsetMinute: number;
  clockMinute: number;
  demand: number;
  netLoad: number;
  cleanShare: number;
  carbonRate: number;
} & SourceValues;

type RegionProfile = {
  baseDemand: number;
  morningPeak: number;
  eveningPeak: number;
  temperaturePeak: number;
  solarStrength: number;
  windBase: number;
  windStrength: number;
  nuclearBase: number;
  hydroBase: number;
  hydroFlex: number;
  importsBase: number;
  importsFlex: number;
  batteryPower: number;
  minGas: number;
  windPhase: number;
};

export type GridRegion = {
  key: string;
  label: string;
  shortLabel: string;
  summary: string;
  profile: RegionProfile;
};

export const GRID_REGIONS: GridRegion[] = [
  {
    key: "california-spring",
    label: "California spring day",
    shortLabel: "California",
    summary: "Solar floods the middle of the day, then batteries and gas carry the evening ramp.",
    profile: {
      baseDemand: 24,
      morningPeak: 5,
      eveningPeak: 11,
      temperaturePeak: 3,
      solarStrength: 24,
      windBase: 4.2,
      windStrength: 2.4,
      nuclearBase: 2.2,
      hydroBase: 4.6,
      hydroFlex: 1.2,
      importsBase: 3.8,
      importsFlex: 1.8,
      batteryPower: 4.9,
      minGas: 2.4,
      windPhase: 2.1
    }
  },
  {
    key: "texas-summer",
    label: "Texas summer day",
    shortLabel: "Texas",
    summary: "Demand climbs through heat, solar helps at noon, and gas remains the large flexible engine.",
    profile: {
      baseDemand: 48,
      morningPeak: 8,
      eveningPeak: 24,
      temperaturePeak: 16,
      solarStrength: 27,
      windBase: 13,
      windStrength: 5.5,
      nuclearBase: 5.1,
      hydroBase: 0.4,
      hydroFlex: 0.1,
      importsBase: 0.8,
      importsFlex: 0.4,
      batteryPower: 2.8,
      minGas: 13,
      windPhase: 5.4
    }
  },
  {
    key: "midwest-winter",
    label: "Midwest winter day",
    shortLabel: "Midwest",
    summary: "Wind does much of the work, while gas and imports fill cold morning and evening peaks.",
    profile: {
      baseDemand: 36,
      morningPeak: 8,
      eveningPeak: 11,
      temperaturePeak: 2,
      solarStrength: 5.5,
      windBase: 13.5,
      windStrength: 8,
      nuclearBase: 8.4,
      hydroBase: 1.1,
      hydroFlex: 0.2,
      importsBase: 2.6,
      importsFlex: 1.4,
      batteryPower: 0.8,
      minGas: 7.8,
      windPhase: 1
    }
  },
  {
    key: "northeast-peak",
    label: "Northeast peak day",
    shortLabel: "Northeast",
    summary: "A dense load center leans on nuclear, hydro, imports, and gas during the evening peak.",
    profile: {
      baseDemand: 32,
      morningPeak: 7,
      eveningPeak: 15,
      temperaturePeak: 7,
      solarStrength: 8.5,
      windBase: 3.8,
      windStrength: 3.2,
      nuclearBase: 9,
      hydroBase: 3.2,
      hydroFlex: 0.9,
      importsBase: 4.6,
      importsFlex: 2.3,
      batteryPower: 1.6,
      minGas: 7.2,
      windPhase: 3.9
    }
  }
];

const sourceKeys = POWER_SOURCES.map((source) => source.key);

export function buildGridTimeline(region: GridRegion): GridPoint[] {
  const points = Array.from({ length: SLOTS_PER_DAY }, (_, slot) => {
    const offsetMinute = slot * SLOT_MINUTES;
    const clockMinute = offsetMinute;
    const hour = clockMinute / 60;
    const profile = region.profile;
    const demand =
      profile.baseDemand +
      profile.morningPeak * bump(hour, 8, 2.2) +
      profile.eveningPeak * bump(hour, 19.2, 2.7) +
      profile.temperaturePeak * bump(hour, 15.4, 4.4);

    const solar = profile.solarStrength * daylight(hour, 6.15, 19.1, 1.75);
    const wind = Math.max(
      0,
      profile.windBase +
        profile.windStrength * (0.48 + 0.34 * Math.sin((hour + profile.windPhase) / 24 * Math.PI * 2)) +
        profile.windStrength * 0.32 * bump(hour, 22, 4.8)
    );
    const nuclear = profile.nuclearBase * (0.98 + 0.02 * Math.sin(hour / 24 * Math.PI * 2));
    const hydro = profile.hydroBase + profile.hydroFlex * bump(hour, 18.2, 4.2);
    const imports = profile.importsBase + profile.importsFlex * bump(hour, 20.4, 4.8);
    const battery =
      profile.batteryPower * bump(hour, 20, 1.8) +
      profile.batteryPower * 0.22 * bump(hour, 7.5, 1.3);

    const raw: SourceValues = {
      nuclear,
      hydro,
      wind,
      solar,
      imports,
      battery,
      gas: profile.minGas
    };

    const rawWithoutGas = nuclear + hydro + wind + solar + imports + battery;
    raw.gas = Math.max(profile.minGas, demand - rawWithoutGas);

    const totalSupply = sourceKeys.reduce((sum, key) => sum + raw[key], 0);
    const scale = totalSupply === 0 ? 0 : demand / totalSupply;
    const values = Object.fromEntries(
      sourceKeys.map((key) => [key, raw[key] * scale])
    ) as SourceValues;
    const clean = values.nuclear + values.hydro + values.wind + values.solar + values.battery;
    const netLoad = Math.max(0, demand - values.solar - values.wind);
    const carbonRate = demand === 0 ? 0 : ((values.gas * 0.41 + values.imports * 0.18) / demand);

    return {
      offsetMinute,
      clockMinute,
      demand,
      netLoad,
      cleanShare: demand === 0 ? 0 : clean / demand,
      carbonRate,
      ...values
    };
  });

  return [
    ...points,
    {
      ...points[0],
      offsetMinute: 24 * 60,
      clockMinute: 0
    }
  ];
}

export function getDailyEnergy(points: GridPoint[]): SourceValues {
  const totals = Object.fromEntries(sourceKeys.map((key) => [key, 0])) as SourceValues;

  for (const point of points.slice(0, SLOTS_PER_DAY)) {
    for (const key of sourceKeys) {
      totals[key] += point[key] * (SLOT_MINUTES / 60);
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

function bump(hour: number, center: number, spread: number): number {
  const distance = circularDistance(hour, center);
  return Math.exp(-0.5 * Math.pow(distance / spread, 2));
}

function daylight(hour: number, sunrise: number, sunset: number, curve: number): number {
  if (hour < sunrise || hour > sunset) {
    return 0;
  }

  const progress = (hour - sunrise) / (sunset - sunrise);
  return Math.pow(Math.sin(progress * Math.PI), curve);
}

function circularDistance(a: number, b: number): number {
  const difference = Math.abs((((a - b) % 24) + 24) % 24);
  return Math.min(difference, 24 - difference);
}
