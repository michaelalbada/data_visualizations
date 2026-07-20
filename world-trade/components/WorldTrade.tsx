"use client";

import { useEffect, useMemo, useState } from "react";
import rawData from "../data/trade.generated.json";
import styles from "./WorldTrade.module.css";

type Entity = { id: string; label: string };
type ExportFlow = { exporter: string; commodity: string; value: number };
type ImportFlow = { commodity: string; importer: string; value: number };
type YearData = { year: number; total: number; exporterCommodity: ExportFlow[]; commodityImporter: ImportFlow[] };
type Focus = { kind: "exporter" | "commodity" | "importer" | "left-link" | "right-link"; exporter?: string; commodity?: string; importer?: string };
type Node = Entity & { value: number; x: number; y: number; height: number; layer: "exporter" | "commodity" | "importer" };
type Ribbon = { id: string; value: number; commodity: string; exporter?: string; importer?: string; path: string; side: "left" | "right" };

const DATA = rawData as { exporters: Entity[]; commodities: Entity[]; importers: Entity[]; years: YearData[] };
const WIDTH = 1380;
const HEIGHT = 760;
const NODE_WIDTH = 14;
const X = { exporter: 205, commodity: 674, importer: 1114 };
const COLORS: Record<string, string> = {
  food: "#e99f52",
  energy: "#ce6a4b",
  chemicals: "#a984b4",
  plastics: "#d68b9a",
  textiles: "#e8c15d",
  "wood-paper": "#9e9c6d",
  metals: "#7b99aa",
  machinery: "#49a8a1",
  transport: "#5f83bd",
  other: "#8e7f70"
};
const YEARS = DATA.years.map((item) => item.year);

export function WorldTrade() {
  const [yearIndex, setYearIndex] = useState(YEARS.length - 1);
  const [commodityFilter, setCommodityFilter] = useState<string | null>(null);
  const [selected, setSelected] = useState<Focus>({ kind: "commodity", commodity: "machinery" });
  const [hovered, setHovered] = useState<Focus | null>(null);
  const [playing, setPlaying] = useState(false);
  const yearData = DATA.years[yearIndex];
  const layout = useMemo(() => buildLayout(yearData, commodityFilter), [yearData, commodityFilter]);
  const focus = hovered ?? selected;
  const detail = describeFocus(focus, yearData, commodityFilter);

  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => {
      setYearIndex((current) => {
        if (current >= YEARS.length - 1) {
          setPlaying(false);
          return YEARS.length - 1;
        }
        return current + 1;
      });
    }, 1350);
    return () => window.clearInterval(timer);
  }, [playing]);

  function togglePlayback() {
    if (!playing && yearIndex === YEARS.length - 1) setYearIndex(0);
    setPlaying((current) => !current);
  }

  function filterCommodity(id: string | null) {
    setCommodityFilter(id);
    if (id) setSelected({ kind: "commodity", commodity: id });
  }

  return (
    <main className={styles.shell}>
      <header className={styles.hero}>
        <div>
          <p className={styles.kicker}>2000–2023 · merchandise in motion</p>
          <h1>World Trade is a river.</h1>
        </div>
        <p className={styles.intro}>
          Goods leave one economy, take on a name—machine, medicine, meal,
          mineral—and arrive somewhere else. Follow the largest exporters through
          the things they sell to the markets that receive them.
        </p>
      </header>

      <section className={styles.chartCard}>
        <div className={styles.chartIntro}>
          <div><p className={styles.eyebrow}>Read left to right</p><h2>Origin. Object. Arrival.</h2></div>
          <p>
            Ribbon width is the reported export value in current US dollars.
            Commodity color survives both crossings. Select a family to drain away
            everything else, or hover a ribbon to inspect one side of the exchange.
          </p>
        </div>
        <div className={styles.filters} aria-label="Commodity filters">
          <button aria-pressed={!commodityFilter} onClick={() => filterCommodity(null)} type="button">All goods</button>
          {DATA.commodities.map((commodity) => (
            <button aria-pressed={commodityFilter === commodity.id} key={commodity.id} onClick={() => filterCommodity(commodity.id)} type="button">
              <i style={{ background: COLORS[commodity.id] }} />{commodity.label}
            </button>
          ))}
        </div>
        <div className={styles.columnHeads}><span>Exporters</span><i /><span>What crosses borders</span><i /><span>Destinations</span><strong>{yearData.year}</strong></div>
        <div className={styles.chartScroll}>
          <svg aria-label={`River of represented world merchandise exports in ${yearData.year}`} className={styles.chart} role="img" viewBox={`0 0 ${WIDTH} ${HEIGHT}`}>
            <text className={styles.watermark} x={WIDTH / 2} y={HEIGHT / 2 + 30}>{formatMoney(layout.total)}</text>
            {layout.leftRibbons.map((ribbon) => (
              <path
                aria-label={`${exporterLabel(ribbon.exporter!)} exports of ${commodityLabel(ribbon.commodity)}: ${formatMoney(ribbon.value)}`}
                className={`${styles.ribbon} ${!matchesFocus(focus, ribbon) ? styles.dimmed : ""}`}
                d={ribbon.path}
                fill={COLORS[ribbon.commodity]}
                key={ribbon.id}
                onBlur={() => setHovered(null)}
                onClick={() => setSelected({ kind: "left-link", exporter: ribbon.exporter, commodity: ribbon.commodity })}
                onFocus={() => setHovered({ kind: "left-link", exporter: ribbon.exporter, commodity: ribbon.commodity })}
                onMouseEnter={() => setHovered({ kind: "left-link", exporter: ribbon.exporter, commodity: ribbon.commodity })}
                onMouseLeave={() => setHovered(null)}
                tabIndex={0}
              />
            ))}
            {layout.rightRibbons.map((ribbon) => (
              <path
                aria-label={`${commodityLabel(ribbon.commodity)} exports arriving in ${importerLabel(ribbon.importer!)}: ${formatMoney(ribbon.value)}`}
                className={`${styles.ribbon} ${!matchesFocus(focus, ribbon) ? styles.dimmed : ""}`}
                d={ribbon.path}
                fill={COLORS[ribbon.commodity]}
                key={ribbon.id}
                onBlur={() => setHovered(null)}
                onClick={() => setSelected({ kind: "right-link", commodity: ribbon.commodity, importer: ribbon.importer })}
                onFocus={() => setHovered({ kind: "right-link", commodity: ribbon.commodity, importer: ribbon.importer })}
                onMouseEnter={() => setHovered({ kind: "right-link", commodity: ribbon.commodity, importer: ribbon.importer })}
                onMouseLeave={() => setHovered(null)}
                tabIndex={0}
              />
            ))}
            {layout.exporters.map((node) => <TradeNode color="#d8dfd7" focus={{ kind: "exporter", exporter: node.id }} key={`e-${node.id}`} node={node} onHover={setHovered} onSelect={setSelected} />)}
            {layout.commodities.map((node) => <TradeNode color={COLORS[node.id]} focus={{ kind: "commodity", commodity: node.id }} key={`c-${node.id}`} node={node} onHover={setHovered} onSelect={setSelected} />)}
            {layout.importers.map((node) => <TradeNode color="#d8dfd7" focus={{ kind: "importer", importer: node.id }} key={`i-${node.id}`} node={node} onHover={setHovered} onSelect={setSelected} />)}
          </svg>
        </div>
        <div className={styles.transport}>
          <button className={styles.playButton} onClick={togglePlayback} type="button"><span aria-hidden="true">{playing ? "Ⅱ" : "▶"}</span>{playing ? "Pause" : yearIndex === YEARS.length - 1 ? "Replay the river" : "Play"}</button>
          <label>
            <span className={styles.srOnly}>Benchmark year</span>
            <input max={YEARS.length - 1} min="0" onChange={(event) => { setPlaying(false); setYearIndex(Number(event.target.value)); }} step="1" type="range" value={yearIndex} />
            <span className={styles.rangeLabels}>{YEARS.map((year) => <i key={year}>{year}</i>)}</span>
          </label>
        </div>
      </section>

      <section className={styles.inspector} aria-live="polite">
        <div><p>{detail.eyebrow} · {yearData.year}</p><h3>{detail.title}</h3></div>
        <div><strong>{formatMoney(detail.value)}</strong><span>{formatPercent(detail.value / layout.total)} of the visible river</span></div>
        <p>{detail.body}</p>
        <small>Hover to inspect. Click to pin.</small>
      </section>

      <section className={styles.factBand} aria-label="2023 represented trade facts">
        <div><strong>$10.53T</strong><span>represented exports</span></div>
        <div><strong>8</strong><span>leading exporters</span></div>
        <div><strong>97</strong><span>HS chapters</span></div>
        <div><strong>9</strong><span>destination groups</span></div>
      </section>

      <section className={styles.findings}>
        <div className={styles.findingIntro}><p className={styles.eyebrow}>The 2023 current</p><h2>Three bends in the river.</h2></div>
        <div className={styles.findingGrid}>
          <article><span>01</span><strong>30.8%</strong><h3>Machinery &amp; electronics</h3><p>The largest commodity family in the represented export flow.</p><button onClick={() => { setYearIndex(5); filterCommodity("machinery"); }} type="button">Isolate flow →</button></article>
          <article><span>02</span><strong>32.1%</strong><h3>China&apos;s share</h3><p>Up from 8.4% among the same eight reporting exporters in 2000.</p><button onClick={() => { setYearIndex(5); setCommodityFilter(null); setSelected({ kind: "exporter", exporter: "china" }); }} type="button">Highlight source →</button></article>
          <article><span>03</span><strong>63.4%</strong><h3>Beyond the named markets</h3><p>Most represented exports still arrive somewhere outside the eight largest destinations.</p><button onClick={() => { setYearIndex(5); setCommodityFilter(null); setSelected({ kind: "importer", importer: "rest-of-world" }); }} type="button">Highlight destination →</button></article>
        </div>
      </section>

      <section className={styles.caveat}>
        <p className={styles.eyebrow}>What this river is</p>
        <div><h2>A window, not the whole ocean.</h2><p>The chart follows reporter-recorded exports from the eight largest merchandise exporters in the 2023 comparison. It excludes services and groups every unnamed destination into “Rest of world.” Export and mirror-import records can differ because borders count value at different moments and on different terms.</p></div>
      </section>

      <footer className={styles.dataNote}>
        <strong>Source &amp; method</strong>
        <div><p>UN Comtrade annual merchandise exports, Harmonized System chapters grouped into ten families. Six benchmark years; values are current US dollars. Every represented export is retained and the two sides reconcile.</p><a href="https://comtradeplus.un.org/">United Nations Comtrade database ↗</a></div>
      </footer>
    </main>
  );
}

function TradeNode({ node, color, focus, onHover, onSelect }: { node: Node; color: string; focus: Focus; onHover: (focus: Focus | null) => void; onSelect: (focus: Focus) => void }) {
  const left = node.layer === "exporter";
  const right = node.layer === "importer";
  const labelX = left ? node.x - 12 : node.x + NODE_WIDTH + 12;
  const anchor = left ? "end" : "start";
  const centerAdjustment = node.layer === "commodity" ? 0 : 0;
  return (
    <g className={styles.node} onBlur={() => onHover(null)} onClick={() => onSelect(focus)} onFocus={() => onHover(focus)} onMouseEnter={() => onHover(focus)} onMouseLeave={() => onHover(null)} role="button" tabIndex={0}>
      <rect fill={color} height={Math.max(node.height, 1)} rx="2" width={NODE_WIDTH} x={node.x} y={node.y} />
      <text className={styles.nodeLabel} textAnchor={anchor} x={labelX + centerAdjustment} y={node.y + node.height / 2 - 3}>{node.label}</text>
      <text className={styles.nodeValue} textAnchor={anchor} x={labelX + centerAdjustment} y={node.y + node.height / 2 + 13}>{formatMoney(node.value)}</text>
    </g>
  );
}

function buildLayout(data: YearData, commodityFilter: string | null) {
  const leftFlows = data.exporterCommodity.filter((flow) => !commodityFilter || flow.commodity === commodityFilter);
  const rightFlows = data.commodityImporter.filter((flow) => !commodityFilter || flow.commodity === commodityFilter);
  const commodities = DATA.commodities.filter((item) => !commodityFilter || item.id === commodityFilter);
  const total = leftFlows.reduce((sum, flow) => sum + flow.value, 0);
  const top = 28;
  const available = HEIGHT - 56;
  const scale = Math.min(
    (available - 11 * (DATA.exporters.length - 1)) / total,
    (available - 10 * (commodities.length - 1)) / total,
    (available - 11 * (DATA.importers.length - 1)) / total
  );
  const exporterTotals = totalsFor(DATA.exporters, leftFlows, "exporter");
  const commodityTotals = totalsFor(commodities, leftFlows, "commodity");
  const importerTotals = totalsFor(DATA.importers, rightFlows, "importer");
  const exporters = positionNodes(DATA.exporters, exporterTotals, X.exporter, "exporter", top, 11, scale);
  const commodityNodes = positionNodes(commodities, commodityTotals, X.commodity, "commodity", top, 10, scale);
  const importers = positionNodes(DATA.importers, importerTotals, X.importer, "importer", top, 11, scale);
  const exporterOffset = new Map(exporters.map((node) => [node.id, node.y]));
  const commodityInOffset = new Map(commodityNodes.map((node) => [node.id, node.y]));
  const commodityOutOffset = new Map(commodityNodes.map((node) => [node.id, node.y]));
  const importerOffset = new Map(importers.map((node) => [node.id, node.y]));
  const leftRibbons: Ribbon[] = [];
  const rightRibbons: Ribbon[] = [];
  for (const exporter of DATA.exporters) {
    for (const commodity of commodities) {
      const flow = leftFlows.find((item) => item.exporter === exporter.id && item.commodity === commodity.id);
      if (!flow?.value) continue;
      const height = flow.value * scale;
      const y0 = exporterOffset.get(exporter.id)!;
      const y1 = commodityInOffset.get(commodity.id)!;
      leftRibbons.push({ ...flow, id: `left:${exporter.id}:${commodity.id}`, side: "left", path: ribbonPath(X.exporter + NODE_WIDTH, y0, X.commodity, y1, height) });
      exporterOffset.set(exporter.id, y0 + height);
      commodityInOffset.set(commodity.id, y1 + height);
    }
  }
  for (const commodity of commodities) {
    for (const importer of DATA.importers) {
      const flow = rightFlows.find((item) => item.commodity === commodity.id && item.importer === importer.id);
      if (!flow?.value) continue;
      const height = flow.value * scale;
      const y0 = commodityOutOffset.get(commodity.id)!;
      const y1 = importerOffset.get(importer.id)!;
      rightRibbons.push({ ...flow, id: `right:${commodity.id}:${importer.id}`, side: "right", path: ribbonPath(X.commodity + NODE_WIDTH, y0, X.importer, y1, height) });
      commodityOutOffset.set(commodity.id, y0 + height);
      importerOffset.set(importer.id, y1 + height);
    }
  }
  return { total, exporters, commodities: commodityNodes, importers, leftRibbons, rightRibbons };
}

function totalsFor(items: Entity[], flows: Array<ExportFlow | ImportFlow>, key: "exporter" | "commodity" | "importer") {
  return new Map(items.map((item) => [item.id, flows.filter((flow) => flow[key as keyof typeof flow] === item.id).reduce((sum, flow) => sum + flow.value, 0)]));
}
function positionNodes(items: Entity[], totals: Map<string, number>, x: number, layer: Node["layer"], top: number, gap: number, scale: number) {
  let cursor = top;
  return items.map((item) => {
    const value = totals.get(item.id) ?? 0;
    const node: Node = { ...item, value, x, y: cursor, height: value * scale, layer };
    cursor += node.height + gap;
    return node;
  });
}
function ribbonPath(x0: number, y0: number, x1: number, y1: number, height: number) {
  const middle = (x0 + x1) / 2;
  return `M${x0},${y0} C${middle},${y0} ${middle},${y1} ${x1},${y1} L${x1},${y1 + height} C${middle},${y1 + height} ${middle},${y0 + height} ${x0},${y0 + height} Z`;
}
function matchesFocus(focus: Focus, ribbon: Ribbon) {
  if (focus.kind === "commodity") return ribbon.commodity === focus.commodity;
  if (focus.kind === "exporter") return ribbon.side === "right" || ribbon.exporter === focus.exporter;
  if (focus.kind === "importer") return ribbon.side === "left" || ribbon.importer === focus.importer;
  if (focus.kind === "left-link") return ribbon.side === "right" || (ribbon.exporter === focus.exporter && ribbon.commodity === focus.commodity);
  return ribbon.side === "left" || (ribbon.commodity === focus.commodity && ribbon.importer === focus.importer);
}
function describeFocus(focus: Focus, data: YearData, filter: string | null) {
  const visibleTotal = data.exporterCommodity.filter((flow) => !filter || flow.commodity === filter).reduce((sum, flow) => sum + flow.value, 0);
  if (focus.kind === "exporter") {
    const value = data.exporterCommodity.filter((flow) => flow.exporter === focus.exporter && (!filter || flow.commodity === filter)).reduce((sum, flow) => sum + flow.value, 0);
    return { eyebrow: "Reporting exporter", title: exporterLabel(focus.exporter!), value, body: `The visible ribbons show ${exporterLabel(focus.exporter!)}'s reported exports into the commodity pool. Destination ribbons show the pool's combined markets, not a preserved country-to-country path.` };
  }
  if (focus.kind === "importer") {
    const value = data.commodityImporter.filter((flow) => flow.importer === focus.importer && (!filter || flow.commodity === filter)).reduce((sum, flow) => sum + flow.value, 0);
    return { eyebrow: "Destination market", title: importerLabel(focus.importer!), value, body: `This is the value reported as arriving from the eight represented exporters${filter ? ` in ${commodityLabel(filter).toLowerCase()}` : " across all goods"}.` };
  }
  if (focus.kind === "left-link") {
    const value = data.exporterCommodity.find((flow) => flow.exporter === focus.exporter && flow.commodity === focus.commodity)?.value ?? 0;
    return { eyebrow: "Export ribbon", title: `${exporterLabel(focus.exporter!)} → ${commodityLabel(focus.commodity!)}`, value, body: `One exporter's contribution to this commodity family in ${data.year}.` };
  }
  if (focus.kind === "right-link") {
    const value = data.commodityImporter.find((flow) => flow.commodity === focus.commodity && flow.importer === focus.importer)?.value ?? 0;
    return { eyebrow: "Destination ribbon", title: `${commodityLabel(focus.commodity!)} → ${importerLabel(focus.importer!)}`, value, body: `Combined exports in this commodity family from the eight represented exporters to this destination.` };
  }
  const value = data.exporterCommodity.filter((flow) => flow.commodity === focus.commodity).reduce((sum, flow) => sum + flow.value, 0);
  return { eyebrow: "Commodity family", title: commodityLabel(focus.commodity!), value: filter ? visibleTotal : value, body: `All reported two-digit HS chapters grouped into ${commodityLabel(focus.commodity!).toLowerCase()}, flowing from origins to destinations.` };
}
function exporterLabel(id: string) { return DATA.exporters.find((item) => item.id === id)?.label ?? id; }
function commodityLabel(id: string) { return DATA.commodities.find((item) => item.id === id)?.label ?? id; }
function importerLabel(id: string) { return DATA.importers.find((item) => item.id === id)?.label ?? id; }
function formatMoney(value: number) { if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`; if (value >= 1e9) return `$${(value / 1e9).toFixed(value >= 100e9 ? 0 : 1)}B`; return `$${(value / 1e6).toFixed(0)}M`; }
function formatPercent(value: number) { return `${(value * 100).toFixed(value < .01 ? 1 : 0)}%`; }
