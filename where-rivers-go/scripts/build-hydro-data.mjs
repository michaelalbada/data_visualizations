import fs from "node:fs/promises";
import path from "node:path";
import shapefile from "/private/tmp/hydro-tools/node_modules/shapefile/dist/shapefile.node.js";

const input = process.argv[2] ?? "/private/tmp/hydro-tools/extracted";
const pourDir = process.argv[3] ?? "/private/tmp/hydro-tools/pour";
const output = process.argv[4] ?? "./data/basins.generated.json";
const regions = ["af", "ar", "as", "au", "eu", "gr", "na", "sa", "si"];

const named = [
  { point: [-60, -4], name: "Amazon", river: "Amazon", outlet: "Atlantic coast near Marajó Island", route: [[-74,-4],[-68,-5],[-61,-4],[-54,-2],[-49,0]] },
  { point: [-58, -25], name: "Paraná–La Plata", river: "Paraná", outlet: "Río de la Plata estuary", route: [[-52,-16],[-55,-23],[-58,-28],[-58,-34]] },
  { point: [-90, 35], name: "Mississippi", river: "Mississippi", outlet: "Gulf of Mexico, Louisiana", route: [[-95,47],[-92,40],[-90,35],[-91,29]] },
  { point: [-120, 60], name: "Mackenzie", river: "Mackenzie", outlet: "Beaufort Sea delta", route: [[-115,56],[-118,61],[-126,68]] },
  { point: [-117, 40], name: "Great Basin", river: "Humboldt", outlet: "Inland lakes and desert sinks", route: [[-119,41],[-117,40],[-118,39]] },
  { point: [22, -3], name: "Congo", river: "Congo", outlet: "Atlantic coast at Muanda", route: [[26,-4],[21,-1],[16,-4],[12,-6]] },
  { point: [31, 20], name: "Nile", river: "Nile", outlet: "Nile Delta, Mediterranean Sea", route: [[31,-1],[32,10],[31,20],[31,30]] },
  { point: [20, 47], name: "Danube", river: "Danube", outlet: "Black Sea delta", route: [[9,48],[18,46],[24,45],[29,45]] },
  { point: [45, 55], name: "Caspian basin", river: "Volga", outlet: "Caspian Sea", route: [[43,57],[47,52],[48,46]] },
  { point: [63, 44], name: "Aral basin", river: "Amu Darya", outlet: "Aral Sea depression", route: [[72,38],[67,41],[60,45]] },
  { point: [75, 55], name: "Ob–Irtysh", river: "Ob", outlet: "Gulf of Ob, Kara Sea", route: [[82,50],[75,58],[72,67]] },
  { point: [90, 60], name: "Yenisei", river: "Yenisei", outlet: "Yenisei Gulf, Kara Sea", route: [[94,50],[90,59],[84,70]] },
  { point: [120, 60], name: "Lena", river: "Lena", outlet: "Laptev Sea delta", route: [[108,53],[120,61],[126,72]] },
  { point: [88, 24], name: "Ganges–Brahmaputra", river: "Ganges", outlet: "Sundarbans, Bay of Bengal", route: [[79,30],[84,26],[89,22]] },
  { point: [110, 30], name: "Yangtze", river: "Yangtze", outlet: "East China Sea near Shanghai", route: [[91,33],[105,30],[121,31]] },
  { point: [104, 15], name: "Mekong", river: "Mekong", outlet: "South China Sea delta", route: [[97,31],[102,22],[106,10]] },
  { point: [145, -35], name: "Murray–Darling", river: "Murray", outlet: "Southern coast of Australia", route: [[148,-30],[143,-34],[139,-35]] }
];

const pourSums = new Map();
const pourSource = await shapefile.open(path.join(pourDir, "hybas_pour_lev03_v1.shp"), path.join(pourDir, "hybas_pour_lev03_v1.dbf"));
while (true) {
  const row = await pourSource.read();
  if (row.done) break;
  const id = String(row.value.properties.HYBAS_ID);
  const [lon, lat] = row.value.geometry.coordinates;
  const current = pourSums.get(id) ?? { sin: 0, cos: 0, lat: 0, count: 0 };
  current.sin += Math.sin(lon * Math.PI / 180);
  current.cos += Math.cos(lon * Math.PI / 180);
  current.lat += lat;
  current.count += 1;
  pourSums.set(id, current);
}

const features = [];
for (const region of regions) {
  const base = path.join(input, `hybas_${region}_lev03_v1c`);
  const source = await shapefile.open(`${base}.shp`, `${base}.dbf`);
  while (true) {
    const row = await source.read();
    if (row.done) break;
    const props = row.value.properties;
    const id = String(props.HYBAS_ID);
    const pour = pourSums.get(id);
    const outlet = pour ? [Math.atan2(pour.sin, pour.cos) * 180 / Math.PI, pour.lat / pour.count] : geometryCenter(row.value.geometry);
    const match = named.find((item) => geometryContains(row.value.geometry, item.point));
    const center = geometryCenter(row.value.geometry);
    features.push({
      id,
      name: match?.name ?? null,
      river: match?.river ?? null,
      outletName: match?.outlet ?? null,
      destination: props.ENDO || ["Caspian basin", "Aral basin", "Great Basin"].includes(match?.name) ? "Endorheic" : classifyOutlet(outlet),
      area: Math.round(props.SUB_AREA),
      endorheic: Boolean(props.ENDO) || ["Caspian basin", "Aral basin", "Great Basin"].includes(match?.name),
      outlet: outlet.map((value) => Math.round(value * 100) / 100),
      label: project(center),
      path: geometryPath(row.value.geometry),
      riverPath: match ? linePath(match.route) : null
    });
  }
}

features.sort((a, b) => b.area - a.area);
await fs.writeFile(output, JSON.stringify(features));
console.log(`Wrote ${features.length} basins to ${output} (${Math.round((await fs.stat(output)).size / 1024)} KB)`);

function classifyOutlet([lon, lat]) {
  if (lat >= 66 || (lat >= 58 && lon > 30 && lon < 180)) return "Arctic";
  if (lat >= 29 && lat <= 48 && lon >= -7 && lon <= 43) return "Mediterranean";
  if (lat < -45) return "Southern";
  if (lon >= 100) {
    if (lat < -10 && lon < 145) return "Indian";
    return "Pacific";
  }
  if (lon >= 30 && lon < 100 && lat < 32) return "Indian";
  if (lon <= -100 && lat > 5) return "Pacific";
  if (lon <= -70 && lat <= 5) return "Pacific";
  return "Atlantic";
}

function project([lon, lat]) {
  const A1 = 1.340264, A2 = -0.081106, A3 = 0.000893, A4 = 0.003796;
  const M = Math.sqrt(3) / 2;
  const lambda = lon * Math.PI / 180;
  const phi = Math.max(-89.999, Math.min(89.999, lat)) * Math.PI / 180;
  const theta = Math.asin(M * Math.sin(phi));
  const theta2 = theta * theta;
  const theta6 = theta2 * theta2 * theta2;
  const x = lambda * Math.cos(theta) / (M * (A1 + 3 * A2 * theta2 + theta6 * (7 * A3 + 9 * A4 * theta2)));
  const y = theta * (A1 + A2 * theta2 + theta6 * (A3 + A4 * theta2));
  return [round(600 + x / 2.71 * 560), round(310 - y / 1.32 * 270)];
}

function geometryPath(geometry) {
  const polygons = geometry.type === "Polygon" ? [geometry.coordinates] : geometry.coordinates;
  return polygons.map((polygon) => polygon.map((ring) => ringPath(simplifyRing(ring, 0.12))).join(" ")).join(" ");
}

function ringPath(ring) {
  return ring.map((point, index) => `${index ? "L" : "M"}${project(point).join(",")}`).join("") + "Z";
}

function linePath(points) {
  return points.map((point, index) => `${index ? "L" : "M"}${project(point).join(",")}`).join("");
}

function simplifyRing(points, tolerance) {
  if (points.length <= 5) return points;
  const simplified = simplify(points.slice(0, -1), tolerance * tolerance);
  return [...simplified, simplified[0]];
}

function simplify(points, sqTolerance) {
  if (points.length <= 2) return points;
  const first = points[0], last = points[points.length - 1];
  let maxSqDist = sqTolerance, index = 0;
  for (let i = 1; i < points.length - 1; i++) {
    const sqDist = segmentDistance(points[i], first, last);
    if (sqDist > maxSqDist) { index = i; maxSqDist = sqDist; }
  }
  if (!index) return [first, last];
  return [...simplify(points.slice(0, index + 1), sqTolerance).slice(0, -1), ...simplify(points.slice(index), sqTolerance)];
}

function segmentDistance(point, start, end) {
  let x = start[0], y = start[1], dx = end[0] - x, dy = end[1] - y;
  if (dx || dy) {
    const t = ((point[0] - x) * dx + (point[1] - y) * dy) / (dx * dx + dy * dy);
    if (t > 1) { x = end[0]; y = end[1]; }
    else if (t > 0) { x += dx * t; y += dy * t; }
  }
  dx = point[0] - x; dy = point[1] - y;
  return dx * dx + dy * dy;
}

function geometryCenter(geometry) {
  const polygons = geometry.type === "Polygon" ? [geometry.coordinates] : geometry.coordinates;
  const ring = polygons.reduce((largest, polygon) => polygon[0].length > largest.length ? polygon[0] : largest, []);
  let x = 0, y = 0;
  for (const point of ring) { x += point[0]; y += point[1]; }
  return [x / ring.length, y / ring.length];
}

function geometryContains(geometry, point) {
  const polygons = geometry.type === "Polygon" ? [geometry.coordinates] : geometry.coordinates;
  return polygons.some((polygon) => pointInRing(point, polygon[0]) && !polygon.slice(1).some((hole) => pointInRing(point, hole)));
}

function pointInRing([x, y], ring) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i], [xj, yj] = ring[j];
    if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

function round(value) { return Math.round(value * 10) / 10; }
