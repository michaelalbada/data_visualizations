export type MotionPoint = {
  id: string;
  label: string;
  group: string;
  x: number;
  y: number;
  size: number;
};

export type MotionFrame = {
  label: string;
  points: MotionPoint[];
};

export type Story = {
  id: "energy" | "housing" | "technology";
  eyebrow: string;
  title: string;
  shortTitle: string;
  description: string;
  question: string;
  xLabel: string;
  yLabel: string;
  sizeLabel: string;
  xDomain: [number, number];
  yDomain: [number, number];
  xScale?: "linear" | "log";
  formatX: (value: number) => string;
  formatY: (value: number) => string;
  formatSize: (value: number) => string;
  groups: Record<string, string>;
  callouts: Record<string, string>;
  frames: MotionFrame[];
};

type EntitySeed = {
  id: string;
  label: string;
  group: string;
  x: number[];
  y: number[];
  size: number[];
};

const compact = new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 });
const dollars = new Intl.NumberFormat("en", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

function annualFrames(anchorLabels: string[], seeds: EntitySeed[]): MotionFrame[] {
  const anchorYears = anchorLabels.map(Number);
  const firstYear = anchorYears[0];
  const lastYear = anchorYears[anchorYears.length - 1];

  return Array.from({ length: lastYear - firstYear + 1 }, (_, offset) => {
    const year = firstYear + offset;
    const upperIndex = Math.min(
      anchorYears.findIndex((anchorYear) => anchorYear >= year),
      anchorYears.length - 1
    );
    const lowerIndex = Math.max(0, upperIndex - 1);
    const lowerYear = anchorYears[lowerIndex];
    const upperYear = anchorYears[upperIndex];
    const progress = upperYear === lowerYear ? 0 : (year - lowerYear) / (upperYear - lowerYear);

    return {
      label: String(year),
      points: seeds.map((seed) => ({
        id: seed.id,
        label: seed.label,
        group: seed.group,
        x: interpolate(seed.x[lowerIndex], seed.x[upperIndex], progress),
        y: interpolate(seed.y[lowerIndex], seed.y[upperIndex], progress),
        size: interpolate(seed.size[lowerIndex], seed.size[upperIndex], progress)
      }))
    };
  });
}

function interpolate(start: number, end: number, progress: number) {
  return start + (end - start) * progress;
}

const energyYears = ["2000", "2005", "2010", "2015", "2020", "2024"];
const energySeeds: EntitySeed[] = [
  { id: "usa", label: "United States", group: "Americas", x: [36400, 44300, 48600, 56800, 63500, 73500], y: [20.5, 19.5, 17.5, 15.2, 13.0, 13.8], size: [282, 296, 311, 326, 335, 342] },
  { id: "chn", label: "China", group: "Asia", x: [2900, 5100, 9300, 13400, 17700, 22600], y: [2.7, 4.2, 6.0, 7.2, 7.6, 8.4], size: [1263, 1304, 1341, 1393, 1424, 1410] },
  { id: "ind", label: "India", group: "Asia", x: [2100, 2900, 4400, 5900, 7200, 9200], y: [0.9, 1.0, 1.4, 1.7, 1.8, 2.1], size: [1057, 1155, 1241, 1328, 1396, 1450] },
  { id: "deu", label: "Germany", group: "Europe", x: [35100, 38300, 42000, 47500, 51300, 56800], y: [10.1, 9.7, 9.4, 8.9, 7.3, 6.7], size: [82, 82, 81, 82, 84, 85] },
  { id: "gbr", label: "United Kingdom", group: "Europe", x: [32900, 38000, 39700, 44400, 46600, 52900], y: [9.5, 9.1, 7.8, 6.1, 4.7, 4.6], size: [59, 60, 63, 65, 67, 69] },
  { id: "bra", label: "Brazil", group: "Americas", x: [9400, 11100, 14800, 15700, 15100, 18400], y: [1.9, 1.9, 2.2, 2.4, 2.0, 2.3], size: [176, 185, 196, 205, 213, 217] },
  { id: "zaf", label: "South Africa", group: "Africa", x: [9600, 11100, 12500, 13200, 12700, 15100], y: [8.4, 9.2, 9.0, 8.2, 7.4, 7.0], size: [47, 51, 56, 61, 65, 64] },
  { id: "nga", label: "Nigeria", group: "Africa", x: [3100, 3700, 5000, 5700, 4900, 5600], y: [0.7, 0.8, 0.7, 0.6, 0.6, 0.7], size: [123, 141, 161, 184, 208, 229] },
  { id: "nor", label: "Norway", group: "Europe", x: [58000, 66300, 73300, 74600, 67400, 80500], y: [9.3, 9.0, 9.4, 8.4, 7.3, 7.1], size: [4.5, 4.6, 4.9, 5.2, 5.4, 5.6] },
  { id: "idn", label: "Indonesia", group: "Asia", x: [5300, 6800, 9300, 11700, 12600, 15700], y: [1.2, 1.4, 1.8, 1.9, 2.1, 2.7], size: [216, 231, 246, 261, 274, 281] }
];

const housingYears = ["2000", "2005", "2010", "2015", "2020", "2024"];
const housingSeeds: EntitySeed[] = [
  { id: "sf", label: "San Francisco", group: "West", x: [25, 27, 29, 31, 33, 35], y: [6.7, 8.8, 8.0, 10.6, 12.2, 11.4], size: [1.7, 1.8, 1.8, 1.9, 2.0, 2.0] },
  { id: "la", label: "Los Angeles", group: "West", x: [27, 29, 31, 33, 34, 36], y: [5.2, 7.4, 6.6, 8.5, 10.2, 10.7], size: [4.1, 4.3, 4.4, 4.6, 4.7, 4.8] },
  { id: "sea", label: "Seattle", group: "West", x: [23, 24, 26, 28, 29, 31], y: [4.5, 5.9, 5.1, 6.8, 8.3, 8.0], size: [1.2, 1.3, 1.4, 1.5, 1.6, 1.7] },
  { id: "aus", label: "Austin", group: "South", x: [22, 23, 24, 26, 27, 30], y: [3.3, 4.1, 3.5, 4.5, 6.0, 5.4], size: [0.6, 0.7, 0.8, 0.9, 1.1, 1.2] },
  { id: "mia", label: "Miami", group: "South", x: [28, 31, 33, 35, 37, 41], y: [4.2, 6.2, 5.5, 7.1, 8.9, 10.1], size: [1.5, 1.6, 1.7, 1.8, 2.0, 2.1] },
  { id: "nyc", label: "New York", group: "Northeast", x: [28, 30, 32, 34, 35, 38], y: [5.8, 7.8, 7.0, 8.7, 10.0, 10.3], size: [7.1, 7.3, 7.4, 7.5, 7.6, 7.7] },
  { id: "bos", label: "Boston", group: "Northeast", x: [25, 27, 29, 31, 32, 34], y: [5.0, 6.4, 5.9, 7.2, 8.6, 8.9], size: [1.8, 1.9, 2.0, 2.0, 2.1, 2.2] },
  { id: "chi", label: "Chicago", group: "Midwest", x: [24, 25, 27, 28, 29, 31], y: [3.5, 4.4, 3.9, 4.2, 5.0, 5.3], size: [3.1, 3.2, 3.2, 3.2, 3.2, 3.3] },
  { id: "det", label: "Detroit", group: "Midwest", x: [23, 24, 26, 27, 28, 30], y: [2.2, 2.7, 1.8, 2.3, 3.1, 3.4], size: [1.8, 1.7, 1.7, 1.7, 1.7, 1.7] },
  { id: "phx", label: "Phoenix", group: "West", x: [22, 24, 27, 28, 29, 32], y: [3.1, 4.8, 3.4, 4.0, 6.0, 6.4], size: [1.2, 1.4, 1.6, 1.8, 2.0, 2.1] }
];

const techYears = ["2005", "2010", "2015", "2020", "2022", "2024"];
const technologySeeds: EntitySeed[] = [
  { id: "aapl", label: "Apple", group: "Devices", x: [240, 350, 470, 520, 610, 690], y: [12, 29, 30, 24, 30, 31], size: [44, 297, 586, 2250, 2070, 3450] },
  { id: "msft", label: "Microsoft", group: "Software", x: [310, 510, 660, 870, 940, 1060], y: [37, 38, 31, 37, 42, 45], size: [270, 240, 440, 1680, 1800, 3120] },
  { id: "goog", label: "Alphabet", group: "Platforms", x: [340, 420, 690, 1170, 1270, 1420], y: [36, 35, 26, 23, 26, 32], size: [120, 190, 530, 1180, 1150, 2370] },
  { id: "amzn", label: "Amazon", group: "Commerce", x: [460, 580, 630, 890, 890, 960], y: [5, 4, 2, 6, 2, 10], size: [20, 80, 318, 1630, 860, 2250] },
  { id: "meta", label: "Meta", group: "Platforms", x: [120, 350, 1120, 1450, 1350, 1900], y: [-20, 30, 34, 38, 25, 42], size: [1, 50, 300, 780, 315, 1480] },
  { id: "nvda", label: "Nvidia", group: "Semiconductors", x: [230, 300, 360, 580, 710, 1760], y: [12, 8, 16, 27, 22, 62], size: [8, 10, 18, 320, 360, 3280] },
  { id: "intc", label: "Intel", group: "Semiconductors", x: [410, 460, 610, 700, 560, 480], y: [31, 36, 25, 30, 4, -8], size: [145, 115, 160, 205, 110, 90] },
  { id: "crm", label: "Salesforce", group: "Software", x: [150, 260, 350, 430, 440, 470], y: [-4, 8, 2, 2, 5, 18], size: [2, 17, 55, 200, 130, 260] },
  { id: "adbe", label: "Adobe", group: "Software", x: [210, 250, 390, 610, 660, 710], y: [27, 26, 19, 33, 34, 36], size: [22, 29, 95, 230, 150, 210] },
  { id: "tsm", label: "TSMC", group: "Semiconductors", x: [170, 260, 340, 510, 580, 720], y: [31, 32, 39, 43, 50, 46], size: [55, 75, 140, 565, 380, 1010] }
];

export const STORIES: Story[] = [
  {
    id: "energy",
    eyebrow: "Study 01 · planet",
    title: "The prosperity–carbon escape",
    shortTitle: "Energy transition",
    description: "Countries move as prosperity, emissions, and population change. The compelling motion is not simply rightward growth—it is whether economies can bend downward while they grow.",
    question: "Who is getting richer without getting more carbon-intensive?",
    xLabel: "GDP per person · purchasing-power adjusted",
    yLabel: "CO₂ emissions · tonnes per person",
    sizeLabel: "population",
    xDomain: [1800, 90000],
    yDomain: [0, 22],
    xScale: "log",
    formatX: (value) => dollars.format(value),
    formatY: (value) => `${value.toFixed(1)} t`,
    formatSize: (value) => `${compact.format(value)} million people`,
    groups: { Americas: "#e8583f", Asia: "#e4a72a", Europe: "#3a7d73", Africa: "#6f65a8" },
    callouts: {
      gbr: "A long downward arc: growth paired with a steep fall in territorial emissions.",
      chn: "The largest rightward surge also climbs sharply in emissions.",
      ind: "Enormous population growth makes a small vertical move globally consequential."
    },
    frames: annualFrames(energyYears, energySeeds)
  },
  {
    id: "housing",
    eyebrow: "Study 02 · home",
    title: "The affordability squeeze",
    shortTitle: "Housing affordability",
    description: "Metros drift toward a costly upper-right corner: renters devote more income to housing while purchase prices pull away from household earnings.",
    question: "Where did the path to a home move furthest out of reach?",
    xLabel: "median rent · share of renter income",
    yLabel: "home price · multiple of household income",
    sizeLabel: "metro households",
    xDomain: [20, 43],
    yDomain: [1, 13],
    formatX: (value) => `${value.toFixed(0)}%`,
    formatY: (value) => `${value.toFixed(1)}×`,
    formatSize: (value) => `${value.toFixed(1)} million households`,
    groups: { West: "#d45a3a", South: "#d49a28", Northeast: "#506fa8", Midwest: "#4f8873" },
    callouts: {
      mia: "Miami combines one of the sharpest rent burdens with a fast-rising purchase barrier.",
      det: "A different path: lower purchase prices, but renter pressure still moves right.",
      sf: "The price-to-income ratio stays extreme even when the trajectory briefly reverses."
    },
    frames: annualFrames(housingYears, housingSeeds)
  },
  {
    id: "technology",
    eyebrow: "Study 03 · firms",
    title: "How giants change shape",
    shortTitle: "Technology lifecycles",
    description: "Technology companies migrate between scale and profitability. Some mature into cash engines; others trade margin for reach, then suddenly find leverage.",
    question: "Which companies turn each employee into durable operating power?",
    xLabel: "revenue per employee · thousands USD",
    yLabel: "operating margin",
    sizeLabel: "market value",
    xDomain: [80, 2000],
    yDomain: [-25, 68],
    formatX: (value) => `$${compact.format(value * 1000)}`,
    formatY: (value) => `${value.toFixed(0)}%`,
    formatSize: (value) => `$${compact.format(value)} billion`,
    groups: { Devices: "#dc5a42", Software: "#4c78a8", Platforms: "#8b68a6", Commerce: "#d69a2d", Semiconductors: "#438b77" },
    callouts: {
      nvda: "A late, near-vertical break: revenue density and margin expand together.",
      intc: "The incumbent’s path bends down as margin and market value contract.",
      amzn: "Scale arrives long before a consistently large operating margin."
    },
    frames: annualFrames(techYears, technologySeeds)
  }
];
