"use client";

import { useMemo, useRef, useState, type PointerEvent as ReactPointerEvent, type WheelEvent } from "react";
import basinJson from "../data/basins.generated.json";
import { BASIN_COLORS, DESTINATIONS, type Basin, type Destination } from "../data/riverData";
import styles from "./WhereRiversGo.module.css";

type ViewMode = "destination" | "basins" | "hierarchy" | "endorheic";

const BASINS = basinJson as Basin[];
const MODES: { id: ViewMode; label: string }[] = [
  { id: "destination", label: "Ocean destination" },
  { id: "basins", label: "Major basins" },
  { id: "hierarchy", label: "Basin scale" },
  { id: "endorheic", label: "Endorheic only" }
];

export function WhereRiversGo() {
  const initial = BASINS.find((basin) => basin.name === "Caspian basin") ?? BASINS[0];
  const [mode, setMode] = useState<ViewMode>("destination");
  const [selectedId, setSelectedId] = useState(initial.id);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [camera, setCamera] = useState({ x: 600, y: 310, zoom: 1 });
  const dragRef = useRef<{ pointerId: number; x: number; y: number; camera: typeof camera } | null>(null);
  const suppressClickRef = useRef(false);
  const selected = BASINS.find((basin) => basin.id === selectedId) ?? initial;
  const active = BASINS.find((basin) => basin.id === hoveredId) ?? selected;
  const visibleBasins = useMemo(() => mode === "endorheic" ? BASINS.filter((basin) => basin.endorheic) : BASINS, [mode]);
  const viewBox = buildViewBox(camera);

  return (
    <main className={styles.shell}>
      <header className={styles.hero}>
        <div>
          <p className={styles.kicker}>A world shaped by gravity</p>
          <h1>Where Rivers Go</h1>
          <p className={styles.deck}>Every raindrop chooses a direction. Follow 292 real drainage regions across invisible divides—from headwaters to ocean, inland sea, or desert sink.</p>
        </div>
        <div className={styles.heroFact}><strong>One watershed, one exit</strong><span>Actual HydroBASINS boundaries reveal a second map beneath the political one.</span></div>
      </header>

      <section className={styles.modeBar} aria-label="Map view">
        {MODES.map((item) => <button aria-pressed={mode === item.id} className={mode === item.id ? styles.activeMode : ""} key={item.id} onClick={() => setMode(item.id)} type="button">{item.label}</button>)}
      </section>

      <section className={styles.workspace}>
        <div className={styles.mapCard}>
          <div className={styles.mapHeader}>
            <div><span className={styles.eyebrow}>HydroBASINS · level 3</span><h2>{modeTitle(mode)}</h2></div>
            <div className={styles.zoomControls} aria-label="Map zoom">
              <button aria-label="Zoom out" disabled={camera.zoom <= 1} onClick={() => zoomFromCenter(-.45)} type="button">−</button>
              <span>{Math.round(camera.zoom * 100)}%</span>
              <button aria-label="Zoom in" disabled={camera.zoom >= 5} onClick={() => zoomFromCenter(.45)} type="button">+</button>
              <button className={styles.resetButton} disabled={camera.zoom === 1 && camera.x === 600 && camera.y === 310} onClick={() => setCamera({ x: 600, y: 310, zoom: 1 })} type="button">Reset</button>
            </div>
          </div>

          <div
            className={styles.mapFrame}
            onPointerDown={startPan}
            onPointerMove={movePan}
            onPointerUp={endPan}
            onPointerCancel={endPan}
            onWheel={wheelZoom}
          >
            <svg className={styles.map} role="img" viewBox={viewBox}>
              <title>Global HydroBASINS level-three drainage basins in an Equal Earth projection</title>
              <desc>Hover any basin for its destination and area. Select named major basins to trace their river.</desc>
              <rect className={styles.ocean} width="1200" height="620" />
              <g className={styles.graticule} aria-hidden="true">
                <path d="M52 180 Q600 112 1148 180 M25 310 Q600 310 1175 310 M52 440 Q600 508 1148 440" />
                <path d="M302 45 Q375 310 302 575 M600 30 L600 590 M898 45 Q825 310 898 575" />
              </g>
              <g className={styles.basins}>
                {visibleBasins.map((basin, index) => (
                  <path
                    aria-label={`${displayName(basin)}; ${formatArea(basin.area)}; drains to ${basin.destination}`}
                    className={`${styles.basin} ${basin.id === selectedId ? styles.selectedBasin : ""}`}
                    d={basin.path}
                    fill={basinFill(basin, mode, index)}
                    fillRule="evenodd"
                    key={basin.id}
                    onClick={() => {
                      if (suppressClickRef.current) {
                        suppressClickRef.current = false;
                        return;
                      }
                      setSelectedId(basin.id);
                    }}
                    onFocus={() => setHoveredId(basin.id)}
                    onMouseEnter={() => setHoveredId(basin.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    tabIndex={0}
                  />
                ))}
              </g>
              <g className={styles.labels}>
                {BASINS.filter((basin) => basin.name && basin.area >= (camera.zoom > 1.25 ? 700_000 : 2_300_000)).map((basin) => <text key={basin.id} x={basin.label[0]} y={basin.label[1]}>{basin.name}</text>)}
              </g>
            </svg>
            <div className={styles.hoverCard}>
              <span style={{ background: DESTINATIONS[active.destination].color }} />
              <div><strong>{displayName(active)}</strong><small>{formatArea(active.area)} · {active.destination === "Endorheic" ? "ends inland" : `to the ${active.destination}`}</small></div>
            </div>
          </div>

          <div className={styles.legend}>
            {(Object.entries(DESTINATIONS) as [Destination, { color: string; description: string }][]).map(([name, item]) => <button className={active.destination === name ? styles.activeLegend : ""} key={name} onClick={() => { const first = BASINS.find((basin) => basin.destination === name); if (first) setSelectedId(first.id); }} title={item.description} type="button"><i style={{ background: item.color }} />{name}</button>)}
          </div>
        </div>

        <aside className={styles.detailCard}>
          <div className={styles.destinationFlag} style={{ background: DESTINATIONS[selected.destination].color }}><span>Final destination</span><strong>{selected.endorheic ? "Nowhere at sea" : `${selected.destination} system`}</strong></div>
          <p className={styles.eyebrow}>Basin profile · {selected.id}</p>
          <h2>{displayName(selected)}</h2>
          <p className={styles.route}>{selected.river ? `${selected.river} runs through this watershed toward ${selected.outletName}.` : routeDescription(selected)}</p>
          <dl className={styles.facts}>
            <div><dt>Basin area</dt><dd>{formatArea(selected.area)}</dd></div>
            <div><dt>Major river</dt><dd>{selected.river ?? "Multiple regional rivers"}</dd></div>
            <div><dt>Outlet</dt><dd>{selected.outletName ?? formatOutlet(selected)}</dd></div>
          </dl>
          <div className={styles.pathDiagram}><span>Headwaters</span><i /><span>{selected.river ?? "River network"}</span><i /><span>{selected.endorheic ? "Inland sink" : selected.destination}</span></div>
          <p className={styles.instruction}>Scroll or use the controls to zoom. Drag the map to pan, then select any basin polygon to pin its profile.</p>
        </aside>
      </section>

      <section className={styles.storyStrip}>
        <article><span>01</span><h3>Divides are invisible</h3><p>Actual catchment edges expose boundaries no political map can show.</p></article>
        <article><span>02</span><h3>Coasts fragment quickly</h3><p>Wet mountain margins break into many compact, ocean-bound basins.</p></article>
        <article><span>03</span><h3>Some water stays inland</h3><p>Toggle the endorheic view to isolate lakes, salt flats, and desert sinks.</p></article>
      </section>

      <footer className={styles.sourceNote}>
        <strong>Real geometry, overview scale</strong>
        <p>Boundaries and attributes are official HydroBASINS level-3 data, simplified and projected to Equal Earth for this browser view. Destination classes are derived from HydroBASINS endorheic flags and level-3 pour-point locations.</p>
        <div><a href="https://www.hydrosheds.org/products/hydrobasins">HydroBASINS</a><a href="https://www.hydrosheds.org/products/hydrorivers">HydroRIVERS</a><a href="https://www.naturalearthdata.com/">Natural Earth</a></div>
      </footer>
    </main>
  );

  function zoomFromCenter(delta: number) {
    setCamera((current) => constrainCamera({ ...current, zoom: clamp(current.zoom + delta, 1, 5) }));
  }

  function wheelZoom(event: WheelEvent<HTMLDivElement>) {
    event.preventDefault();
    const rect = event.currentTarget.getBoundingClientRect();
    const px = clamp((event.clientX - rect.left) / rect.width, 0, 1);
    const py = clamp((event.clientY - rect.top) / rect.height, 0, 1);
    setCamera((current) => {
      const width = 1200 / current.zoom;
      const height = 620 / current.zoom;
      const mapX = current.x - width / 2 + px * width;
      const mapY = current.y - height / 2 + py * height;
      const zoom = clamp(current.zoom * Math.exp(-event.deltaY * .0015), 1, 5);
      const nextWidth = 1200 / zoom;
      const nextHeight = 620 / zoom;
      return constrainCamera({ x: mapX - (px - .5) * nextWidth, y: mapY - (py - .5) * nextHeight, zoom });
    });
  }

  function startPan(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.button !== 0) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    suppressClickRef.current = false;
    dragRef.current = { pointerId: event.pointerId, x: event.clientX, y: event.clientY, camera };
  }

  function movePan(event: ReactPointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const rect = event.currentTarget.getBoundingClientRect();
    if (Math.hypot(event.clientX - drag.x, event.clientY - drag.y) > 4) suppressClickRef.current = true;
    const dx = (event.clientX - drag.x) / rect.width * (1200 / drag.camera.zoom);
    const dy = (event.clientY - drag.y) / rect.height * (620 / drag.camera.zoom);
    setCamera(constrainCamera({ ...drag.camera, x: drag.camera.x - dx, y: drag.camera.y - dy }));
  }

  function endPan(event: ReactPointerEvent<HTMLDivElement>) {
    if (dragRef.current?.pointerId === event.pointerId) dragRef.current = null;
  }
}

function basinFill(basin: Basin, mode: ViewMode, index: number) {
  if (mode === "basins") return BASIN_COLORS[(Number(basin.id.slice(-4)) + index) % BASIN_COLORS.length];
  if (mode === "hierarchy") {
    if (basin.area > 2_000_000) return "#214f55";
    if (basin.area > 700_000) return "#47777a";
    if (basin.area > 200_000) return "#79a1a0";
    return "#b5cdca";
  }
  return DESTINATIONS[basin.destination].color;
}

function buildViewBox(camera: { x: number; y: number; zoom: number }) {
  const width = 1200 / camera.zoom, height = 620 / camera.zoom;
  return `${camera.x - width / 2} ${camera.y - height / 2} ${width} ${height}`;
}

function constrainCamera(camera: { x: number; y: number; zoom: number }) {
  const width = 1200 / camera.zoom, height = 620 / camera.zoom;
  return { ...camera, x: clamp(camera.x, width / 2, 1200 - width / 2), y: clamp(camera.y, height / 2, 620 - height / 2) };
}

function displayName(basin: Basin) { return basin.name ?? `${basin.destination} drainage region`; }
function formatArea(area: number) { return area >= 1_000_000 ? `${(area / 1_000_000).toFixed(1)}m km²` : `${Math.round(area / 1000)}k km²`; }
function formatOutlet(basin: Basin) { const [lon, lat] = basin.outlet; return `${Math.abs(lat).toFixed(1)}°${lat >= 0 ? "N" : "S"}, ${Math.abs(lon).toFixed(1)}°${lon >= 0 ? "E" : "W"}`; }
function routeDescription(basin: Basin) { return basin.endorheic ? "Water collects in an inland terminal system without reaching the sea." : `Regional rivers cross this watershed and discharge to the ${basin.destination}.`; }
function clamp(value: number, min: number, max: number) { return Math.max(min, Math.min(max, value)); }

function modeTitle(mode: ViewMode) {
  if (mode === "basins") return "The world by watershed";
  if (mode === "hierarchy") return "Basin scale, from small to continental";
  if (mode === "endorheic") return "The water that stays inland";
  return "Every basin, its final destination";
}
