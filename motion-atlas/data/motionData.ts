import generated from "./motion.generated.json";

export type MotionPoint = {
  id: string;
  label: string;
  group: string;
  x: number;
  y: number;
  size: number;
};

export type MotionFrame = { label: string; points: MotionPoint[] };

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
  sources: Array<{ label: string; href: string }>;
  method: string;
  frames: MotionFrame[];
};

const compact = new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 });
const dollars = new Intl.NumberFormat("en", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

export const STORIES: Story[] = [
  {
    id: "energy",
    eyebrow: "Study 01 · planet · observed 2000–2023",
    title: "The prosperity–carbon escape",
    shortTitle: "Energy transition",
    description: "Countries move through 24 annual observations of prosperity, territorial emissions, and population. The revealing motion is whether economies can bend downward while they grow.",
    question: "Who is getting richer without getting more carbon-intensive?",
    xLabel: "GDP per person · 2021 international-$",
    yLabel: "CO₂ emissions · tonnes per person",
    sizeLabel: "population",
    xDomain: [1200, 100000],
    yDomain: [0, 24],
    xScale: "log",
    formatX: (value) => dollars.format(value),
    formatY: (value) => `${value.toFixed(1)} t`,
    formatSize: (value) => `${compact.format(value)} million people`,
    groups: { Americas: "#e8583f", Asia: "#e4a72a", Europe: "#3a7d73", Africa: "#6f65a8" },
    callouts: {
      gbr: "A long downward arc: growth paired with a steep fall in territorial emissions.",
      chn: "A huge rightward surge accompanied by a substantial rise in per-person emissions.",
      ind: "A modest vertical move multiplied across the world's largest population."
    },
    sources: [
      { label: "OWID · CO₂ emissions and GDP per capita", href: "https://ourworldindata.org/grapher/co2-emissions-and-gdp-per-capita" },
      { label: "OWID · Population", href: "https://ourworldindata.org/grapher/population" }
    ],
    method: "Annual published observations joined by ISO country code and year; no values are interpolated.",
    frames: generated.energy
  },
  {
    id: "housing",
    eyebrow: "Study 02 · home · ACS 2021–2024",
    title: "The affordability squeeze",
    shortTitle: "Housing affordability",
    description: "Metro estimates move across two connected barriers: the median renter's income share and the median owner-occupied home's price relative to household income.",
    question: "Where did renting and buying move furthest out of reach?",
    xLabel: "median gross rent · share of renter income",
    yLabel: "median home value · multiple of household income",
    sizeLabel: "metro households",
    xDomain: [20, 42],
    yDomain: [2, 13],
    formatX: (value) => `${value.toFixed(1)}%`,
    formatY: (value) => `${value.toFixed(1)}×`,
    formatSize: (value) => `${value.toFixed(1)} million households`,
    groups: { West: "#d45a3a", South: "#d49a28", Northeast: "#506fa8", Midwest: "#4f8873" },
    callouts: {
      mia: "Miami combines one of the highest observed rent burdens with a high purchase barrier.",
      det: "Detroit remains comparatively inexpensive to buy, while rent still consumes a substantial income share.",
      sf: "San Francisco's home-value-to-income multiple remains extreme even as the annual estimates move."
    },
    sources: [
      { label: "Census ACS · B25071, B25077, B19013, B11001", href: "https://www.census.gov/programs-surveys/acs/data/summary-file.html" }
    ],
    method: "ACS 1-year metro estimates. Purchase multiple is median owner-occupied value divided by median household income; 2020 has no ACS 1-year release.",
    frames: generated.housing
  },
  {
    id: "technology",
    eyebrow: "Study 03 · firms · SEC 10-K facts",
    title: "How giants change shape",
    shortTitle: "Technology lifecycles",
    description: "U.S.-listed technology companies move through reported annual revenue, operating margin, and total assets. Missing years stay missing rather than being filled in.",
    question: "Which companies turn scale into durable operating power?",
    xLabel: "annual revenue · billions USD",
    yLabel: "operating margin",
    sizeLabel: "total assets",
    xDomain: [0, 700],
    yDomain: [-25, 70],
    formatX: (value) => `$${value.toFixed(0)}B`,
    formatY: (value) => `${value.toFixed(0)}%`,
    formatSize: (value) => `$${compact.format(value)} billion`,
    groups: { Devices: "#dc5a42", Software: "#4c78a8", Platforms: "#8b68a6", Commerce: "#d69a2d", Semiconductors: "#438b77", Networking: "#6b7f55" },
    callouts: {
      nvda: "A late upward break: reported revenue and operating margin expand together.",
      intc: "The incumbent's path bends down as reported operating margin contracts.",
      amzn: "Enormous revenue arrives long before a consistently large operating margin."
    },
    sources: [
      { label: "SEC EDGAR · Company Facts API", href: "https://www.sec.gov/search-filings/edgar-application-programming-interfaces" }
    ],
    method: "Annual 10-K facts only. Revenue and operating income are matched by fiscal-year end; bubble area uses reported total assets. No market prices or modeled values.",
    frames: generated.technology
  }
];
