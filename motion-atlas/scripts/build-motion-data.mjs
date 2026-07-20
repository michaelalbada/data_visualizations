import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const here = path.dirname(fileURLToPath(import.meta.url));
const output = path.resolve(here, "../data/motion.generated.json");
const execFileAsync = promisify(execFile);
let secContact;

const COUNTRIES = [
  ["USA", "United States", "Americas"], ["CHN", "China", "Asia"],
  ["IND", "India", "Asia"], ["DEU", "Germany", "Europe"],
  ["GBR", "United Kingdom", "Europe"], ["BRA", "Brazil", "Americas"],
  ["ZAF", "South Africa", "Africa"], ["NGA", "Nigeria", "Africa"],
  ["NOR", "Norway", "Europe"], ["IDN", "Indonesia", "Asia"],
  ["JPN", "Japan", "Asia"], ["KOR", "South Korea", "Asia"],
  ["CAN", "Canada", "Americas"], ["MEX", "Mexico", "Americas"],
  ["FRA", "France", "Europe"], ["AUS", "Australia", "Asia"],
  ["SAU", "Saudi Arabia", "Asia"], ["KEN", "Kenya", "Africa"]
].map(([code, label, group]) => ({ code, id: code.toLowerCase(), label, group }));

const METROS = [
  ["41860", "sf", "San Francisco", "West"], ["31080", "la", "Los Angeles", "West"],
  ["42660", "sea", "Seattle", "West"], ["12420", "aus", "Austin", "South"],
  ["33100", "mia", "Miami", "South"], ["35620", "nyc", "New York", "Northeast"],
  ["14460", "bos", "Boston", "Northeast"], ["16980", "chi", "Chicago", "Midwest"],
  ["19820", "det", "Detroit", "Midwest"], ["38060", "phx", "Phoenix", "West"],
  ["41740", "sd", "San Diego", "West"], ["19740", "den", "Denver", "West"],
  ["38900", "por", "Portland", "West"], ["19100", "dal", "Dallas", "South"],
  ["12060", "atl", "Atlanta", "South"], ["47900", "dc", "Washington, DC", "South"],
  ["33460", "msp", "Minneapolis", "Midwest"], ["37980", "phl", "Philadelphia", "Northeast"]
].map(([cbsa, id, label, group]) => ({ cbsa, id, label, group }));

const COMPANIES = [
  ["aapl", "Apple", "Devices", [320193]],
  ["msft", "Microsoft", "Software", [789019]],
  ["goog", "Alphabet", "Platforms", [1288776, 1652044]],
  ["amzn", "Amazon", "Commerce", [1018724]],
  ["meta", "Meta", "Platforms", [1326801]],
  ["nvda", "Nvidia", "Semiconductors", [1045810]],
  ["intc", "Intel", "Semiconductors", [50863]],
  ["crm", "Salesforce", "Software", [1108524]],
  ["adbe", "Adobe", "Software", [796343]],
  ["orcl", "Oracle", "Software", [1341439]],
  ["ibm", "IBM", "Software", [51143]],
  ["nflx", "Netflix", "Platforms", [1065280]],
  ["amd", "AMD", "Semiconductors", [2488]],
  ["tsla", "Tesla", "Devices", [1318605]],
  ["uber", "Uber", "Commerce", [1543151]],
  ["csco", "Cisco", "Networking", [858877]],
  ["qcom", "Qualcomm", "Semiconductors", [804328]],
  ["pypl", "PayPal", "Commerce", [1633917]]
].map(([id, label, group, ciks]) => ({ id, label, group, ciks }));

async function fetchText(url, options = {}) {
  const response = await fetch(url, options);
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}: ${url}`);
  return response.text();
}

function parseDelimited(text, delimiter = ",") {
  const rows = [];
  let row = [], field = "", quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    if (char === '"') {
      if (quoted && text[index + 1] === '"') { field += '"'; index += 1; }
      else quoted = !quoted;
    } else if (char === delimiter && !quoted) { row.push(field); field = ""; }
    else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && text[index + 1] === "\n") index += 1;
      row.push(field); field = "";
      if (row.some((value) => value !== "")) rows.push(row);
      row = [];
    } else field += char;
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  const [headers, ...body] = rows;
  return body.map((values) => Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""])));
}

async function buildEnergy() {
  const [combinedText, populationText] = await Promise.all([
    fetchText("https://ourworldindata.org/grapher/co2-emissions-and-gdp-per-capita.csv?v=1&csvType=full&useColumnShortNames=false"),
    fetchText("https://ourworldindata.org/grapher/population.csv?v=1&csvType=full&useColumnShortNames=false")
  ]);
  const combined = parseDelimited(combinedText);
  const populations = new Map(parseDelimited(populationText).map((row) => [`${row.Code}:${row.Year}`, Number(row.Population)]));
  const selected = new Map(COUNTRIES.map((country) => [country.code, country]));
  const byYear = new Map();
  for (const row of combined) {
    const country = selected.get(row.Code);
    const year = Number(row.Year);
    const population = populations.get(`${row.Code}:${row.Year}`);
    const gdp = Number(row["GDP per capita"]);
    const co2 = Number(row["CO₂ emissions per capita"]);
    if (!country || year < 2000 || year > 2024 || !population || !Number.isFinite(gdp) || !Number.isFinite(co2)) continue;
    const points = byYear.get(year) ?? [];
    points.push({ id: country.id, label: country.label, group: country.group, x: gdp, y: co2, size: population / 1e6 });
    byYear.set(year, points);
  }
  return [...byYear].sort(([a], [b]) => a - b).map(([year, points]) => ({ label: String(year), points }));
}

async function buildHousing() {
  const years = [2021, 2022, 2023, 2024];
  const tables = ["b25071", "b25077", "b19013", "b11001"];
  return Promise.all(years.map(async (year) => {
    const base = `https://www2.census.gov/programs-surveys/acs/summary_file/${year}/table-based-SF`;
    const [geoText, ...tableTexts] = await Promise.all([
      fetchText(`${base}/documentation/Geos${year}1YR.txt`),
      ...tables.map((table) => fetchText(`${base}/data/1YRData/acsdt1y${year}-${table}.dat`))
    ]);
    const metrosByGeo = new Map();
    for (const row of parseDelimited(geoText, "|")) {
      const metro = METROS.find((candidate) => candidate.cbsa === row.CBSA && row.SUMLEVEL === "310");
      if (metro) metrosByGeo.set(row.GEO_ID, metro);
    }
    const values = new Map();
    for (const text of tableTexts) {
      for (const row of parseDelimited(text, "|")) {
        if (!metrosByGeo.has(row.GEO_ID)) continue;
        values.set(row.GEO_ID, { ...(values.get(row.GEO_ID) ?? {}), ...row });
      }
    }
    const points = [...metrosByGeo].map(([geoId, metro]) => {
      const row = values.get(geoId);
      const rentBurden = Number(row?.B25071_E001);
      const homeValue = Number(row?.B25077_E001);
      const income = Number(row?.B19013_E001);
      const households = Number(row?.B11001_E001);
      if (![rentBurden, homeValue, income, households].every(Number.isFinite) || income <= 0) return null;
      return { id: metro.id, label: metro.label, group: metro.group, x: rentBurden, y: homeValue / income, size: households / 1e6 };
    }).filter(Boolean);
    return { label: String(year), points };
  }));
}

function annualDurations(fact) {
  const usd = fact?.units?.USD ?? [];
  return usd.filter((item) => item.form === "10-K" && item.fp === "FY" && item.start && item.end &&
    (new Date(item.end) - new Date(item.start)) / 864e5 >= 300);
}

function annualInstants(fact) {
  return (fact?.units?.USD ?? []).filter((item) => item.form === "10-K" && item.fp === "FY" && item.end);
}

function latestByEndYear(items) {
  const result = new Map();
  for (const item of items) {
    const year = Number(item.end.slice(0, 4));
    const prior = result.get(year);
    if (!prior || item.filed > prior.filed) result.set(year, item);
  }
  return result;
}

function firstFact(facts, names) {
  for (const name of names) if (facts[name]) return facts[name];
  return undefined;
}

async function fetchCompanyFacts(cik) {
  if (!secContact) {
    const { stdout } = await execFileAsync("git", ["config", "user.email"]);
    secContact = stdout.trim();
    if (!secContact) throw new Error("SEC downloads require a contact email in git config user.email.");
  }
  const url = `https://data.sec.gov/api/xbrl/companyfacts/CIK${String(cik).padStart(10, "0")}.json`;
  const { stdout } = await execFileAsync("curl", [
    "-A", `Data Visualizations research contact: ${secContact}`,
    "-L", "--fail", "--silent", "--show-error", url
  ], { maxBuffer: 32 * 1024 * 1024 });
  return JSON.parse(stdout);
}

async function buildTechnology() {
  const companySeries = [];
  for (const company of COMPANIES) {
    const merged = new Map();
    for (const cik of company.ciks) {
      const document = await fetchCompanyFacts(cik);
      const facts = document.facts?.["us-gaap"] ?? {};
      const revenues = latestByEndYear(annualDurations(firstFact(facts, ["RevenueFromContractWithCustomerExcludingAssessedTax", "SalesRevenueNet", "Revenues"]))) ;
      const operating = latestByEndYear(annualDurations(firstFact(facts, ["OperatingIncomeLoss"]))) ;
      const assets = latestByEndYear(annualInstants(firstFact(facts, ["Assets"]))) ;
      for (const [year, revenue] of revenues) {
        const op = operating.get(year), asset = assets.get(year);
        if (!op || !asset || revenue.val <= 0 || year < 2009 || year > 2024) continue;
        merged.set(year, { id: company.id, label: company.label, group: company.group, x: revenue.val / 1e9, y: op.val / revenue.val * 100, size: asset.val / 1e9 });
      }
    }
    companySeries.push(merged);
    await new Promise((resolve) => setTimeout(resolve, 120));
  }
  const years = Array.from({ length: 16 }, (_, index) => 2009 + index);
  return years.map((year) => ({ label: String(year), points: companySeries.flatMap((series) => series.has(year) ? [series.get(year)] : []) }));
}

const [energy, housing, technology] = await Promise.all([buildEnergy(), buildHousing(), buildTechnology()]);
await fs.writeFile(output, `${JSON.stringify({ generatedAt: new Date().toISOString(), energy, housing, technology }, null, 2)}\n`);
console.log(`Wrote ${output}: ${energy.length} energy years, ${housing.length} housing years, ${technology.length} technology years.`);
