"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import systemsJson from "../data/systems.generated.json";
import styles from "./NearbyUniverse.module.css";

type Planet = {
  name: string;
  period: number;
  axis: number | null;
  radius: number | null;
  mass: number | null;
  year: number | null;
  method: string;
  temperature: number | null;
};

type System = {
  id: string;
  name: string;
  distance: number | null;
  galacticLongitude: number | null;
  galacticLatitude: number | null;
  starTemp: number | null;
  starRadius: number | null;
  planets: Planet[];
};

type SortKey = "distance" | "planets" | "discovery" | "orbit" | "size" | "method";
type ScaleMode = "log" | "rank";
type MapRange = "local" | "nearby" | "all";

const SYSTEMS = systemsJson as System[];
const PAGE_SIZE = 36;
const METHOD_FILTERS = ["All", "Transit", "Radial Velocity", "Imaging", "Microlensing"];
const TOTAL_PLANETS = SYSTEMS.reduce((sum, system) => sum + system.planets.length, 0);
const NEAREST = SYSTEMS.find((system) => system.name === "Proxima Cen") ?? SYSTEMS[0];
const FEATURED_SYSTEMS = ["Proxima Cen", "TRAPPIST-1", "55 Cnc", "HD 219134", "TOI-700", "GJ 876", "HR 8799", "L 98-59"]
  .map((name) => SYSTEMS.find((system) => system.name === name))
  .filter((system): system is System => Boolean(system));

export function NearbyUniverse() {
  const [sortKey, setSortKey] = useState<SortKey>("distance");
  const [method, setMethod] = useState("All");
  const [query, setQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [selectedId, setSelectedId] = useState(NEAREST.id);
  const [scaleMode, setScaleMode] = useState<ScaleMode>("log");
  const [mapRange, setMapRange] = useState<MapRange>("nearby");

  const filteredSystems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return SYSTEMS
      .filter((system) => !normalizedQuery || system.name.toLowerCase().includes(normalizedQuery) || system.planets.some((planet) => planet.name.toLowerCase().includes(normalizedQuery)))
      .filter((system) => method === "All" || system.planets.some((planet) => planet.method === method))
      .sort((a, b) => compareSystems(a, b, sortKey));
  }, [method, query, sortKey]);

  const selected = SYSTEMS.find((system) => system.id === selectedId) ?? NEAREST;
  const latestYear = Math.max(...SYSTEMS.flatMap((system) => system.planets.map((planet) => planet.year ?? 0)));

  function changeFilter(next: string) {
    setMethod(next);
    setVisibleCount(PAGE_SIZE);
  }

  function selectAnotherSystem() {
    const currentIndex = FEATURED_SYSTEMS.findIndex((system) => system.id === selected.id);
    const next = FEATURED_SYSTEMS[(currentIndex + 1 + FEATURED_SYSTEMS.length) % FEATURED_SYSTEMS.length];
    setSelectedId(next.id);
  }

  function pinSystem(id: string) {
    setSelectedId(id);
    window.requestAnimationFrame(() => document.getElementById("system-explorer")?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }

  return (
    <main className={styles.shell}>
      <header className={styles.hero}>
        <div>
          <p className={styles.kicker}>Confirmed worlds · NASA archive snapshot</p>
          <h1>The Nearby Universe.</h1>
        </div>
        <p className={styles.intro}>
          Other solar systems do not look like ours. Search every confirmed system
          with a published orbital period, then set thousands of alien clocks side by side.
        </p>
      </header>

      <section className={styles.explorer} id="system-explorer">
        <div className={styles.explorerCopy}>
          <div className={styles.explorerTopline}>
            <p className={styles.eyebrow}>Pinned system</p>
            <span>{FEATURED_SYSTEMS.findIndex((system) => system.id === selected.id) + 1 > 0 ? `${FEATURED_SYSTEMS.findIndex((system) => system.id === selected.id) + 1} / ${FEATURED_SYSTEMS.length}` : "Catalog pick"}</span>
          </div>
          <h2>{selected.name}</h2>
          <p>{systemSummary(selected)}</p>
          <button className={styles.anotherButton} onClick={selectAnotherSystem} type="button">
            Show another system <span aria-hidden="true">↻</span>
          </button>
          <dl>
            <div><dt>Distance</dt><dd>{formatDistance(selected.distance)}</dd></div>
            <div><dt>Confirmed so far</dt><dd>{selected.planets.length}</dd></div>
            <div><dt>Star temperature</dt><dd>{selected.starTemp ? `${Math.round(selected.starTemp).toLocaleString()} K` : "Unknown"}</dd></div>
            <div><dt>Longest local year</dt><dd>{formatPeriod(Math.max(...selected.planets.map((planet) => planet.period)))}</dd></div>
          </dl>
          <div className={styles.scaleControl}>
            <span>Orbit spacing</span>
            <button aria-pressed={scaleMode === "log"} onClick={() => setScaleMode("log")} type="button">Log period</button>
            <button aria-pressed={scaleMode === "rank"} onClick={() => setScaleMode("rank")} type="button">Equal steps</button>
          </div>
        </div>
        <div className={styles.systemStage}>
          <SystemGlyph large mode={scaleMode} system={selected} />
          <div className={styles.planetKey}>
            {selected.planets.map((planet) => (
              <div key={planet.name}>
                <i style={{ background: planetColor(planet.radius) }} />
                <span><strong>{shortPlanetName(planet.name, selected.name)}</strong><small>{formatPeriod(planet.period)} · {formatRadius(planet.radius)}</small></span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.factBand} aria-label="Exoplanet catalog facts">
        <div><strong>{SYSTEMS.length.toLocaleString()}</strong><span>planetary systems</span></div>
        <div><strong>{TOTAL_PLANETS.toLocaleString()}</strong><span>confirmed planets shown</span></div>
        <div><strong>{formatDistance(NEAREST.distance)}</strong><span>nearest system in this snapshot</span></div>
        <div><strong>{latestYear}</strong><span>latest discovery year</span></div>
      </section>

      <section className={styles.readingGuide} aria-label="How to read the catalog">
        <article>
          <span>Known is not total</span>
          <h3>One confirmed planet does not mean one lonely planet.</h3>
          <p>It means only one world has cleared the confirmation threshold so far. Detection methods favor particular sizes, periods, and viewing geometries, so additional planets may remain unseen.</p>
          <a href="https://science.nasa.gov/exoplanets/exoplanet-detection-methods/">How astronomers find planets ↗</a>
        </article>
        <article>
          <span>Catalog names have a grammar</span>
          <h3>The strange names are scientific addresses.</h3>
          <p>HD and GJ point to star catalogs; TOI means TESS Object of Interest. A planet inherits its star&apos;s designation, then receives b, c, d, and onward in discovery order.</p>
          <a href="https://science.nasa.gov/exoplanets/how-do-exoplanets-get-their-names/">NASA&apos;s naming guide ↗</a>
        </article>
      </section>

      <section className={styles.mapSection}>
        <div className={styles.mapHeader}>
          <div>
            <p className={styles.eyebrow}>A wildly compressed neighborhood</p>
            <h2>Where in the<br />Milky Way?</h2>
          </div>
          <div>
            <p>
              The Sun sits at center. Angle shows Galactic direction; radius is
              logarithmic distance. Color carries height above or below the Galactic
              plane. Click any system to pull up its orbit diagram.
            </p>
            <div className={styles.mapControls} aria-label="Map distance range">
              <button aria-pressed={mapRange === "local"} onClick={() => setMapRange("local")} type="button">100 light-years</button>
              <button aria-pressed={mapRange === "nearby"} onClick={() => setMapRange("nearby")} type="button">500 light-years</button>
              <button aria-pressed={mapRange === "all"} onClick={() => setMapRange("all")} type="button">All systems</button>
            </div>
          </div>
        </div>
        <GalacticMap onSelect={pinSystem} range={mapRange} selectedId={selected.id} systems={SYSTEMS} />
        <div className={styles.mapLegend}>
          <span><i className={styles.belowPlane} />Below Galactic plane</span>
          <span><i className={styles.onPlane} />Near the plane</span>
          <span><i className={styles.abovePlane} />Above Galactic plane</span>
          <strong>Distance is heavily compressed · not to scale</strong>
        </div>
      </section>

      <section className={styles.catalogIntro}>
        <div>
          <p className={styles.eyebrow}>System atlas</p>
          <h2>One sky.<br />Thousands of architectures.</h2>
        </div>
        <p>
          Orbit rings use a logarithmic period scale so hot, tight worlds and
          century-long giants can coexist. Planet sizes are readable symbols, not
          scaled against their stars.
        </p>
      </section>

      <section className={styles.controls} aria-label="Catalog filters">
        <label className={styles.search}>
          <span>Find a star or planet</span>
          <input onChange={(event) => { setQuery(event.target.value); setVisibleCount(PAGE_SIZE); }} placeholder="Try TRAPPIST-1" type="search" value={query} />
        </label>
        <label>
          <span>Sort systems</span>
          <select onChange={(event) => { setSortKey(event.target.value as SortKey); setVisibleCount(PAGE_SIZE); }} value={sortKey}>
            <option value="distance">Nearest first</option>
            <option value="planets">Most planets</option>
            <option value="discovery">Newest discovery</option>
            <option value="size">Largest planet</option>
            <option value="orbit">Longest orbit</option>
            <option value="method">Detection method</option>
          </select>
        </label>
        <div className={styles.methodFilters}>
          <span>Discovery method</span>
          <div>{METHOD_FILTERS.map((filter) => <button aria-pressed={method === filter} key={filter} onClick={() => changeFilter(filter)} type="button">{filter === "Radial Velocity" ? "Radial velocity" : filter}</button>)}</div>
        </div>
      </section>

      <div className={styles.resultLine}>
        <strong>{filteredSystems.length.toLocaleString()} systems</strong>
        <span>Click any card to pin it above</span>
      </div>

      <section className={styles.systemGrid} aria-label="Exoplanet systems">
        {filteredSystems.slice(0, visibleCount).map((system) => (
          <button className={selected.id === system.id ? styles.activeCard : ""} key={system.id} onClick={() => pinSystem(system.id)} type="button">
            <div><span>{formatDistance(system.distance)}</span><strong>{system.name}</strong><small>{system.planets.length} confirmed so far</small></div>
            <SystemGlyph mode="log" system={system} />
            <footer><span>{earliestDiscovery(system)}</span><span>{dominantMethod(system)}</span></footer>
          </button>
        ))}
      </section>

      {visibleCount < filteredSystems.length && (
        <button className={styles.loadMore} onClick={() => setVisibleCount((count) => count + PAGE_SIZE)} type="button">
          Show {Math.min(PAGE_SIZE, filteredSystems.length - visibleCount)} more systems
        </button>
      )}

      {!filteredSystems.length && <p className={styles.empty}>No system matches those filters.</p>}

      <footer className={styles.dataNote}>
        <strong>Source &amp; method</strong>
        <div>
          <p>
            Snapshot of the NASA Exoplanet Archive composite parameters table, retrieved July 17, 2026. It includes confirmed planets with a published orbital period; discovery-sensitive values will change as the archive is updated.
          </p>
          <a href="https://exoplanetarchive.ipac.caltech.edu/">NASA Exoplanet Archive ↗</a>
        </div>
      </footer>
    </main>
  );
}

function SystemGlyph({ system, large = false, mode }: { system: System; large?: boolean; mode: ScaleMode }) {
  const width = large ? 640 : 220;
  const height = large ? 430 : 128;
  const centerX = width / 2;
  const centerY = height / 2;
  const maxRadius = large ? 178 : 48;
  const minRadius = large ? 27 : 10;
  const ordered = system.planets.slice().sort((a, b) => a.period - b.period);
  const maxPeriod = Math.max(...ordered.map((planet) => planet.period));

  return (
    <svg aria-label={`${system.name} system with ${system.planets.length} planets`} className={large ? styles.largeGlyph : styles.glyph} role="img" viewBox={`0 0 ${width} ${height}`}>
      <defs>
        <radialGradient id={`star-${system.id}`}>
          <stop offset="0" stopColor="#fffbe0" />
          <stop offset=".35" stopColor={starColor(system.starTemp)} />
          <stop offset="1" stopColor="#c85d32" />
        </radialGradient>
      </defs>
      {ordered.map((planet, index) => {
        const orbit = mode === "rank"
          ? minRadius + ((index + 1) / ordered.length) * (maxRadius - minRadius)
          : minRadius + (Math.log1p(planet.period) / Math.log1p(maxPeriod)) * (maxRadius - minRadius);
        const size = large ? clamp(3.2 + Math.sqrt(planet.radius ?? 1) * 1.5, 4, 13) : clamp(1.8 + Math.sqrt(planet.radius ?? 1) * 0.65, 2.2, 6);
        const duration = clamp(5 + Math.log1p(planet.period) * 2.2, 7, 28).toFixed(3);
        const phase = hash(`${system.id}-${planet.name}`) % 360;
        return (
          <g key={planet.name}>
            <circle className={styles.orbit} cx={centerX} cy={centerY} r={orbit} />
            <g className={styles.orbiting} style={{ "--duration": `${duration}s`, "--phase": `${phase}deg`, transformOrigin: `${centerX}px ${centerY}px` } as React.CSSProperties}>
              <circle cx={centerX + orbit} cy={centerY} fill={planetColor(planet.radius)} r={size}>
                <title>{`${planet.name}: ${formatPeriod(planet.period)}`}</title>
              </circle>
            </g>
          </g>
        );
      })}
      <circle className={styles.starGlow} cx={centerX} cy={centerY} r={large ? 19 : 7} />
      <circle cx={centerX} cy={centerY} fill={`url(#star-${system.id})`} r={large ? 10 : 4.2} />
    </svg>
  );
}

type MapHit = { system: System; x: number; y: number; radius: number };

function GalacticMap({ systems, selectedId, range, onSelect }: { systems: System[]; selectedId: string; range: MapRange; onSelect: (id: string) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hitsRef = useRef<MapHit[]>([]);
  const [hovered, setHovered] = useState<MapHit | null>(null);
  const [size, setSize] = useState({ width: 1100, height: 620 });

  const visibleSystems = useMemo(() => {
    const limit = range === "local" ? 100 : range === "nearby" ? 500 : Number.POSITIVE_INFINITY;
    return systems.filter((system) => (
      system.distance != null &&
      system.galacticLongitude != null &&
      system.galacticLatitude != null &&
      system.distance * 3.26156 <= limit
    ));
  }, [range, systems]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const observer = new ResizeObserver(([entry]) => {
      const width = Math.max(300, entry.contentRect.width);
      setSize({ width, height: Math.max(420, Math.min(680, width * 0.57)) });
    });
    observer.observe(canvas);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;
    const density = window.devicePixelRatio || 1;
    canvas.width = Math.round(size.width * density);
    canvas.height = Math.round(size.height * density);
    context.setTransform(density, 0, 0, density, 0, 0);
    drawGalacticMap(context, size.width, size.height, visibleSystems, selectedId, hovered?.system.id ?? null, range, hitsRef);
  }, [hovered?.system.id, range, selectedId, size, visibleSystems]);

  function pointerPosition(event: React.MouseEvent<HTMLCanvasElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  }

  function findHit(x: number, y: number) {
    let nearest: MapHit | null = null;
    let nearestDistance = 12;
    for (const hit of hitsRef.current) {
      const distance = Math.hypot(hit.x - x, hit.y - y);
      if (distance < nearestDistance) {
        nearest = hit;
        nearestDistance = distance;
      }
    }
    return nearest;
  }

  return (
    <div className={styles.mapCanvasWrap}>
      <canvas
        aria-label={`Distorted map of ${visibleSystems.length.toLocaleString()} confirmed exoplanet systems around the Sun. Click a point to open its system.`}
        className={styles.mapCanvas}
        onClick={(event) => {
          const point = pointerPosition(event);
          const hit = findHit(point.x, point.y);
          if (hit) onSelect(hit.system.id);
        }}
        onPointerLeave={() => setHovered(null)}
        onPointerMove={(event) => {
          const point = pointerPosition(event);
          setHovered(findHit(point.x, point.y));
        }}
        ref={canvasRef}
        role="img"
        style={{ height: size.height }}
      />
      <div className={styles.sunMarker}><span>You are here</span><strong>Sun</strong></div>
      {hovered && (
        <div className={styles.mapTooltip} style={{ left: clamp(hovered.x, 80, size.width - 80), top: clamp(hovered.y, 70, size.height - 55) }}>
          <strong>{hovered.system.name}</strong>
          <span>{formatDistance(hovered.system.distance)} · {hovered.system.planets.length} confirmed so far</span>
        </div>
      )}
      <div className={styles.mapCount}>{visibleSystems.length.toLocaleString()} systems in view</div>
    </div>
  );
}

function drawGalacticMap(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  systems: System[],
  selectedId: string,
  hoveredId: string | null,
  range: MapRange,
  hitsRef: React.MutableRefObject<MapHit[]>
) {
  context.clearRect(0, 0, width, height);
  const center = { x: width / 2, y: height / 2 };
  const maxRadius = Math.min(width * 0.43, height * 0.43);
  const maximumDistance = range === "local" ? 100 : range === "nearby" ? 500 : Math.max(1000, ...systems.map((system) => (system.distance ?? 0) * 3.26156));
  const rings = range === "local" ? [10, 25, 50, 100] : range === "nearby" ? [10, 50, 100, 250, 500] : [10, 100, 1000, 10000];

  context.save();
  context.strokeStyle = "rgba(116, 169, 158, .09)";
  context.lineWidth = 1;
  for (let arm = 0; arm < 4; arm += 1) {
    context.beginPath();
    for (let step = 0; step <= 160; step += 1) {
      const progress = step / 160;
      const angle = arm * Math.PI / 2 + progress * Math.PI * 2.1;
      const radius = 18 + progress * maxRadius;
      const x = center.x + Math.cos(angle) * radius;
      const y = center.y + Math.sin(angle) * radius;
      if (step === 0) context.moveTo(x, y); else context.lineTo(x, y);
    }
    context.stroke();
  }

  context.setLineDash([2, 5]);
  context.font = "700 10px Inter, sans-serif";
  context.textAlign = "left";
  for (const ring of rings.filter((value) => value <= maximumDistance)) {
    const radius = mapDistance(ring, maximumDistance, maxRadius);
    context.beginPath();
    context.arc(center.x, center.y, radius, 0, Math.PI * 2);
    context.strokeStyle = "rgba(154, 190, 180, .16)";
    context.stroke();
    context.fillStyle = "rgba(120, 151, 142, .62)";
    context.fillText(`${ring.toLocaleString()} ly`, center.x + 7, center.y - radius + 13);
  }
  context.restore();

  const hits = systems.map((system) => {
    const distance = (system.distance ?? 0) * 3.26156;
    const latitude = (system.galacticLatitude ?? 0) * Math.PI / 180;
    const longitude = ((system.galacticLongitude ?? 0) - 90) * Math.PI / 180;
    const planeDistance = Math.max(0.001, distance * Math.cos(latitude));
    const radius = mapDistance(planeDistance, maximumDistance, maxRadius);
    return {
      system,
      x: center.x + Math.cos(longitude) * radius,
      y: center.y + Math.sin(longitude) * radius,
      radius: clamp(1.2 + Math.sqrt(system.planets.length) * 0.8, 2, 5.5)
    };
  }).sort((a, b) => (b.system.distance ?? 0) - (a.system.distance ?? 0));
  hitsRef.current = hits;

  for (const hit of hits) {
    const latitude = hit.system.galacticLatitude ?? 0;
    const isSelected = hit.system.id === selectedId;
    const isHovered = hit.system.id === hoveredId;
    context.beginPath();
    context.arc(hit.x, hit.y, isSelected || isHovered ? hit.radius + 2 : hit.radius, 0, Math.PI * 2);
    context.fillStyle = galacticHeightColor(latitude, isSelected || isHovered ? 1 : range === "all" ? 0.5 : 0.72);
    context.fill();
    if (isSelected || isHovered) {
      context.beginPath();
      context.arc(hit.x, hit.y, hit.radius + 6, 0, Math.PI * 2);
      context.strokeStyle = isSelected ? "rgba(255, 215, 126, .95)" : "rgba(227, 241, 235, .72)";
      context.lineWidth = 1.5;
      context.stroke();
    }
  }

  context.beginPath();
  context.arc(center.x, center.y, 5, 0, Math.PI * 2);
  context.fillStyle = "#f2bd58";
  context.shadowColor = "rgba(242, 189, 88, .9)";
  context.shadowBlur = 14;
  context.fill();
  context.shadowBlur = 0;
}

function mapDistance(distance: number, maximum: number, radius: number) {
  return (Math.log1p(distance) / Math.log1p(maximum)) * radius;
}

function galacticHeightColor(latitude: number, opacity: number) {
  if (latitude > 12) return `rgba(237, 186, 92, ${opacity})`;
  if (latitude < -12) return `rgba(129, 132, 207, ${opacity})`;
  return `rgba(91, 177, 163, ${opacity})`;
}

function compareSystems(a: System, b: System, key: SortKey) {
  if (key === "planets") return b.planets.length - a.planets.length || compareNullable(a.distance, b.distance);
  if (key === "discovery") return latestDiscovery(b) - latestDiscovery(a) || compareNullable(a.distance, b.distance);
  if (key === "size") return maxPlanetRadius(b) - maxPlanetRadius(a);
  if (key === "orbit") return maxOrbit(b) - maxOrbit(a);
  if (key === "method") return dominantMethod(a).localeCompare(dominantMethod(b)) || compareNullable(a.distance, b.distance);
  return compareNullable(a.distance, b.distance);
}

function compareNullable(a: number | null, b: number | null) {
  if (a == null) return 1;
  if (b == null) return -1;
  return a - b;
}

function maxOrbit(system: System) { return Math.max(...system.planets.map((planet) => planet.period)); }
function maxPlanetRadius(system: System) { return Math.max(...system.planets.map((planet) => planet.radius ?? 0)); }
function latestDiscovery(system: System) { return Math.max(...system.planets.map((planet) => planet.year ?? 0)); }
function earliestDiscovery(system: System) { const years = system.planets.map((planet) => planet.year).filter((year): year is number => year != null); return years.length ? `Discovered ${Math.min(...years)}` : "Discovery year unknown"; }
function dominantMethod(system: System) { const counts = new Map<string, number>(); system.planets.forEach((planet) => counts.set(planet.method, (counts.get(planet.method) ?? 0) + 1)); return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "Other"; }
function formatDistance(parsecs: number | null) { return parsecs == null ? "Distance unknown" : `${(parsecs * 3.26156).toFixed(parsecs < 10 ? 1 : 0)} ly`; }
function formatPeriod(days: number) { if (days < 2) return `${(days * 24).toFixed(1)} hours`; if (days < 730) return `${days < 100 ? days.toFixed(1) : Math.round(days).toLocaleString()} days`; return `${(days / 365.256).toFixed(1)} years`; }
function formatRadius(radius: number | null) { return radius == null ? "size unknown" : `${radius.toFixed(radius < 10 ? 1 : 0)}× Earth radius`; }
function shortPlanetName(name: string, host: string) { return name.startsWith(host) ? name.slice(host.length).trim() || name : name; }
function planetColor(radius: number | null) { if (radius == null) return "#a8b6c4"; if (radius < 1.5) return "#d98956"; if (radius < 3.8) return "#58a5aa"; if (radius < 8) return "#6c7ac2"; return "#d8b36b"; }
function starColor(temp: number | null) { if (!temp) return "#ffd385"; if (temp < 3800) return "#ff8a57"; if (temp < 5200) return "#ffc878"; if (temp < 6500) return "#fff3ba"; return "#b9d9ff"; }
function systemSummary(system: System) { const methods = [...new Set(system.planets.map((planet) => planet.method))]; return `${system.planets.length} ${system.planets.length === 1 ? "world has" : "worlds have"} been confirmed here so far—not necessarily the system's total—using ${methods.slice(0, 2).join(" and ").toLowerCase()}.`; }
function hash(value: string) { return [...value].reduce((total, character) => ((total << 5) - total + character.charCodeAt(0)) | 0, 0) >>> 0; }
function clamp(value: number, min: number, max: number) { return Math.max(min, Math.min(max, value)); }
