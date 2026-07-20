"use client";

import { useEffect, useMemo, useState } from "react";
import { COMPUTE_POINTS, ERA_COLORS, ERA_NOTES, type ComputeEra, type ComputePoint } from "../data/computeData";
import styles from "./MooresLaw.module.css";

const WIDTH = 1120;
const HEIGHT = 650;
const PLOT = { left: 92, right: 35, top: 30, bottom: 76 };
const INNER_WIDTH = WIDTH - PLOT.left - PLOT.right;
const INNER_HEIGHT = HEIGHT - PLOT.top - PLOT.bottom;
const START_YEAR = 1896;
const END_YEAR = 2024;
const MIN_EXPONENT = -6;
const MAX_EXPONENT = 16;
const ERAS = Object.keys(ERA_COLORS) as ComputeEra[];

export function MooresLaw() {
  const [visibleYear, setVisibleYear] = useState(END_YEAR);
  const [playing, setPlaying] = useState(false);
  const [selectedId, setSelectedId] = useState("blackwell");
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [enabledEras, setEnabledEras] = useState<ComputeEra[]>(ERAS);
  const [showGuide, setShowGuide] = useState(true);

  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => {
      setVisibleYear((year) => {
        if (year >= END_YEAR) {
          setPlaying(false);
          return END_YEAR;
        }
        return year + 1;
      });
    }, 95);
    return () => window.clearInterval(timer);
  }, [playing]);

  const visiblePoints = useMemo(
    () => COMPUTE_POINTS.filter((point) => point.year <= visibleYear && enabledEras.includes(point.era)),
    [enabledEras, visibleYear]
  );
  const active = COMPUTE_POINTS.find((point) => point.id === (hoverId ?? selectedId)) ?? COMPUTE_POINTS[0];
  const improvement = frontierAtYear(visibleYear) / COMPUTE_POINTS[0].cpsPerDollar;

  function togglePlayback() {
    if (!playing && visibleYear === END_YEAR) setVisibleYear(START_YEAR);
    setPlaying((current) => !current);
  }

  function toggleEra(era: ComputeEra) {
    setEnabledEras((current) => current.includes(era) ? current.filter((item) => item !== era) : [...current, era]);
  }

  return (
    <main className={styles.shell}>
      <header className={styles.hero}>
        <div>
          <p className={styles.kicker}>1896–2024 · computation per dollar</p>
          <h1>128 years of compounding.</h1>
        </div>
        <p className={styles.intro}>
          Moore&apos;s famous observation is one chapter in a longer story. The
          computational frontier has crossed gears, relays, tubes, transistors,
          CPUs, GPUs, and custom AI silicon without losing its exponential rhythm.
        </p>
      </header>

      <section className={styles.workspace}>
        <div className={styles.chartCard}>
          <div className={styles.chartIntro}>
            <div><p className={styles.eyebrow}>The long curve</p><h2>A straight line means exponential.</h2></div>
            <p>This vertical axis is logarithmic: every labeled step is 100 times more computation for the same dollar. The quiet-looking diagonal spans twenty-one orders of magnitude.</p>
          </div>
          <div className={styles.legend} aria-label="Technology eras">
            {ERAS.map((era) => (
              <button aria-pressed={enabledEras.includes(era)} key={era} onClick={() => toggleEra(era)} type="button">
                <i style={{ background: ERA_COLORS[era] }} />{era}
              </button>
            ))}
            <button aria-pressed={showGuide} className={styles.guideToggle} onClick={() => setShowGuide((value) => !value)} type="button">Doubling guide</button>
          </div>

          <div className={styles.chartWrap}>
            <svg aria-label={`Computational price-performance frontier through ${visibleYear}`} className={styles.chart} role="img" viewBox={`0 0 ${WIDTH} ${HEIGHT}`}>
              <rect className={styles.plotBackground} height={INNER_HEIGHT} width={INNER_WIDTH} x={PLOT.left} y={PLOT.top} />
              {Array.from({ length: 12 }, (_, index) => MIN_EXPONENT + index * 2).map((exponent) => (
                <g key={exponent}>
                  <line className={styles.gridLine} x1={PLOT.left} x2={WIDTH - PLOT.right} y1={yScale(10 ** exponent)} y2={yScale(10 ** exponent)} />
                  <text className={styles.yTick} x={PLOT.left - 14} y={yScale(10 ** exponent) + 4}>10<tspan baselineShift="super" fontSize="9">{exponent}</tspan></text>
                </g>
              ))}
              {[1900, 1920, 1940, 1960, 1980, 2000, 2020].map((year) => (
                <g key={year}>
                  <line className={styles.gridLine} x1={xScale(year)} x2={xScale(year)} y1={PLOT.top} y2={HEIGHT - PLOT.bottom} />
                  <text className={styles.xTick} x={xScale(year)} y={HEIGHT - PLOT.bottom + 28}>{year}</text>
                </g>
              ))}
              <text className={styles.yAxisLabel} transform={`translate(22 ${PLOT.top + INNER_HEIGHT / 2}) rotate(-90)`}>calculations per second per 2024 US dollar · approximate</text>
              <text className={styles.yearWatermark} x={WIDTH - PLOT.right - 8} y={HEIGHT - PLOT.bottom - 18}>{visibleYear}</text>

              {showGuide && (
                <line className={styles.guideLine} x1={xScale(START_YEAR)} x2={xScale(visibleYear)} y1={yScale(1e-6)} y2={yScale(guideValue(visibleYear))} />
              )}

              <polyline className={styles.frontierLine} points={visiblePoints.slice().sort((a,b) => a.year-b.year || a.cpsPerDollar-b.cpsPerDollar).map((point) => `${xScale(point.year)},${yScale(point.cpsPerDollar)}`).join(" ")} />

              {visiblePoints.map((point) => {
                const isActive = point.id === active.id;
                return (
                  <circle
                    aria-label={`${point.name}, ${point.year}, ${formatCompute(point.cpsPerDollar)} calculations per second per dollar`}
                    className={`${styles.point} ${isActive ? styles.activePoint : ""}`}
                    cx={xScale(point.year)}
                    cy={yScale(point.cpsPerDollar)}
                    fill={ERA_COLORS[point.era]}
                    key={point.id}
                    onBlur={() => setHoverId(null)}
                    onClick={() => setSelectedId(point.id)}
                    onFocus={() => setHoverId(point.id)}
                    onMouseEnter={() => setHoverId(point.id)}
                    onMouseLeave={() => setHoverId(null)}
                    r={isActive ? 9 : 6}
                    role="button"
                    tabIndex={0}
                  />
                );
              })}

              {visiblePoints.filter((point) => ["hollerith","eniac","pdp-8","geforce-256","tpu-v1","blackwell"].includes(point.id)).map((point) => (
                <text className={styles.annotation} key={`label-${point.id}`} textAnchor={point.year > 2020 ? "end" : "start"} x={xScale(point.year) + (point.year > 2020 ? -9 : 9)} y={yScale(point.cpsPerDollar) - 10}>{point.name}</text>
              ))}
            </svg>
          </div>

          <div className={styles.transport}>
            <button className={styles.playButton} onClick={togglePlayback} type="button"><span aria-hidden="true">{playing ? "Ⅱ" : "▶"}</span>{playing ? "Pause" : visibleYear === END_YEAR ? "Replay 128 years" : "Play"}</button>
            <label>
              <span className={styles.srOnly}>Year</span>
              <input max={END_YEAR} min={START_YEAR} onChange={(event) => { setPlaying(false); setVisibleYear(Number(event.target.value)); }} type="range" value={visibleYear} />
              <span className={styles.rangeLabels}><i>1896</i><i>Mechanical</i><i>Electronic</i><i>AI</i><i>2024</i></span>
            </label>
          </div>
        </div>

        <aside className={styles.inspector}>
          <div className={styles.inspectorTop}><i style={{ background:ERA_COLORS[active.era] }} /><div><p>{active.era} · {active.year}</p><h3>{active.name}</h3></div></div>
          <div className={styles.bigMetric}><span>Approximate price-performance</span><strong>{formatCompute(active.cpsPerDollar)}</strong><small>calculations / second / dollar</small></div>
          <blockquote>{active.note}</blockquote>
          <dl>
            <div><dt>Improvement since 1896</dt><dd>{formatMultiplier(active.cpsPerDollar / 1e-6)}</dd></div>
            <div><dt>Years into the curve</dt><dd>{active.year - START_YEAR}</dd></div>
            <div><dt>Technology substrate</dt><dd>{active.era}</dd></div>
          </dl>
          <p className={styles.hint}>Hover to inspect. Click a point to pin it.</p>
        </aside>
      </section>

      <section className={styles.factBand} aria-label="Computing progress facts">
        <div><strong>10²¹×</strong><span>frontier improvement</span></div>
        <div><strong>~22 mo</strong><span>long-run doubling time</span></div>
        <div><strong>7</strong><span>technology substrates</span></div>
        <div><strong>1965</strong><span>Moore names the IC trend</span></div>
      </section>

      <section className={styles.nowBand}>
        <span>At {visibleYear}</span>
        <strong>{formatMultiplier(improvement)}</strong>
        <p>more computation per dollar than the beginning of the curve</p>
      </section>

      <section className={styles.handoffs}>
        <div className={styles.handoffIntro}><p className={styles.eyebrow}>Seven handoffs</p><h2>The curve survives by changing what computes.</h2></div>
        <div className={styles.eraGrid}>
          {ERA_NOTES.map((item, index) => (
            <article key={item.era}>
              <div><span>0{index + 1}</span><i style={{ background:ERA_COLORS[item.era] }} /></div>
              <p>{item.years}</p><h3>{item.title}</h3><strong>{item.era}</strong><small>{item.body}</small>
            </article>
          ))}
        </div>
      </section>

      <footer className={styles.dataNote}>
        <strong>Sources &amp; caveat</strong>
        <div>
          <p>This is an approximate visual transcription of the computational frontier—not a normalized product benchmark. “Moore&apos;s Law” is used here in the source chart&apos;s broader price-performance sense.</p>
          <p className={styles.sourceLinks}>
            <a href="https://commons.wikimedia.org/wiki/File:The_Moore%27s_Law_Update_%E2%80%94_for_128_years_-_54181414828.jpg">Jurvetson / Kurzweil frontier chart ↗</a>
            <a href="https://www.computerhistory.org/siliconengine/moores-law-predicts-the-future-of-integrated-circuits/">Computer History Museum ↗</a>
            <a href="https://newsroom.intel.com/press-kit/moores-law">Intel Moore&apos;s Law archive ↗</a>
          </p>
        </div>
      </footer>
    </main>
  );
}

function xScale(year:number) { return PLOT.left + ((year - START_YEAR) / (END_YEAR - START_YEAR)) * INNER_WIDTH; }
function yScale(value:number) { return PLOT.top + (1 - (Math.log10(value) - MIN_EXPONENT) / (MAX_EXPONENT - MIN_EXPONENT)) * INNER_HEIGHT; }
function guideValue(year:number) { return 10 ** (MIN_EXPONENT + ((year - START_YEAR) / (END_YEAR - START_YEAR)) * 21); }
function frontierAtYear(year:number) { const points = COMPUTE_POINTS.filter((point) => point.year <= year); return Math.max(...points.map((point) => point.cpsPerDollar)); }
function formatCompute(value:number) { const exponent = Math.floor(Math.log10(value)); const coefficient = value / 10 ** exponent; return exponent >= 4 || exponent <= -3 ? `${coefficient.toFixed(coefficient < 2 ? 1 : 0)} × 10${superscript(exponent)}` : value.toLocaleString(undefined,{maximumFractionDigits:3}); }
function formatMultiplier(value:number) { const exponent = Math.floor(Math.log10(value)); if (exponent < 4) return `${Math.round(value).toLocaleString()}×`; return `${(value / 10 ** exponent).toFixed(1)} × 10${superscript(exponent)}×`; }
function superscript(value:number) { const map:Record<string,string>={"-":"⁻","0":"⁰","1":"¹","2":"²","3":"³","4":"⁴","5":"⁵","6":"⁶","7":"⁷","8":"⁸","9":"⁹"}; return String(value).split("").map((character)=>map[character]).join(""); }
