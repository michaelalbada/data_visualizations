import fs from "node:fs";

const [inputPath, outputPath] = process.argv.slice(2);

if (!inputPath || !outputPath) {
  throw new Error("Usage: node build-exoplanet-data.mjs input.csv output.json");
}

const rows = parseCsv(fs.readFileSync(inputPath, "utf8"));
const headers = rows.shift();
const index = Object.fromEntries(headers.map((header, position) => [header, position]));
const systems = new Map();

for (const row of rows) {
  if (!row[index.hostname] || !row[index.pl_name]) continue;
  const hostname = row[index.hostname];
  const system = systems.get(hostname) ?? {
    id: slug(hostname),
    name: hostname,
    distance: number(row[index.sy_dist]),
    galacticLongitude: number(row[index.glon]),
    galacticLatitude: number(row[index.glat]),
    starTemp: number(row[index.st_teff]),
    starRadius: number(row[index.st_rad]),
    planets: []
  };

  system.planets.push({
    name: row[index.pl_name],
    period: number(row[index.pl_orbper]),
    axis: number(row[index.pl_orbsmax]),
    radius: number(row[index.pl_rade]),
    mass: number(row[index.pl_bmasse]),
    year: number(row[index.disc_year]),
    method: row[index.discoverymethod] || "Other",
    temperature: number(row[index.pl_eqt])
  });
  systems.set(hostname, system);
}

const output = [...systems.values()]
  .map((system) => ({
    ...system,
    planets: system.planets.sort((a, b) => a.period - b.period)
  }))
  .sort((a, b) => {
    if (a.distance == null) return 1;
    if (b.distance == null) return -1;
    return a.distance - b.distance;
  });

fs.writeFileSync(outputPath, `${JSON.stringify(output)}\n`);
console.log(`Wrote ${output.length.toLocaleString()} systems and ${output.reduce((sum, system) => sum + system.planets.length, 0).toLocaleString()} planets.`);

function number(value) {
  if (value == null || value === "") return null;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return null;
  return Number(parsed.toPrecision(7));
}

function slug(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    if (quoted) {
      if (character === '"' && text[index + 1] === '"') {
        cell += '"';
        index += 1;
      } else if (character === '"') {
        quoted = false;
      } else {
        cell += character;
      }
    } else if (character === '"') {
      quoted = true;
    } else if (character === ",") {
      row.push(cell);
      cell = "";
    } else if (character === "\n") {
      row.push(cell.replace(/\r$/, ""));
      if (row.some(Boolean)) rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += character;
    }
  }

  if (cell || row.length) {
    row.push(cell);
    rows.push(row);
  }
  return rows;
}
