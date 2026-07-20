"use client";

import { useEffect, useMemo, useState } from "react";
import rawData from "../data/health-spending.generated.json";
import styles from "./HealthSpending.module.css";

type Payer = { id: string; label: string; shortLabel: string };
type Service = { id: string; label: string };
type Flow = { source: string; target: string; value: number };
type YearData = { year: number; total: number; population: number; flows: Flow[] };
type Focus = { kind: "source" | "target" | "link"; source?: string; target?: string };
type LayoutNode = { id: string; label: string; shortLabel?: string; value: number; x: number; y: number; height: number; side: "source" | "target" };
type LayoutLink = Flow & { id: string; y0: number; y1: number; height: number; path: string };

const DATA = rawData as { payers: Payer[]; services: Service[]; years: YearData[] };
const WIDTH = 1180;
const HEIGHT = 700;
const NODE_WIDTH = 15;
const LEFT_X = 218;
const RIGHT_X = 908;
const PAYER_COLORS: Record<string, string> = {
  "out-of-pocket": "#e86c4c",
  "private-insurance": "#e9a64b",
  medicare: "#4e9f86",
  "medicaid-chip": "#58a6c4",
  "defense-veterans": "#8977b6",
  "other-programs": "#a88068",
  "direct-public": "#667d88",
  "private-capital": "#c6758c"
};

const STORIES = [
  { year: 1960, eyebrow: "At the counter", title: "Out of pocket begins as the largest payer." },
  { year: 1966, eyebrow: "A new channel", title: "Medicare and Medicaid enter the accounts." },
  { year: 2020, eyebrow: "Pandemic shock", title: "Public-health funding abruptly widens." },
  { year: 2024, eyebrow: "Today", title: "The system reaches $5.3 trillion." }
];

export function HealthSpending() {
  const [year, setYear] = useState(2024);
  const [playing, setPlaying] = useState(false);
  const [selected, setSelected] = useState<Focus>({ kind: "target", target: "hospital" });
  const [hovered, setHovered] = useState<Focus | null>(null);
  const yearData = DATA.years.find((item) => item.year === year) ?? DATA.years.at(-1)!;
  const layout = useMemo(() => buildLayout(yearData), [yearData]);
  const focus = hovered ?? selected;
  const insight = describeFocus(focus, yearData);

  useEffect(() => {
    if (!playing) return;
    const interval = window.setInterval(() => {
      setYear((current) => {
        if (current >= 2024) {
          setPlaying(false);
          return 2024;
        }
        return current + 1;
      });
    }, 170);
    return () => window.clearInterval(interval);
  }, [playing]);

  function togglePlayback() {
    if (!playing && year === 2024) setYear(1960);
    setPlaying((current) => !current);
  }

  function chooseStory(storyYear: number) {
    setPlaying(false);
    setYear(storyYear);
    if (storyYear === 1960) setSelected({ kind: "source", source: "out-of-pocket" });
    else if (storyYear === 1966) setSelected({ kind: "source", source: "medicare" });
    else if (storyYear === 2020) setSelected({ kind: "target", target: "public-health" });
    else setSelected({ kind: "target", target: "hospital" });
  }

  return (
    <main className={styles.shell}>
      <header className={styles.hero}>
        <div>
          <p className={styles.kicker}>1960–2024 · America&apos;s health dollar</p>
          <h1>Who pays. Where it goes.</h1>
        </div>
        <p className={styles.intro}>
          Five trillion dollars does not move as one stream. It arrives through
          premiums, taxes, programs, and household wallets—then separates again
          among hospitals, clinicians, medicines, care, and the machinery behind them.
        </p>
      </header>

      <section className={styles.workspace}>
        <div className={styles.chartCard}>
          <div className={styles.chartIntro}>
            <div><p className={styles.eyebrow}>Follow the money</p><h2>Every ribbon has a receipt.</h2></div>
            <p>Ribbon width is annual spending in current-year dollars. Start with a payer on the left and arrive at a service on the right. Hover any ribbon or block to isolate it.</p>
          </div>
          <div className={styles.chartHeading}>
            <div><span>Sources of funds</span><i /><span>Types of service</span></div>
            <strong>{year}</strong>
          </div>
          <div className={styles.chartScroll}>
            <svg aria-label={`Sankey diagram of US health spending in ${year}`} className={styles.chart} role="img" viewBox={`0 0 ${WIDTH} ${HEIGHT}`}>
              <text className={styles.totalWatermark} x={WIDTH / 2} y={HEIGHT / 2 + 20}>{formatMoney(yearData.total)}</text>
              {layout.links.map((link) => {
                const emphasized = matchesFocus(focus, link);
                return (
                  <path
                    aria-label={`${payerLabel(link.source)} to ${serviceLabel(link.target)}: ${formatMoney(link.value)}`}
                    className={`${styles.link} ${focus && !emphasized ? styles.dimmed : ""}`}
                    d={link.path}
                    fill={PAYER_COLORS[link.source]}
                    key={link.id}
                    onBlur={() => setHovered(null)}
                    onClick={() => setSelected({ kind: "link", source: link.source, target: link.target })}
                    onFocus={() => setHovered({ kind: "link", source: link.source, target: link.target })}
                    onMouseEnter={() => setHovered({ kind: "link", source: link.source, target: link.target })}
                    onMouseLeave={() => setHovered(null)}
                    tabIndex={0}
                  />
                );
              })}
              {layout.sources.map((node) => (
                <g
                  className={styles.node}
                  key={node.id}
                  onClick={() => setSelected({ kind: "source", source: node.id })}
                  onMouseEnter={() => setHovered({ kind: "source", source: node.id })}
                  onMouseLeave={() => setHovered(null)}
                  role="button"
                  tabIndex={0}
                >
                  <rect fill={PAYER_COLORS[node.id]} height={Math.max(node.height, 1)} rx="2" width={NODE_WIDTH} x={node.x} y={node.y} />
                  <text className={styles.nodeLabel} textAnchor="end" x={node.x - 13} y={node.y + node.height / 2 - 3}>{node.shortLabel}</text>
                  <text className={styles.nodeValue} textAnchor="end" x={node.x - 13} y={node.y + node.height / 2 + 13}>{formatMoney(node.value)}</text>
                </g>
              ))}
              {layout.targets.map((node) => (
                <g
                  className={styles.node}
                  key={node.id}
                  onClick={() => setSelected({ kind: "target", target: node.id })}
                  onMouseEnter={() => setHovered({ kind: "target", target: node.id })}
                  onMouseLeave={() => setHovered(null)}
                  role="button"
                  tabIndex={0}
                >
                  <rect className={styles.targetNode} height={Math.max(node.height, 1)} rx="2" width={NODE_WIDTH} x={node.x} y={node.y} />
                  <text className={styles.nodeLabel} x={node.x + NODE_WIDTH + 13} y={node.y + node.height / 2 - 3}>{node.label}</text>
                  <text className={styles.nodeValue} x={node.x + NODE_WIDTH + 13} y={node.y + node.height / 2 + 13}>{formatMoney(node.value)}</text>
                </g>
              ))}
            </svg>
          </div>
          <div className={styles.transport}>
            <button className={styles.playButton} onClick={togglePlayback} type="button"><span aria-hidden="true">{playing ? "Ⅱ" : "▶"}</span>{playing ? "Pause" : year === 2024 ? "Replay 65 years" : "Play"}</button>
            <label>
              <span className={styles.srOnly}>Year</span>
              <input max="2024" min="1960" onChange={(event) => { setPlaying(false); setYear(Number(event.target.value)); }} type="range" value={year} />
              <span className={styles.rangeLabels}><i>1960</i><i>Medicare</i><i>1980</i><i>2000</i><i>ACA</i><i>2024</i></span>
            </label>
          </div>
        </div>

        <aside className={styles.inspector} aria-live="polite">
          <p className={styles.inspectorEyebrow}>{insight.eyebrow} · {year}</p>
          <h3>{insight.title}</h3>
          <strong>{formatMoney(insight.value)}</strong>
          <span>{formatPercent(insight.value / yearData.total)} of national health spending</span>
          <p>{insight.body}</p>
          <dl>
            <div><dt>Total health spending</dt><dd>{formatMoney(yearData.total)}</dd></div>
            <div><dt>Approx. per person</dt><dd>~${Math.round(yearData.total / yearData.population).toLocaleString()}</dd></div>
            <div><dt>Displayed unit</dt><dd>Current dollars</dd></div>
          </dl>
          <small>Hover to inspect. Click to pin.</small>
        </aside>
      </section>

      <section className={styles.factBand} aria-label="2024 national health expenditure facts">
        <div><strong>$5.3T</strong><span>total spending</span></div>
        <div><strong>$15,474</strong><span>per person</span></div>
        <div><strong>18.0%</strong><span>of US GDP</span></div>
        <div><strong>65 years</strong><span>in one account</span></div>
      </section>

      <section className={styles.storySection}>
        <div className={styles.storyIntro}><p className={styles.eyebrow}>Four moments</p><h2>The river changes shape.</h2></div>
        <div className={styles.storyGrid}>
          {STORIES.map((story) => (
            <button aria-pressed={year === story.year} key={story.year} onClick={() => chooseStory(story.year)} type="button">
              <span>{story.year}</span><i>{story.eyebrow}</i><strong>{story.title}</strong><b>View year →</b>
            </button>
          ))}
        </div>
      </section>

      <section className={styles.readingNote}>
        <p className={styles.eyebrow}>A careful reading</p>
        <div>
          <h2>Spending is not the same thing as health.</h2>
          <p>This diagram describes money moving through the health system. It does not measure access, quality, outcomes, prices, utilization, or who ultimately bears each tax and premium.</p>
        </div>
      </section>

      <footer className={styles.dataNote}>
        <strong>Source &amp; method</strong>
        <div>
          <p>CMS National Health Expenditure Accounts, “National Health Expenditures by Type of Service and Source of Funds, CY 1960–2024.” Values are nominal current-year dollars. Detailed CMS categories are grouped for legibility; every year reconciles to the published national total.</p>
          <a href="https://www.cms.gov/data-research/statistics-trends-and-reports/national-health-expenditure-data/historical">Centers for Medicare &amp; Medicaid Services · historical NHE tables ↗</a>
        </div>
      </footer>
    </main>
  );
}

function buildLayout(data: YearData) {
  const top = 26;
  const bottom = 26;
  const sourceGap = 13;
  const targetGap = 10;
  const available = HEIGHT - top - bottom;
  const scale = Math.min(
    (available - sourceGap * (DATA.payers.length - 1)) / data.total,
    (available - targetGap * (DATA.services.length - 1)) / data.total
  );
  const sourceTotals = new Map(DATA.payers.map((payer) => [payer.id, 0]));
  const targetTotals = new Map(DATA.services.map((service) => [service.id, 0]));
  data.flows.forEach((flow) => {
    sourceTotals.set(flow.source, (sourceTotals.get(flow.source) ?? 0) + flow.value);
    targetTotals.set(flow.target, (targetTotals.get(flow.target) ?? 0) + flow.value);
  });
  const sources = positionNodes(DATA.payers, sourceTotals, LEFT_X, "source", top, sourceGap, scale);
  const targets = positionNodes(DATA.services, targetTotals, RIGHT_X, "target", top, targetGap, scale);
  const sourceOffset = new Map(sources.map((node) => [node.id, node.y]));
  const targetOffset = new Map(targets.map((node) => [node.id, node.y]));
  const links: LayoutLink[] = [];
  for (const payer of DATA.payers) {
    for (const service of DATA.services) {
      const flow = data.flows.find((item) => item.source === payer.id && item.target === service.id);
      if (!flow || flow.value <= 0) continue;
      const height = flow.value * scale;
      const y0 = sourceOffset.get(flow.source)!;
      const y1 = targetOffset.get(flow.target)!;
      const x0 = LEFT_X + NODE_WIDTH;
      const x1 = RIGHT_X;
      const middle = (x0 + x1) / 2;
      links.push({ ...flow, id: `${flow.source}:${flow.target}`, y0, y1, height, path: `M${x0},${y0} C${middle},${y0} ${middle},${y1} ${x1},${y1} L${x1},${y1 + height} C${middle},${y1 + height} ${middle},${y0 + height} ${x0},${y0 + height} Z` });
      sourceOffset.set(flow.source, y0 + height);
      targetOffset.set(flow.target, y1 + height);
    }
  }
  return { sources, targets, links };
}

function positionNodes(items: Array<Payer | Service>, totals: Map<string, number>, x: number, side: "source" | "target", top: number, gap: number, scale: number): LayoutNode[] {
  let cursor = top;
  return items.map((item) => {
    const value = totals.get(item.id) ?? 0;
    const node = { ...item, value, x, y: cursor, height: value * scale, side } as LayoutNode;
    cursor += node.height + gap;
    return node;
  });
}

function matchesFocus(focus: Focus | null, link: Flow) {
  if (!focus) return true;
  if (focus.kind === "source") return focus.source === link.source;
  if (focus.kind === "target") return focus.target === link.target;
  return focus.source === link.source && focus.target === link.target;
}

function describeFocus(focus: Focus, data: YearData) {
  if (focus.kind === "link") {
    const flow = data.flows.find((item) => item.source === focus.source && item.target === focus.target);
    const value = flow?.value ?? 0;
    return { eyebrow: "One ribbon", title: `${payerLabel(focus.source!)} → ${serviceLabel(focus.target!)}`, value, body: `${payerLabel(focus.source!)} financed ${formatMoney(value)} of ${serviceLabel(focus.target!).toLowerCase()} in ${data.year}.` };
  }
  if (focus.kind === "source") {
    const value = data.flows.filter((flow) => flow.source === focus.source).reduce((sum, flow) => sum + flow.value, 0);
    return { eyebrow: "Source of funds", title: payerLabel(focus.source!), value, body: `Follow this source across the diagram to see which services it financed in ${data.year}.` };
  }
  const value = data.flows.filter((flow) => flow.target === focus.target).reduce((sum, flow) => sum + flow.value, 0);
  return { eyebrow: "Type of service", title: serviceLabel(focus.target!), value, body: `Trace this destination backward to see the mix of households, insurers, and public programs that financed it.` };
}

function payerLabel(id: string) { return DATA.payers.find((payer) => payer.id === id)?.label ?? id; }
function serviceLabel(id: string) { return DATA.services.find((service) => service.id === id)?.label ?? id; }
function formatMoney(millions: number) {
  if (millions >= 1_000_000) return `$${(millions / 1_000_000).toFixed(millions >= 10_000_000 ? 1 : 2)}T`;
  if (millions >= 1_000) return `$${(millions / 1_000).toFixed(millions >= 100_000 ? 0 : 1)}B`;
  return `$${Math.round(millions).toLocaleString()}M`;
}
function formatPercent(value: number) { return `${(value * 100).toFixed(value < 0.01 ? 1 : 0)}%`; }
