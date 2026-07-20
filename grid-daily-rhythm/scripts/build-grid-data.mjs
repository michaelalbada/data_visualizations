import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const output = path.resolve(here, "../data/grid.generated.json");
const sourceUrl = "https://www.eia.gov/electricity/gridmonitor/sixMonthFiles/EIA930_BALANCE_2024_Jan_Jun.csv";

const REGIONS = [
  { key: "california-spring", respondent: "CISO", label: "California · April 21, 2024", shortLabel: "California", date: "04/21/2024", summary: "Observed CAISO generation, demand, and interchange across a spring Sunday." },
  { key: "texas-summer", respondent: "ERCO", label: "Texas · June 20, 2024", shortLabel: "Texas", date: "06/20/2024", summary: "Observed ERCOT generation, demand, and interchange across an early-summer Thursday." },
  { key: "midwest-winter", respondent: "MISO", label: "Midcontinent · January 15, 2024", shortLabel: "Midcontinent", date: "01/15/2024", summary: "Observed MISO generation, demand, and interchange during a winter cold spell." },
  { key: "northeast-peak", respondent: "NYIS", label: "New York · June 20, 2024", shortLabel: "New York", date: "06/20/2024", summary: "Observed NYISO generation, demand, and interchange on an early-summer weekday." },
  { key: "southeast-summer", respondent: "SOCO", label: "Southern Company · June 20, 2024", shortLabel: "Southeast", date: "06/20/2024", summary: "Observed Southern Company generation, demand, and interchange on an early-summer weekday." },
  { key: "northwest-spring", respondent: "BPAT", label: "Pacific Northwest · May 15, 2024", shortLabel: "Northwest", date: "05/15/2024", summary: "Observed Bonneville Power Administration generation, demand, and interchange in spring." },
  { key: "western-states", respondent: "SWPP", label: "Southwest Power Pool · April 2, 2024", shortLabel: "SPP", date: "04/02/2024", summary: "Observed Southwest Power Pool generation, demand, and interchange on a spring day." }
];

function parseRow(line) {
  const values = [];
  let field = "", quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    if (char === '"') {
      if (quoted && line[index + 1] === '"') { field += '"'; index += 1; }
      else quoted = !quoted;
    } else if (char === "," && !quoted) { values.push(field); field = ""; }
    else field += char;
  }
  values.push(field);
  return values;
}

function number(row, header, name) {
  const adjusted = row[header.get(`${name} (Adjusted)`)] ?? "";
  const reported = row[header.get(name)] ?? "";
  const value = Number(adjusted !== "" ? adjusted : reported);
  return Number.isFinite(value) ? value : 0;
}

const response = await fetch(sourceUrl);
if (!response.ok) throw new Error(`${response.status}: ${sourceUrl}`);
const lines = (await response.text()).split(/\r?\n/).filter(Boolean);
const headers = parseRow(lines.shift());
const header = new Map(headers.map((name, index) => [name, index]));
const wanted = new Map(REGIONS.map((region) => [`${region.respondent}:${region.date}`, region]));
const grouped = new Map(REGIONS.map((region) => [region.key, []]));

for (const line of lines) {
  const row = parseRow(line);
  const respondent = row[header.get("Balancing Authority")];
  const date = row[header.get("Data Date")];
  const region = wanted.get(`${respondent}:${date}`);
  if (!region) continue;
  const demand = number(row, header, "Demand (MW)") / 1000;
  const interchange = number(row, header, "Total Interchange (MW)") / 1000;
  const coal = number(row, header, "Net Generation (MW) from Coal") / 1000;
  const naturalGas = number(row, header, "Net Generation (MW) from Natural Gas") / 1000;
  const nuclear = number(row, header, "Net Generation (MW) from Nuclear") / 1000;
  const petroleum = number(row, header, "Net Generation (MW) from All Petroleum Products") / 1000;
  const hydro = Math.max(0, number(row, header, "Net Generation (MW) from Hydropower and Pumped Storage") / 1000);
  const solar = Math.max(0, number(row, header, "Net Generation (MW) from Solar") / 1000);
  const wind = Math.max(0, number(row, header, "Net Generation (MW) from Wind") / 1000);
  const other = number(row, header, "Net Generation (MW) from Other Fuel Sources") / 1000 + number(row, header, "Net Generation (MW) from Unknown Fuel Sources") / 1000;
  const imports = Math.max(0, -interchange);
  const thermal = Math.max(0, naturalGas + petroleum + other);
  const clean = nuclear + hydro + wind + solar;
  const carbonNumerator = coal * 1.0 + naturalGas * 0.41 + petroleum * 0.75 + Math.max(0, other) * 0.5 + imports * 0.18;
  const hourNumber = Number(row[header.get("Hour Number")]);
  grouped.get(region.key).push({
    period: row[header.get("Local Time at End of Hour")],
    offsetMinute: (hourNumber - 1) * 60,
    clockMinute: (hourNumber - 1) * 60,
    demand,
    netLoad: Math.max(0, demand - solar - wind),
    cleanShare: demand > 0 ? clean / demand : 0,
    carbonRate: demand > 0 ? carbonNumerator / demand : 0,
    nuclear, hydro, wind, solar, imports, battery: Math.max(0, coal), gas: thermal
  });
}

const regions = REGIONS.map((region) => {
  const points = grouped.get(region.key).sort((a, b) => a.offsetMinute - b.offsetMinute);
  if (points.length !== 24) throw new Error(`${region.respondent} ${region.date}: ${points.length} rows, expected 24.`);
  return { ...region, points };
});

await fs.writeFile(output, `${JSON.stringify({ generatedAt: new Date().toISOString(), source: "EIA-930", sourceUrl, regions }, null, 2)}\n`);
console.log(`Wrote ${output}: ${regions.length} observed balancing-authority days.`);
