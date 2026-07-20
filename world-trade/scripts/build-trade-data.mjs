import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const API = "https://comtradeapi.un.org/public/v1/preview/C/A/HS";
const YEARS = [2000, 2005, 2010, 2015, 2020, 2023];
const EXPORTERS = [
  { id: "china", code: 156, label: "China" },
  { id: "united-states", code: 842, label: "United States" },
  { id: "germany", code: 276, label: "Germany" },
  { id: "japan", code: 392, label: "Japan" },
  { id: "netherlands", code: 528, label: "Netherlands" },
  { id: "italy", code: 380, label: "Italy" },
  { id: "france", code: 251, label: "France" },
  { id: "south-korea", code: 410, label: "South Korea" }
];
const IMPORTERS = [
  { id: "united-states", code: 842, label: "United States" },
  { id: "china", code: 156, label: "China" },
  { id: "germany", code: 276, label: "Germany" },
  { id: "france", code: 251, label: "France" },
  { id: "united-kingdom", code: 826, label: "United Kingdom" },
  { id: "japan", code: 392, label: "Japan" },
  { id: "india", code: 699, label: "India" },
  { id: "hong-kong", code: 344, label: "Hong Kong SAR" },
  { id: "rest-of-world", code: null, label: "Rest of world" }
];
const COMMODITIES = [
  { id: "food", label: "Food & agriculture", chapters: range(1, 24) },
  { id: "energy", label: "Energy & minerals", chapters: range(25, 27) },
  { id: "chemicals", label: "Chemicals", chapters: range(28, 38) },
  { id: "plastics", label: "Plastics & rubber", chapters: range(39, 40) },
  { id: "textiles", label: "Textiles & apparel", chapters: [...range(41, 43), ...range(50, 67)] },
  { id: "wood-paper", label: "Wood & paper", chapters: range(44, 49) },
  { id: "metals", label: "Metals, stone & precious goods", chapters: range(68, 83) },
  { id: "machinery", label: "Machinery & electronics", chapters: range(84, 85) },
  { id: "transport", label: "Transport equipment", chapters: range(86, 89) },
  { id: "other", label: "Other manufactured goods", chapters: range(90, 99) }
];
const IMPORTER_GROUPS = [IMPORTERS.slice(0, 4), IMPORTERS.slice(4, 8)];
const here = path.dirname(fileURLToPath(import.meta.url));
const output = path.resolve(here, "../data/trade.generated.json");

const jobs = [];
for (const year of YEARS) {
  for (const exporter of EXPORTERS) {
    jobs.push({ year, exporter, partners: [{ code: 0 }], kind: "world" });
    for (const partners of IMPORTER_GROUPS) jobs.push({ year, exporter, partners, kind: "partners" });
  }
}

const responses = new Map();
for (let start = 0; start < jobs.length; start += 2) {
  const batch = jobs.slice(start, start + 2);
  const results = await Promise.all(batch.map(fetchJob));
  for (let index = 0; index < batch.length; index += 1) responses.set(jobKey(batch[index]), results[index]);
  console.log(`Fetched ${Math.min(start + batch.length, jobs.length)} / ${jobs.length}`);
  await new Promise((resolve) => setTimeout(resolve, 450));
}

const years = YEARS.map((year) => {
  const exporterCommodity = [];
  const commodityImporterTotals = new Map(COMMODITIES.flatMap((commodity) => IMPORTERS.map((importer) => [`${commodity.id}:${importer.id}`, 0])));
  let total = 0;

  for (const exporter of EXPORTERS) {
    const world = responses.get(jobKey({ year, exporter, kind: "world" }));
    const partnerRows = IMPORTER_GROUPS.flatMap((partners) => responses.get(jobKey({ year, exporter, kind: "partners", partners })));
    const worldByCommodity = aggregateCommodities(world);
    const partnersByCommodity = new Map();
    for (const row of partnerRows) {
      const commodity = commodityForChapter(row.cmdCode);
      const importer = IMPORTERS.find((item) => item.code === row.partnerCode);
      if (!commodity || !importer) continue;
      const key = `${commodity.id}:${importer.id}`;
      partnersByCommodity.set(key, (partnersByCommodity.get(key) ?? 0) + (row.primaryValue ?? 0));
    }

    for (const commodity of COMMODITIES) {
      const value = worldByCommodity.get(commodity.id) ?? 0;
      exporterCommodity.push({ exporter: exporter.id, commodity: commodity.id, value });
      total += value;
      let namedDestinations = 0;
      for (const importer of IMPORTERS.slice(0, -1)) {
        const key = `${commodity.id}:${importer.id}`;
        const amount = partnersByCommodity.get(key) ?? 0;
        namedDestinations += amount;
        commodityImporterTotals.set(key, commodityImporterTotals.get(key) + amount);
      }
      const restKey = `${commodity.id}:rest-of-world`;
      commodityImporterTotals.set(restKey, commodityImporterTotals.get(restKey) + Math.max(0, value - namedDestinations));
    }
  }

  const commodityImporter = [];
  for (const commodity of COMMODITIES) {
    for (const importer of IMPORTERS) {
      const value = commodityImporterTotals.get(`${commodity.id}:${importer.id}`) ?? 0;
      commodityImporter.push({ commodity: commodity.id, importer: importer.id, value });
    }
  }
  const destinationTotal = commodityImporter.reduce((sum, flow) => sum + flow.value, 0);
  if (Math.abs(total - destinationTotal) > 2) throw new Error(`${year} does not reconcile: ${total} vs ${destinationTotal}`);
  return { year, total: Math.round(total), exporterCommodity: roundFlows(exporterCommodity), commodityImporter: roundFlows(commodityImporter) };
});

fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, `${JSON.stringify({
  source: {
    title: "UN Comtrade annual merchandise exports",
    publisher: "United Nations Statistics Division",
    url: "https://comtradeplus.un.org/",
    api: API,
    classification: "Harmonized System, two-digit chapters grouped into ten families",
    unit: "current US dollars",
    retrieved: "2026-07-20",
    note: "Reporter-recorded exports from the eight largest merchandise exporters in the 2023 comparison. Named destinations are the eight largest import markets in that comparison; all remaining destinations are retained as Rest of world."
  },
  exporters: EXPORTERS.map(({ id, label }) => ({ id, label })),
  commodities: COMMODITIES.map(({ id, label }) => ({ id, label })),
  importers: IMPORTERS.map(({ id, label }) => ({ id, label })),
  years
}, null, 2)}\n`);
console.log(`Wrote ${years.length} benchmark years to ${output}`);
console.log(`2023 represented exports: $${(years.at(-1).total / 1e12).toFixed(2)} trillion`);

async function fetchJob(job) {
  const partnerCodes = job.partners.map((item) => item.code).join(",");
  const url = new URL(API);
  url.searchParams.set("period", String(job.year));
  url.searchParams.set("reporterCode", String(job.exporter.code));
  url.searchParams.set("cmdCode", "AG2");
  url.searchParams.set("flowCode", "X");
  url.searchParams.set("partnerCode", partnerCodes);
  url.searchParams.set("partner2Code", "0");
  url.searchParams.set("customsCode", "C00");
  url.searchParams.set("motCode", "0");
  url.searchParams.set("maxRecords", "500");
  for (let attempt = 1; attempt <= 6; attempt += 1) {
    const response = await fetch(url);
    if (response.ok) {
      const payload = await response.json();
      if (!payload.error) return payload.data ?? [];
    }
    if (attempt < 6) await new Promise((resolve) => setTimeout(resolve, 1_200 * attempt));
  }
  throw new Error(`Failed ${url}`);
}

function aggregateCommodities(rows) {
  const result = new Map(COMMODITIES.map((commodity) => [commodity.id, 0]));
  for (const row of rows) {
    const commodity = commodityForChapter(row.cmdCode);
    if (commodity) result.set(commodity.id, result.get(commodity.id) + (row.primaryValue ?? 0));
  }
  return result;
}
function commodityForChapter(code) {
  const chapter = Number(code);
  return COMMODITIES.find((commodity) => commodity.chapters.includes(chapter));
}
function roundFlows(flows) { return flows.map((flow) => ({ ...flow, value: Math.round(flow.value) })); }
function range(start, end) { return Array.from({ length: end - start + 1 }, (_, index) => start + index); }
function jobKey(job) {
  const partners = job.kind === "world" ? "0" : job.partners.map((item) => item.code).join("-");
  return `${job.year}:${job.exporter.id}:${job.kind}:${partners}`;
}
