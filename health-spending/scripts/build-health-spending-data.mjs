import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const input = process.argv[2];
if (!input) {
  console.error("Usage: node build-health-spending-data.mjs /path/to/NHE2024.csv");
  process.exit(1);
}

const here = path.dirname(fileURLToPath(import.meta.url));
const output = path.resolve(here, "../data/health-spending.generated.json");
const rows = parseCsv(fs.readFileSync(input).toString("latin1"));
const years = rows[1].slice(1).map(Number);

const payers = [
  { id: "out-of-pocket", label: "Out of pocket", shortLabel: "Out of pocket" },
  { id: "private-insurance", label: "Private health insurance", shortLabel: "Private insurance" },
  { id: "medicare", label: "Medicare", shortLabel: "Medicare" },
  { id: "medicaid-chip", label: "Medicaid & CHIP", shortLabel: "Medicaid & CHIP" },
  { id: "defense-veterans", label: "Defense & Veterans Affairs", shortLabel: "Defense & VA" },
  { id: "other-programs", label: "Other payers & programs", shortLabel: "Other programs" },
  { id: "direct-public", label: "Other direct public funding", shortLabel: "Direct public" },
  { id: "private-capital", label: "Private research & capital", shortLabel: "Private capital" }
];

const services = [
  { id: "hospital", label: "Hospital care", rows: [102] },
  { id: "physician", label: "Physicians & clinics", rows: [132] },
  { id: "prescriptions", label: "Prescription drugs", rows: [282] },
  { id: "nursing-residential", label: "Nursing & residential care", rows: [342, 372] },
  { id: "professional-dental", label: "Dental & other professionals", rows: [162, 192] },
  { id: "home-health", label: "Home health care", rows: [222] },
  { id: "medical-products", label: "Medical products & equipment", rows: [252, 312] },
  { id: "administration", label: "Administration & insurance", rows: [402] },
  { id: "public-health", label: "Public health", rows: [522] },
  { id: "research-capital", label: "Research & capital", rows: [525, 529] }
];

function value(row, column) {
  const cleaned = (rows[row]?.[column] ?? "").replace(/[^0-9.-]/g, "");
  const parsed = cleaned ? Number(cleaned) : 0;
  return Number.isFinite(parsed) ? parsed : 0;
}

function standardServiceFlows(base, column) {
  const result = {
    "out-of-pocket": value(base + 1, column),
    "private-insurance": value(base + 3, column),
    medicare: value(base + 4, column),
    "medicaid-chip": value(base + 5, column) + value(base + 8, column),
    "defense-veterans": value(base + 11, column) + value(base + 12, column),
    "other-programs": value(base + 13, column),
    "direct-public": 0,
    "private-capital": 0
  };
  const total = value(base, column);
  const parts = Object.values(result).reduce((sum, amount) => sum + amount, 0);
  result["other-programs"] += total - parts;
  return result;
}

const data = years.map((year, yearIndex) => {
  const column = yearIndex + 1;
  const flows = [];

  for (const service of services.slice(0, 8)) {
    const combined = Object.fromEntries(payers.map((payer) => [payer.id, 0]));
    for (const base of service.rows) {
      const rowFlows = standardServiceFlows(base, column);
      for (const payer of payers) combined[payer.id] += rowFlows[payer.id];
    }
    for (const payer of payers) {
      if (combined[payer.id] > 0) flows.push({ source: payer.id, target: service.id, value: combined[payer.id] });
    }
  }

  const publicHealth = value(522, column);
  flows.push({ source: "direct-public", target: "public-health", value: publicHealth });

  const researchCapital = value(525, column) + value(529, column);
  const privateCapital = value(526, column) + value(530, column);
  flows.push({ source: "private-capital", target: "research-capital", value: privateCapital });
  flows.push({ source: "direct-public", target: "research-capital", value: researchCapital - privateCapital });

  const total = value(2, column);
  let flowTotal = flows.reduce((sum, flow) => sum + flow.value, 0);
  const nationalRoundingDelta = total - flowTotal;
  if (nationalRoundingDelta) {
    const adjustment = flows.find((flow) => flow.source === "other-programs" && flow.target === "administration");
    adjustment.value += nationalRoundingDelta;
    flowTotal += nationalRoundingDelta;
  }
  if (Math.abs(total - flowTotal) > 0.01) {
    throw new Error(`${year} does not reconcile: total ${total}, flows ${flowTotal}`);
  }

  return {
    year,
    total,
    population: value(38, column),
    flows
  };
});

fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, `${JSON.stringify({
  source: {
    title: "National Health Expenditures by Type of Service and Source of Funds, CY 1960–2024",
    publisher: "Centers for Medicare & Medicaid Services",
    url: "https://www.cms.gov/data-research/statistics-trends-and-reports/national-health-expenditure-data/historical",
    unit: "millions of current-year US dollars",
    retrieved: "2026-07-20"
  },
  payers,
  services: services.map(({ id, label }) => ({ id, label })),
  years: data
}, null, 2)}\n`);

console.log(`Wrote ${data.length} years to ${output}`);
console.log(`2024 total: $${data.at(-1).total.toLocaleString()} million`);

function parseCsv(text) {
  const outputRows = [];
  let row = [];
  let field = "";
  let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    if (quoted) {
      if (character === '"' && text[index + 1] === '"') {
        field += '"';
        index += 1;
      } else if (character === '"') quoted = false;
      else field += character;
    } else if (character === '"') quoted = true;
    else if (character === ",") {
      row.push(field);
      field = "";
    } else if (character === "\n") {
      row.push(field.replace(/\r$/, ""));
      outputRows.push(row);
      row = [];
      field = "";
    } else field += character;
  }
  if (field || row.length) {
    row.push(field);
    outputRows.push(row);
  }
  return outputRows;
}
