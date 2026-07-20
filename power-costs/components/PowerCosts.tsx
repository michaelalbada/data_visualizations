"use client";

import { useEffect, useMemo, useState } from "react";
import { LCOE_YEARS, MILESTONES, TECHNOLOGIES, percentChange, valueAt, type Technology, type TechnologyId } from "../data/lcoeData";
import styles from "./PowerCosts.module.css";

const WIDTH = 1160;
const HEIGHT = 650;
const PLOT = { left: 88, right: 120, top: 35, bottom: 72 };
const INNER_WIDTH = WIDTH - PLOT.left - PLOT.right;
const INNER_HEIGHT = HEIGHT - PLOT.top - PLOT.bottom;
type ViewMode = "absolute" | "indexed";

export function PowerCosts() {
  const [yearIndex, setYearIndex] = useState(LCOE_YEARS.length - 1);
  const [viewMode, setViewMode] = useState<ViewMode>("absolute");
  const [selectedId, setSelectedId] = useState<TechnologyId>("solar");
  const [hoveredId, setHoveredId] = useState<TechnologyId | null>(null);
  const [enabledIds, setEnabledIds] = useState<TechnologyId[]>(TECHNOLOGIES.map((technology) => technology.id));
  const [playing, setPlaying] = useState(false);
  const year = LCOE_YEARS[yearIndex];
  const activeId = hoveredId ?? selectedId;
  const active = TECHNOLOGIES.find((technology) => technology.id === activeId)!;
  const enabled = TECHNOLOGIES.filter((technology) => enabledIds.includes(technology.id));
  const ranking = useMemo(() => enabled.slice().sort((a, b) => valueAt(a, yearIndex) - valueAt(b, yearIndex)), [enabledIds, yearIndex]);
  const solar = TECHNOLOGIES[0];
  const wind = TECHNOLOGIES[1];
  const gas = TECHNOLOGIES[2];

  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => {
      setYearIndex((current) => {
        if (current >= LCOE_YEARS.length - 1) {
          setPlaying(false);
          return LCOE_YEARS.length - 1;
        }
        return current + 1;
      });
    }, 700);
    return () => window.clearInterval(timer);
  }, [playing]);

  function togglePlayback() {
    if (!playing && yearIndex === LCOE_YEARS.length - 1) setYearIndex(0);
    setPlaying((current) => !current);
  }

  function toggleTechnology(id: TechnologyId) {
    setEnabledIds((current) => {
      if (current.includes(id) && current.length === 1) return current;
      if (current.includes(id)) {
        if (selectedId === id) setSelectedId(TECHNOLOGIES.find((technology) => current.includes(technology.id) && technology.id !== id)!.id);
        return current.filter((item) => item !== id);
      }
      return [...current, id];
    });
  }

  function jumpTo(yearValue: number) {
    setPlaying(false);
    setYearIndex(LCOE_YEARS.indexOf(yearValue as typeof LCOE_YEARS[number]));
    if (yearValue === 2011) setSelectedId("wind");
    else setSelectedId("solar");
  }

  return (
    <main className={styles.shell}>
      <header className={styles.hero}>
        <div>
          <p className={styles.kicker}>2009–2025 · US new-build electricity</p>
          <h1>Sun and wind fell through the floor.</h1>
        </div>
        <p className={styles.intro}>
          Solar began as the expensive experiment. Wind looked promising, but not
          inevitable. Then their cost curves dropped through coal, gas, and nearly
          every other new source of electricity.
        </p>
      </header>

      <section className={styles.workspace}>
        <div className={styles.chartCard}>
          <div className={styles.chartIntro}>
            <div><p className={styles.eyebrow}>One lifetime price</p><h2>The order turned upside down.</h2></div>
            <p>Levelized cost spreads a plant&apos;s expected lifetime expense across the electricity it produces. It is imperfect—but within one consistent comparison, the reversal is impossible to miss.</p>
          </div>
          <div className={styles.legend} aria-label="Technologies">
            {TECHNOLOGIES.map((technology) => (
              <button aria-pressed={enabledIds.includes(technology.id)} key={technology.id} onClick={() => toggleTechnology(technology.id)} type="button">
                <i style={{ background: technology.color }} />{technology.shortName}
              </button>
            ))}
            <button className={styles.showAll} onClick={() => setEnabledIds(TECHNOLOGIES.map((technology) => technology.id))} type="button">Show all</button>
          </div>
          <div className={styles.viewControls}>
            <div><span>Cost view</span><button aria-pressed={viewMode === "absolute"} onClick={() => setViewMode("absolute")} type="button">$/MWh</button><button aria-pressed={viewMode === "indexed"} onClick={() => setViewMode("indexed")} type="button">2009 = 100</button></div>
            <strong>{year}</strong>
          </div>
          <div className={styles.chartScroll}>
            <svg aria-label={`Historical levelized cost of electricity through ${year}`} className={styles.chart} role="img" viewBox={`0 0 ${WIDTH} ${HEIGHT}`}>
              <rect className={styles.plotBackground} height={INNER_HEIGHT} width={INNER_WIDTH} x={PLOT.left} y={PLOT.top} />
              {ticksFor(viewMode).map((tick) => (
                <g key={tick}>
                  <line className={styles.gridLine} x1={PLOT.left} x2={WIDTH - PLOT.right} y1={yScale(tick, viewMode)} y2={yScale(tick, viewMode)} />
                  <text className={styles.yTick} x={PLOT.left - 13} y={yScale(tick, viewMode) + 4}>{viewMode === "absolute" ? `$${tick}` : tick}</text>
                </g>
              ))}
              {[2009, 2013, 2017, 2021, 2025].map((tickYear) => (
                <g key={tickYear}>
                  <line className={styles.gridLine} x1={xScale(tickYear)} x2={xScale(tickYear)} y1={PLOT.top} y2={HEIGHT - PLOT.bottom} />
                  <text className={styles.xTick} x={xScale(tickYear)} y={HEIGHT - PLOT.bottom + 29}>{tickYear}</text>
                </g>
              ))}
              <text className={styles.axisLabel} transform={`translate(18 ${PLOT.top + INNER_HEIGHT / 2}) rotate(-90)`}>{viewMode === "absolute" ? "average levelized cost · dollars per megawatt-hour" : "cost index · each technology's 2009 value = 100"}</text>
              <text className={styles.watermark} x={WIDTH - PLOT.right - 6} y={HEIGHT - PLOT.bottom - 22}>{year}</text>
              <line className={styles.yearLine} x1={xScale(year)} x2={xScale(year)} y1={PLOT.top} y2={HEIGHT - PLOT.bottom} />

              {enabled.map((technology) => {
                const points = technology.values.slice(0, yearIndex + 1).map((value, index) => `${xScale(LCOE_YEARS[index])},${yScale(displayValue(technology, value, viewMode), viewMode)}`).join(" ");
                const isActive = technology.id === activeId;
                return (
                  <g key={technology.id}>
                    <polyline className={styles.hitLine} onClick={() => setSelectedId(technology.id)} onMouseEnter={() => setHoveredId(technology.id)} onMouseLeave={() => setHoveredId(null)} points={points} />
                    <polyline className={`${styles.seriesLine} ${isActive ? styles.activeLine : ""}`} points={points} stroke={technology.color} />
                    {technology.values.slice(0, yearIndex + 1).map((value, index) => (
                      <circle
                        aria-label={`${technology.name}, ${LCOE_YEARS[index]}: $${value} per megawatt-hour`}
                        className={`${styles.point} ${isActive ? styles.activePoint : ""}`}
                        cx={xScale(LCOE_YEARS[index])}
                        cy={yScale(displayValue(technology, value, viewMode), viewMode)}
                        fill={technology.color}
                        key={`${technology.id}-${LCOE_YEARS[index]}`}
                        onBlur={() => setHoveredId(null)}
                        onClick={() => setSelectedId(technology.id)}
                        onFocus={() => setHoveredId(technology.id)}
                        onMouseEnter={() => setHoveredId(technology.id)}
                        onMouseLeave={() => setHoveredId(null)}
                        r={isActive && index === yearIndex ? 7 : 4}
                        tabIndex={index === yearIndex ? 0 : -1}
                      />
                    ))}
                    <line className={styles.endLeader} stroke={technology.color} x1={xScale(year) + 4} x2={xScale(year) + 15} y1={yScale(displayValue(technology, valueAt(technology, yearIndex), viewMode), viewMode)} y2={yScale(displayValue(technology, valueAt(technology, yearIndex), viewMode), viewMode) + labelOffset(technology.id, yearIndex)} />
                    <text className={styles.endLabel} fill={technology.color} x={xScale(year) + 19} y={yScale(displayValue(technology, valueAt(technology, yearIndex), viewMode), viewMode) + labelOffset(technology.id, yearIndex) + 4}>{technology.shortName}</text>
                  </g>
                );
              })}
            </svg>
          </div>
          <div className={styles.transport}>
            <button className={styles.playButton} onClick={togglePlayback} type="button"><span aria-hidden="true">{playing ? "Ⅱ" : "▶"}</span>{playing ? "Pause" : yearIndex === LCOE_YEARS.length - 1 ? "Replay the collapse" : "Play"}</button>
            <label>
              <span className={styles.srOnly}>LCOE edition</span>
              <input max={LCOE_YEARS.length - 1} min="0" onChange={(event) => { setPlaying(false); setYearIndex(Number(event.target.value)); }} step="1" type="range" value={yearIndex} />
              <span className={styles.rangeLabels}>{LCOE_YEARS.map((item, index) => <i className={index % 3 && index !== LCOE_YEARS.length - 1 ? styles.minorYear : ""} key={item}>{item}</i>)}</span>
            </label>
          </div>
        </div>

        <aside className={styles.inspector} aria-live="polite">
          <div className={styles.inspectorTop}><i style={{ background: active.color }} /><div><p>{active.group} · {year}</p><h3>{active.name}</h3></div></div>
          <div className={styles.bigMetric}><span>Average new-build LCOE</span><strong>${valueAt(active, yearIndex)}</strong><small>dollars per megawatt-hour</small></div>
          <div className={styles.changeMetric}><span>Since 2009</span><strong className={percentChange(active, yearIndex) <= 0 ? styles.down : styles.up}>{formatChange(percentChange(active, yearIndex))}</strong></div>
          <p>{active.note}</p>
          <div className={styles.ranking}>
            <strong>Cost order in {year}</strong>
            {ranking.map((technology, index) => (
              <button key={technology.id} onClick={() => setSelectedId(technology.id)} type="button">
                <span>{index + 1}</span><i style={{ width: `${Math.max(6, valueAt(technology, yearIndex) / valueAt(ranking.at(-1)!, yearIndex) * 100)}%`, background: technology.color }} /><b>{technology.shortName}</b><em>${valueAt(technology, yearIndex)}</em>
              </button>
            ))}
          </div>
          <small>Hover a line to inspect. Click to pin.</small>
        </aside>
      </section>

      <section className={styles.factBand} aria-label="Historical levelized cost changes">
        <div><strong>−84%</strong><span>utility solar</span></div>
        <div><strong>−55%</strong><span>onshore wind</span></div>
        <div><strong>−5%</strong><span>combined-cycle gas</span></div>
        <div><strong>+10%</strong><span>new coal</span></div>
      </section>

      <section className={styles.nowBand}>
        <span>By {year}</span>
        <strong>{relativePhrase(valueAt(solar, yearIndex), valueAt(gas, yearIndex), "solar", "gas")}</strong>
        <p>{relativePhrase(valueAt(wind, yearIndex), valueAt(gas, yearIndex), "wind", "gas")}.</p>
      </section>

      <section className={styles.milestones}>
        <div className={styles.milestoneIntro}><p className={styles.eyebrow}>Five crossings</p><h2>Watch the hierarchy break.</h2></div>
        <div className={styles.milestoneGrid}>
          {MILESTONES.map((milestone, index) => (
            <button aria-pressed={year === milestone.year} key={milestone.year} onClick={() => jumpTo(milestone.year)} type="button">
              <span>0{index + 1}</span><i>{milestone.year}</i><h3>{milestone.title}</h3><p>{milestone.body}</p><b>View year →</b>
            </button>
          ))}
        </div>
      </section>

      <section className={styles.caveat}>
        <p className={styles.eyebrow}>One number cannot run a grid</p>
        <div><h2>Cheap energy is not the same as a complete power system.</h2><p>LCOE compares plant-level lifetime generation cost. It does not include every transmission, balancing, reliability, siting, or integration cost—and these technologies do not provide identical services. The chart shows why the investment economics changed, not which resource should supply every hour.</p></div>
      </section>

      <footer className={styles.dataNote}>
        <strong>Source &amp; method</strong>
        <div><p>Lazard Levelized Cost of Energy+, versions 3.0–18.0. Values are the published average of each technology&apos;s unsubsidized high and low LCOE estimate. No edition is shown for 2022. Values are as reported, not inflation-normalized.</p><p className={styles.sourceLinks}><a href="https://www.lazard.com/research-insights/levelized-cost-of-energyplus/">Lazard LCOE+ archive ↗</a><a href="https://www.irena.org/Digital-Report/Renewable-Power-Generation-Costs-in-2024">IRENA global renewable-cost context ↗</a></p></div>
      </footer>
    </main>
  );
}

function xScale(year: number) { return PLOT.left + ((year - 2009) / (2025 - 2009)) * INNER_WIDTH; }
function yScale(value: number, mode: ViewMode) { const max = mode === "absolute" ? 380 : 160; return PLOT.top + (1 - value / max) * INNER_HEIGHT; }
function displayValue(technology: Technology, value: number, mode: ViewMode) { return mode === "absolute" ? value : value / technology.values[0] * 100; }
function ticksFor(mode: ViewMode) { return mode === "absolute" ? [0, 50, 100, 150, 200, 250, 300, 350] : [0, 25, 50, 75, 100, 125, 150]; }
function formatChange(value: number) { return `${value > 0 ? "+" : ""}${Math.round(value)}%`; }
function labelOffset(id: TechnologyId, yearIndex: number) {
  if (yearIndex < 2) return { solar: -8, wind: 11, "gas-combined": 14, coal: -7, nuclear: 7, geothermal: -12, "gas-peaking": 0 }[id];
  return { solar: -11, wind: 10, "gas-combined": 4, coal: 0, nuclear: 0, geothermal: 13, "gas-peaking": 0 }[id];
}
function relativePhrase(value: number, comparator: number, subject: string, other: string) {
  const change = Math.round(Math.abs(value / comparator - 1) * 100);
  return value <= comparator ? `${subject} is ${change}% below ${other}` : `${subject} is ${change}% above ${other}`;
}
