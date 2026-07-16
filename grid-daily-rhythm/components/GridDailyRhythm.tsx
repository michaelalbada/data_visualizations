"use client";

import { useMemo, useState } from "react";
import {
  GRID_REGIONS,
  POWER_SOURCES,
  buildGridTimeline,
  formatClockTime,
  getDailyEnergy,
  type GridPoint,
  type GridRegion,
  type SourceKey
} from "../data/gridData";
import styles from "./GridDailyRhythm.module.css";

const SVG_WIDTH = 1160;
const SVG_HEIGHT = 560;
const CHART = {
  left: 66,
  right: 28,
  top: 30,
  bottom: 54
};
const INNER_WIDTH = SVG_WIDTH - CHART.left - CHART.right;
const INNER_HEIGHT = SVG_HEIGHT - CHART.top - CHART.bottom;
const TICKS = [0, 240, 480, 720, 960, 1200, 1440];

const GRID_NODES: Record<SourceKey | "load", { x: number; y: number; label: string }> = {
  solar: { x: 92, y: 250, label: "Solar fields" },
  wind: { x: 126, y: 82, label: "Wind belt" },
  nuclear: { x: 315, y: 92, label: "Nuclear" },
  hydro: { x: 84, y: 410, label: "Hydro" },
  imports: { x: 392, y: 178, label: "Imports" },
  battery: { x: 326, y: 406, label: "Storage" },
  gas: { x: 438, y: 322, label: "Gas fleet" },
  load: { x: 244, y: 270, label: "Load center" }
};

type LayerPoint = {
  offsetMinute: number;
  y0: number;
  y1: number;
  value: number;
};

type Layer = {
  key: SourceKey;
  label: string;
  color: string;
  points: LayerPoint[];
};

type ChartAnnotation = {
  source: SourceKey | "demand";
  clockMinute: number;
  title: string;
  note: string;
  dx: number;
  dy: number;
};

const ANNOTATIONS: Record<string, ChartAnnotation[]> = {
  "california-spring": [
    {
      source: "solar",
      clockMinute: 12 * 60 + 30,
      title: "Solar noon",
      note: "Midday supply gets very clean.",
      dx: -62,
      dy: -118
    },
    {
      source: "battery",
      clockMinute: 20 * 60,
      title: "Evening handoff",
      note: "Storage helps cover the ramp.",
      dx: -214,
      dy: -96
    }
  ],
  "texas-summer": [
    {
      source: "demand",
      clockMinute: 17 * 60,
      title: "Heat peak",
      note: "Demand rises into evening.",
      dx: -194,
      dy: -112
    },
    {
      source: "gas",
      clockMinute: 20 * 60,
      title: "Flexible engine",
      note: "Gas fills the hottest hours.",
      dx: -202,
      dy: -88
    }
  ],
  "midwest-winter": [
    {
      source: "wind",
      clockMinute: 22 * 60,
      title: "Wind shoulder",
      note: "Wind carries much of night.",
      dx: -190,
      dy: -108
    },
    {
      source: "gas",
      clockMinute: 8 * 60,
      title: "Cold morning",
      note: "Flexible supply fills the peak.",
      dx: 36,
      dy: -104
    }
  ],
  "northeast-peak": [
    {
      source: "imports",
      clockMinute: 18 * 60,
      title: "Neighbors matter",
      note: "Imports rise near the peak.",
      dx: -184,
      dy: -116
    },
    {
      source: "nuclear",
      clockMinute: 10 * 60,
      title: "Firm base",
      note: "Nuclear holds steady all day.",
      dx: 42,
      dy: -96
    }
  ]
};

export function GridDailyRhythm() {
  const [selectedKey, setSelectedKey] = useState(GRID_REGIONS[0].key);
  const [focusMinute, setFocusMinute] = useState(18 * 60);
  const selectedRegion = GRID_REGIONS.find((region) => region.key === selectedKey) ?? GRID_REGIONS[0];
  const timeline = useMemo(() => buildGridTimeline(selectedRegion), [selectedRegion]);
  const layers = useMemo(() => buildLayers(timeline), [timeline]);
  const dailyEnergy = useMemo(() => getDailyEnergy(timeline), [timeline]);
  const maxGw = useMemo(
    () => Math.ceil(Math.max(...timeline.map((point) => point.demand)) * 1.15 / 10) * 10,
    [timeline]
  );
  const focusPoint = timeline[Math.min(Math.round(focusMinute / 30), timeline.length - 1)];
  const sourceRows = POWER_SOURCES
    .map((source) => ({
      ...source,
      value: focusPoint[source.key],
      energy: dailyEnergy[source.key]
    }))
    .sort((a, b) => b.value - a.value);
  const annotations = useMemo(
    () => layoutAnnotations(ANNOTATIONS[selectedRegion.key] ?? [], layers, timeline, maxGw),
    [layers, maxGw, selectedRegion.key, timeline]
  );
  const totalEnergy = POWER_SOURCES.reduce((sum, source) => sum + dailyEnergy[source.key], 0);

  return (
    <main className={styles.shell}>
      <section className={styles.hero}>
        <div>
          <p className={styles.kicker}>Modeled electric grid</p>
          <h1 className={styles.title}>The Grid&apos;s Daily Rhythm</h1>
          <p className={styles.deck}>
            Electricity is not one flow. It is a choreography of sun, wind,
            thermal plants, reservoirs, batteries, imports, and demand. Scrub
            across the day to watch the system change shape.
          </p>
        </div>

        <div className={styles.sourceBox}>
          <span className={styles.sourceLabel}>Data scaffold</span>
          <span>
            Modeled hourly profiles inspired by public grid data. Replace with
            EIA or balancing-authority data before publishing as exact history.
          </span>
        </div>
      </section>

      <section className={styles.controls} aria-label="Grid region">
        {GRID_REGIONS.map((region) => (
          <button
            className={`${styles.regionButton} ${region.key === selectedKey ? styles.activeRegionButton : ""}`}
            key={region.key}
            onClick={() => setSelectedKey(region.key)}
            type="button"
          >
            {region.shortLabel}
          </button>
        ))}
      </section>

      <section className={styles.workspace}>
        <div className={styles.chartPanel}>
          <div className={styles.chartHeader}>
            <div>
              <h2>{selectedRegion.label}</h2>
              <p>{selectedRegion.summary}</p>
            </div>
            <div className={styles.timeBadge}>
              <span>{formatClockTime(focusPoint.clockMinute)}</span>
            </div>
          </div>

          <svg
            className={styles.chart}
            role="img"
            viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
            onMouseLeave={() => setFocusMinute(18 * 60)}
            onMouseMove={(event) => {
              const rect = event.currentTarget.getBoundingClientRect();
              const viewBoxX = (event.clientX - rect.left) / rect.width * SVG_WIDTH;
              const nextMinute = clamp(
                Math.round((viewBoxX - CHART.left) / INNER_WIDTH * 1440 / 30) * 30,
                0,
                1440
              );
              setFocusMinute(nextMinute);
            }}
          >
            <title>{`Electricity supply mix for ${selectedRegion.label}`}</title>
            <desc>
              A stacked area chart shows generation sources through a 24 hour
              day, with demand and net load drawn as lines.
            </desc>

            <rect
              className={styles.plotBackground}
              height={INNER_HEIGHT}
              rx="8"
              width={INNER_WIDTH}
              x={CHART.left}
              y={CHART.top}
            />

            {buildGwTicks(maxGw).map((tick) => (
              <g key={tick}>
                <line
                  className={styles.gridLine}
                  x1={CHART.left}
                  x2={SVG_WIDTH - CHART.right}
                  y1={yScale(tick, maxGw)}
                  y2={yScale(tick, maxGw)}
                />
                <text className={styles.yTick} x={CHART.left - 12} y={yScale(tick, maxGw) + 4}>
                  {tick} GW
                </text>
              </g>
            ))}

            {TICKS.map((tick) => (
              <g key={tick}>
                <line
                  className={styles.xGridLine}
                  x1={xScale(tick)}
                  x2={xScale(tick)}
                  y1={CHART.top}
                  y2={SVG_HEIGHT - CHART.bottom}
                />
                <text className={styles.xTick} x={xScale(tick)} y={SVG_HEIGHT - 20}>
                  {formatClockTime(tick)}
                </text>
              </g>
            ))}

            {layers.map((layer) => (
              <path
                className={styles.area}
                d={areaPath(layer, maxGw)}
                fill={layer.color}
                key={layer.key}
              />
            ))}

            <path className={styles.demandLine} d={linePath(timeline, "demand", maxGw)} />
            <path className={styles.netLoadLine} d={linePath(timeline, "netLoad", maxGw)} />

            {annotations.map((annotation) => (
              <g className={styles.annotation} key={annotation.title}>
                <line
                  className={styles.annotationLeader}
                  x1={annotation.anchorX}
                  x2={annotation.labelX + 84}
                  y1={annotation.anchorY}
                  y2={annotation.labelY + 28}
                />
                <circle
                  className={styles.annotationDot}
                  cx={annotation.anchorX}
                  cy={annotation.anchorY}
                  r="4.5"
                />
                <rect
                  className={styles.annotationCard}
                  height="64"
                  rx="8"
                  width="168"
                  x={annotation.labelX}
                  y={annotation.labelY}
                />
                <text className={styles.annotationTitle} x={annotation.labelX + 12} y={annotation.labelY + 22}>
                  {annotation.title}
                </text>
                <text className={styles.annotationNote} x={annotation.labelX + 12} y={annotation.labelY + 41}>
                  {splitAnnotationNote(annotation.note).map((line, index) => (
                    <tspan dy={index === 0 ? 0 : 14} key={line} x={annotation.labelX + 12}>
                      {line}
                    </tspan>
                  ))}
                </text>
              </g>
            ))}

            <line
              className={styles.focusLine}
              x1={xScale(focusMinute)}
              x2={xScale(focusMinute)}
              y1={CHART.top}
              y2={SVG_HEIGHT - CHART.bottom}
            />
          </svg>

          <div className={styles.legend} aria-label="Chart legend">
            {POWER_SOURCES.map((source) => (
              <span className={styles.legendItem} key={source.key}>
                <span className={styles.swatch} style={{ backgroundColor: source.color }} />
                {source.shortLabel}
              </span>
            ))}
            <span className={styles.lineLegend}>Demand</span>
            <span className={styles.netLegend}>Net load</span>
          </div>
        </div>

        <aside className={styles.sidePanel}>
          <GridMap point={focusPoint} />

          <div className={styles.metricGrid}>
            <Metric label="Demand" value={`${focusPoint.demand.toFixed(1)} GW`} />
            <Metric label="Net load" value={`${focusPoint.netLoad.toFixed(1)} GW`} />
            <Metric label="Clean share" value={`${Math.round(focusPoint.cleanShare * 100)}%`} />
            <Metric label="Carbon proxy" value={`${focusPoint.carbonRate.toFixed(2)} t/MWh`} />
          </div>

          <div className={styles.statBlock}>
            <span className={styles.panelLabel}>At {formatClockTime(focusPoint.clockMinute)}</span>
            <div className={styles.sourceRows}>
              {sourceRows.map((source) => (
                <div className={styles.sourceRow} key={source.key}>
                  <span className={styles.sourceName}>
                    <span className={styles.sourceSwatch} style={{ backgroundColor: source.color }} />
                    {source.shortLabel}
                  </span>
                  <span>{source.value.toFixed(1)} GW</span>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.statBlock}>
            <span className={styles.panelLabel}>Daily energy</span>
            <div className={styles.energyRows}>
              {POWER_SOURCES.map((source) => (
                <div className={styles.energyRow} key={source.key}>
                  <div className={styles.energyLabel}>
                    <span>{source.shortLabel}</span>
                    <span>{Math.round(dailyEnergy[source.key])} GWh</span>
                  </div>
                  <div className={styles.energyTrack}>
                    <span
                      className={styles.energyFill}
                      style={{
                        backgroundColor: source.color,
                        width: `${dailyEnergy[source.key] / totalEnergy * 100}%`
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className={styles.metric}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function splitAnnotationNote(note: string): string[] {
  const words = note.split(" ");
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;

    if (candidate.length <= 24) {
      current = candidate;
    } else {
      lines.push(current);
      current = word;
    }
  }

  if (current) {
    lines.push(current);
  }

  return lines.slice(0, 2);
}

function GridMap({ point }: { point: GridPoint }) {
  const maxSource = Math.max(...POWER_SOURCES.map((source) => point[source.key]));

  return (
    <div className={styles.mapPanel}>
      <div className={styles.mapHeader}>
        <span className={styles.panelLabel}>Grid flow</span>
        <span>{formatClockTime(point.clockMinute)}</span>
      </div>
      <svg className={styles.gridMap} viewBox="0 0 520 500" role="img">
        <title>{`Modeled grid flow at ${formatClockTime(point.clockMinute)}`}</title>
        <desc>
          Source nodes send animated flows toward a central load node. Stroke
          width reflects current modeled generation.
        </desc>
        <rect className={styles.mapBackground} x="12" y="12" width="496" height="476" rx="8" />
        {POWER_SOURCES.map((source) => {
          const node = GRID_NODES[source.key];
          const load = GRID_NODES.load;
          const value = point[source.key];
          const width = 1.4 + value / maxSource * 8.8;

          return (
            <path
              className={styles.flowLine}
              d={`M ${node.x} ${node.y} C ${(node.x + load.x) / 2} ${node.y}, ${(node.x + load.x) / 2} ${load.y}, ${load.x} ${load.y}`}
              key={source.key}
              stroke={source.color}
              strokeWidth={width}
            />
          );
        })}

        <circle className={styles.loadHalo} cx={GRID_NODES.load.x} cy={GRID_NODES.load.y} r="54" />
        <circle className={styles.loadNode} cx={GRID_NODES.load.x} cy={GRID_NODES.load.y} r="34" />
        <text className={styles.loadLabel} x={GRID_NODES.load.x} y={GRID_NODES.load.y - 4}>
          Load
        </text>
        <text className={styles.loadValue} x={GRID_NODES.load.x} y={GRID_NODES.load.y + 17}>
          {point.demand.toFixed(0)} GW
        </text>

        {POWER_SOURCES.map((source) => {
          const node = GRID_NODES[source.key];
          const radius = 13 + point[source.key] / maxSource * 17;

          return (
            <g key={source.key}>
              <circle
                className={styles.sourceNode}
                cx={node.x}
                cy={node.y}
                fill={source.color}
                r={radius}
              />
              <text className={styles.nodeLabel} x={node.x} y={node.y + radius + 20}>
                {source.shortLabel}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function buildLayers(points: GridPoint[]): Layer[] {
  return POWER_SOURCES.map((source) => {
    const layerPoints = points.map((point) => {
      let y0 = 0;

      for (const previous of POWER_SOURCES) {
        if (previous.key === source.key) {
          break;
        }

        y0 += point[previous.key];
      }

      const value = point[source.key];
      return {
        offsetMinute: point.offsetMinute,
        y0,
        y1: y0 + value,
        value
      };
    });

    return {
      key: source.key,
      label: source.label,
      color: source.color,
      points: layerPoints
    };
  });
}

function layoutAnnotations(
  annotations: ChartAnnotation[],
  layers: Layer[],
  points: GridPoint[],
  maxGw: number
) {
  return annotations.map((annotation) => {
    const offsetMinute = annotation.clockMinute;
    const anchor = annotation.source === "demand"
      ? getLinePoint(points, offsetMinute, "demand", maxGw)
      : getBandCenter(layers, annotation.source, offsetMinute, maxGw);
    const labelX = clamp(anchor.x + annotation.dx, CHART.left + 10, SVG_WIDTH - CHART.right - 178);
    const labelY = clamp(anchor.y + annotation.dy, CHART.top + 10, SVG_HEIGHT - CHART.bottom - 68);

    return {
      ...annotation,
      anchorX: anchor.x,
      anchorY: anchor.y,
      labelX,
      labelY
    };
  });
}

function getBandCenter(layers: Layer[], sourceKey: SourceKey, offsetMinute: number, maxGw: number) {
  const layer = layers.find((candidate) => candidate.key === sourceKey);
  const point = layer?.points.reduce((closest, candidate) => {
    const closestDistance = Math.abs(closest.offsetMinute - offsetMinute);
    const candidateDistance = Math.abs(candidate.offsetMinute - offsetMinute);
    return candidateDistance < closestDistance ? candidate : closest;
  });

  if (!point) {
    return {
      x: xScale(offsetMinute),
      y: yScale(maxGw / 2, maxGw)
    };
  }

  return {
    x: xScale(point.offsetMinute),
    y: yScale((point.y0 + point.y1) / 2, maxGw)
  };
}

function getLinePoint(points: GridPoint[], offsetMinute: number, key: "demand" | "netLoad", maxGw: number) {
  const point = points.reduce((closest, candidate) => {
    const closestDistance = Math.abs(closest.offsetMinute - offsetMinute);
    const candidateDistance = Math.abs(candidate.offsetMinute - offsetMinute);
    return candidateDistance < closestDistance ? candidate : closest;
  });

  return {
    x: xScale(point.offsetMinute),
    y: yScale(point[key], maxGw)
  };
}

function areaPath(layer: Layer, maxGw: number): string {
  const top = layer.points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${xScale(point.offsetMinute).toFixed(2)} ${yScale(point.y1, maxGw).toFixed(2)}`)
    .join(" ");
  const bottom = [...layer.points]
    .reverse()
    .map((point) => `L ${xScale(point.offsetMinute).toFixed(2)} ${yScale(point.y0, maxGw).toFixed(2)}`)
    .join(" ");

  return `${top} ${bottom} Z`;
}

function linePath(points: GridPoint[], key: "demand" | "netLoad", maxGw: number): string {
  return points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${xScale(point.offsetMinute).toFixed(2)} ${yScale(point[key], maxGw).toFixed(2)}`)
    .join(" ");
}

function buildGwTicks(maxGw: number): number[] {
  const step = maxGw <= 50 ? 10 : 20;
  const ticks: number[] = [];

  for (let tick = 0; tick <= maxGw; tick += step) {
    ticks.push(tick);
  }

  return ticks;
}

function xScale(offsetMinute: number): number {
  return CHART.left + offsetMinute / 1440 * INNER_WIDTH;
}

function yScale(gw: number, maxGw: number): number {
  return CHART.top + INNER_HEIGHT - gw / maxGw * INNER_HEIGHT;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
