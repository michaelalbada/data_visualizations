export const LCOE_YEARS = [2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2023, 2024, 2025] as const;

export type TechnologyId = "solar" | "wind" | "gas-combined" | "coal" | "nuclear" | "geothermal" | "gas-peaking";
export type TechnologyGroup = "Falling renewables" | "Firm & conventional";

export type Technology = {
  id: TechnologyId;
  name: string;
  shortName: string;
  group: TechnologyGroup;
  color: string;
  values: number[];
  note: string;
};

export const TECHNOLOGIES: Technology[] = [
  {
    id: "solar",
    name: "Solar PV — utility",
    shortName: "Utility solar",
    group: "Falling renewables",
    color: "#e7a93d",
    values: [359, 248, 157, 125, 98, 79, 64, 55, 50, 43, 40, 37, 36, 60, 61, 58],
    note: "Utility-scale solar moves from the most expensive technology in this comparison to the least expensive average new build."
  },
  {
    id: "wind",
    name: "Wind — onshore",
    shortName: "Onshore wind",
    group: "Falling renewables",
    color: "#58b9d0",
    values: [135, 124, 71, 72, 70, 59, 55, 47, 45, 42, 41, 40, 38, 50, 50, 61],
    note: "Onshore wind falls quickly, then gives back part of the decline as financing and supply-chain conditions tighten after 2021."
  },
  {
    id: "gas-combined",
    name: "Gas combined cycle",
    shortName: "Combined-cycle gas",
    group: "Firm & conventional",
    color: "#ef5a4f",
    values: [83, 82, 83, 75, 74, 74, 65, 63, 60, 58, 56, 59, 60, 70, 76, 78],
    note: "Combined-cycle gas remains the closest conventional competitor in Lazard's average new-build comparison."
  },
  {
    id: "coal",
    name: "Coal",
    shortName: "Coal",
    group: "Firm & conventional",
    color: "#9b9289",
    values: [111, 107, 111, 102, 105, 109, 108, 102, 102, 102, 109, 112, 108, 117, 118, 122],
    note: "New coal is slightly more expensive at the end of the series than at the beginning."
  },
  {
    id: "nuclear",
    name: "U.S. nuclear",
    shortName: "Nuclear",
    group: "Firm & conventional",
    color: "#f08d79",
    values: [123, 96, 95, 96, 105, 112, 117, 117, 148, 151, 155, 163, 167, 180, 182, 180],
    note: "The recent nuclear estimates reflect Lazard's v14.0 assumptions adjusted for inflation and based on then-estimated Vogtle costs."
  },
  {
    id: "geothermal",
    name: "Geothermal",
    shortName: "Geothermal",
    group: "Firm & conventional",
    color: "#7daf73",
    values: [76, 111, 104, 116, 116, 116, 100, 98, 97, 91, 91, 80, 75, 82, 85, 88],
    note: "Geothermal remains comparatively stable, but its buildable geography is much more constrained than wind or solar."
  },
  {
    id: "gas-peaking",
    name: "Gas peaking",
    shortName: "Gas peaking",
    group: "Firm & conventional",
    color: "#668ca1",
    values: [275, 243, 227, 216, 205, 205, 192, 191, 183, 179, 175, 175, 173, 168, 169, 200],
    note: "Peakers trade fuel efficiency for fast dispatch; their role differs from bulk-energy resources even when shown on the same LCOE axis."
  }
];

export const MILESTONES = [
  { year: 2009, title: "Solar begins at the ceiling", body: "$359/MWh — more than four times combined-cycle gas." },
  { year: 2011, title: "Wind crosses gas", body: "Average onshore wind falls below combined-cycle gas." },
  { year: 2013, title: "Solar crosses coal", body: "Utility solar reaches $98/MWh, below new coal's $105/MWh." },
  { year: 2015, title: "Solar crosses gas", body: "At $64/MWh, solar edges below combined-cycle gas." },
  { year: 2025, title: "The ranking reverses", body: "Solar and wind are the two lowest averages in this comparison." }
];

export function valueAt(technology: Technology, yearIndex: number) {
  return technology.values[Math.min(yearIndex, technology.values.length - 1)];
}

export function percentChange(technology: Technology, yearIndex = LCOE_YEARS.length - 1) {
  return (valueAt(technology, yearIndex) / technology.values[0] - 1) * 100;
}
