"use client";

import { useMemo, useState } from "react";
import {
  ACTIVITY_CATEGORIES,
  COHORTS,
  START_MINUTE,
  buildTimeline,
  formatClockTime,
  getDailyHours,
  type ActivityKey,
  type Cohort,
  type TimelinePoint
} from "../data/timeUseData";
import styles from "./OneDayManyAmericas.module.css";

const SVG_WIDTH = 1120;
const SVG_HEIGHT = 560;
const CHART = {
  left: 52,
  right: 28,
  top: 22,
  bottom: 54
};
const INNER_WIDTH = SVG_WIDTH - CHART.left - CHART.right;
const INNER_HEIGHT = SVG_HEIGHT - CHART.top - CHART.bottom;
const TICKS = [0, 240, 480, 720, 960, 1200, 1440];
const ANNOTATION_CARD_WIDTH = 178;
const ANNOTATION_CARD_HEIGHT = 64;

type LayerPoint = {
  offsetMinute: number;
  y0: number;
  y1: number;
  value: number;
};

type Layer = {
  key: ActivityKey;
  label: string;
  color: string;
  points: LayerPoint[];
};

type Annotation = {
  activity: ActivityKey;
  clockMinute: number;
  title: string;
  note: string;
  dx: number;
  dy: number;
};

const ANNOTATIONS: Record<string, Annotation[]> = {
  "all-adults": [
    {
      activity: "travel",
      clockMinute: 8 * 60 + 15,
      title: "Morning motion",
      note: "Commutes and errands lift travel.",
      dx: 48,
      dy: -84
    },
    {
      activity: "paidWork",
      clockMinute: 13 * 60,
      title: "Workday core",
      note: "Paid work holds the center.",
      dx: -84,
      dy: -112
    },
    {
      activity: "media",
      clockMinute: 21 * 60,
      title: "Evening media",
      note: "TV and screens thicken late.",
      dx: -174,
      dy: -98
    }
  ],
  "full-time-workers": [
    {
      activity: "travel",
      clockMinute: 8 * 60,
      title: "Commute shoulder",
      note: "Travel rises before work.",
      dx: 40,
      dy: -86
    },
    {
      activity: "paidWork",
      clockMinute: 12 * 60,
      title: "Work plateau",
      note: "The day compresses here.",
      dx: -76,
      dy: -116
    },
    {
      activity: "leisure",
      clockMinute: 20 * 60,
      title: "Short evening",
      note: "Leisure arrives after work.",
      dx: -190,
      dy: -92
    }
  ],
  "parents-young-kids": [
    {
      activity: "care",
      clockMinute: 6 * 60 + 45,
      title: "Care starts early",
      note: "The day opens with children.",
      dx: 52,
      dy: -82
    },
    {
      activity: "paidWork",
      clockMinute: 13 * 60,
      title: "Narrower work band",
      note: "Work bends around care.",
      dx: -92,
      dy: -116
    },
    {
      activity: "care",
      clockMinute: 18 * 60 + 30,
      title: "Second shift",
      note: "Care returns after school.",
      dx: -184,
      dy: -86
    }
  ],
  "students-young-adults": [
    {
      activity: "education",
      clockMinute: 10 * 60,
      title: "School block",
      note: "Classroom time fills the day.",
      dx: 40,
      dy: -104
    },
    {
      activity: "leisure",
      clockMinute: 18 * 60,
      title: "Social evening",
      note: "Leisure opens after class.",
      dx: -178,
      dy: -106
    },
    {
      activity: "media",
      clockMinute: 22 * 60,
      title: "Late screens",
      note: "Media shifts toward night.",
      dx: -188,
      dy: -98
    }
  ],
  "older-adults": [
    {
      activity: "household",
      clockMinute: 10 * 60,
      title: "Morning household",
      note: "Home work moves earlier.",
      dx: 38,
      dy: -96
    },
    {
      activity: "leisure",
      clockMinute: 15 * 60 + 30,
      title: "Daylight leisure",
      note: "Free time peaks before evening.",
      dx: -152,
      dy: -110
    },
    {
      activity: "media",
      clockMinute: 20 * 60 + 30,
      title: "Prime-time media",
      note: "Screens take a large share.",
      dx: -190,
      dy: -92
    }
  ],
  weekends: [
    {
      activity: "sleep",
      clockMinute: 8 * 60,
      title: "Later morning",
      note: "Sleep recedes more slowly.",
      dx: 34,
      dy: -88
    },
    {
      activity: "household",
      clockMinute: 11 * 60,
      title: "Errand window",
      note: "Household work rises late.",
      dx: 28,
      dy: -104
    },
    {
      activity: "leisure",
      clockMinute: 16 * 60 + 30,
      title: "Open afternoon",
      note: "Leisure takes daylight hours.",
      dx: -168,
      dy: -118
    }
  ]
};

export function OneDayManyAmericas() {
  const [selectedKey, setSelectedKey] = useState(COHORTS[0].key);
  const [compareKey, setCompareKey] = useState(COHORTS[1].key);
  const [focusMinute, setFocusMinute] = useState(12 * 60);

  const selectedCohort = COHORTS.find((cohort) => cohort.key === selectedKey) ?? COHORTS[0];
  const comparedCohort = compareKey === "none"
    ? undefined
    : COHORTS.find((cohort) => cohort.key === compareKey && cohort.key !== selectedKey);
  const timeline = useMemo(() => buildTimeline(selectedCohort), [selectedCohort]);
  const comparedTimeline = useMemo(
    () => comparedCohort ? buildTimeline(comparedCohort) : undefined,
    [comparedCohort]
  );
  const layers = useMemo(() => buildLayers(timeline), [timeline]);
  const comparedLayers = useMemo(
    () => comparedTimeline ? buildLayers(comparedTimeline) : [],
    [comparedTimeline]
  );
  const dailyHours = useMemo(() => getDailyHours(timeline), [timeline]);
  const comparedDailyHours = useMemo(
    () => comparedTimeline ? getDailyHours(comparedTimeline) : undefined,
    [comparedTimeline]
  );
  const annotations = useMemo(
    () => layoutAnnotations(ANNOTATIONS[selectedCohort.key] ?? [], layers),
    [layers, selectedCohort.key]
  );
  const comparisonRows = useMemo(
    () => comparedDailyHours ? buildComparisonRows(dailyHours, comparedDailyHours) : [],
    [comparedDailyHours, dailyHours]
  );
  const focusPoint = timeline[Math.min(Math.round(focusMinute / 30), timeline.length - 1)];
  const topActivities = ACTIVITY_CATEGORIES
    .map((category) => ({
      ...category,
      hours: dailyHours[category.key],
      focusValue: focusPoint[category.key]
    }))
    .sort((a, b) => b.focusValue - a.focusValue);
  const comparisonLabel = comparedCohort ? comparedCohort.shortLabel : "None";

  function handleSelectedKey(nextKey: string) {
    setSelectedKey(nextKey);

    if (compareKey === nextKey) {
      setCompareKey("none");
    }
  }

  return (
    <main className={styles.shell}>
      <section className={styles.hero}>
        <div>
          <p className={styles.kicker}>American Time Use Survey concept</p>
          <h1 className={styles.title}>One Day, Many Americas</h1>
          <p className={styles.deck}>
            A day starts at 4 AM and flows through sleep, work, school, care,
            meals, travel, leisure, and media. Choose a population slice to see
            how the same 24 hours take on a different shape.
          </p>
        </div>

        <div className={styles.sourceBox}>
          <span className={styles.sourceLabel}>Data scaffold</span>
          <span>
            Rounded ATUS-style daily totals with modeled half-hour rhythms.
            Replace the targets with a BLS microdata extract before publishing
            as exact estimates.
          </span>
        </div>
      </section>

      <section className={styles.controls} aria-label="Population group">
        {COHORTS.map((cohort) => (
          <button
            className={`${styles.cohortButton} ${cohort.key === selectedKey ? styles.activeCohortButton : ""}`}
            key={cohort.key}
            onClick={() => handleSelectedKey(cohort.key)}
            type="button"
          >
            {cohort.shortLabel}
          </button>
        ))}
      </section>

      <section className={styles.workspace}>
        <div className={styles.chartPanel}>
          <div className={styles.chartHeader}>
            <div>
              <h2>{selectedCohort.label}</h2>
              <p>{selectedCohort.summary}</p>
            </div>
            <div className={styles.headerTools}>
              <label className={styles.compareControl}>
                <span>Compare</span>
                <select
                  value={comparedCohort ? comparedCohort.key : "none"}
                  onChange={(event) => setCompareKey(event.target.value)}
                >
                  <option value="none">None</option>
                  {COHORTS.filter((cohort) => cohort.key !== selectedKey).map((cohort) => (
                    <option key={cohort.key} value={cohort.key}>
                      {cohort.label}
                    </option>
                  ))}
                </select>
              </label>
              <div className={styles.timeBadge}>
                <span>{formatClockTime((START_MINUTE + focusMinute) % (24 * 60))}</span>
              </div>
            </div>
          </div>

          <svg
            className={styles.chart}
            role="img"
            viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
            onMouseLeave={() => setFocusMinute(12 * 60)}
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
            <title>{`Stacked time-use river for ${selectedCohort.label}`}</title>
            <desc>
              Each colored band shows the modeled share of the selected group
              engaged in an activity across a 24 hour day.
            </desc>

            <rect
              className={styles.plotBackground}
              x={CHART.left}
              y={CHART.top}
              width={INNER_WIDTH}
              height={INNER_HEIGHT}
              rx="8"
            />

            {[25, 50, 75, 100].map((tick) => (
              <g key={tick}>
                <line
                  className={styles.gridLine}
                  x1={CHART.left}
                  x2={SVG_WIDTH - CHART.right}
                  y1={yScale(tick)}
                  y2={yScale(tick)}
                />
                <text className={styles.yTick} x={CHART.left - 12} y={yScale(tick) + 4}>
                  {tick}%
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
                  {formatClockTime((START_MINUTE + tick) % (24 * 60))}
                </text>
              </g>
            ))}

            {layers.map((layer) => (
              <path
                className={styles.area}
                d={areaPath(layer)}
                fill={layer.color}
                key={layer.key}
              />
            ))}

            {comparedLayers.map((layer) => (
              <path
                className={styles.compareArea}
                d={areaPath(layer)}
                fill="none"
                key={`compare-${layer.key}`}
                stroke={layer.color}
              />
            ))}

            {annotations.map((annotation) => (
              <g className={styles.annotation} key={annotation.title}>
                <line
                  className={styles.annotationLeader}
                  x1={annotation.anchorX}
                  x2={annotation.labelX + ANNOTATION_CARD_WIDTH / 2}
                  y1={annotation.anchorY}
                  y2={annotation.labelY + ANNOTATION_CARD_HEIGHT / 2}
                />
                <circle
                  className={styles.annotationDot}
                  cx={annotation.anchorX}
                  cy={annotation.anchorY}
                  r="4.5"
                />
                <rect
                  className={styles.annotationCard}
                  height={ANNOTATION_CARD_HEIGHT}
                  rx="8"
                  width={ANNOTATION_CARD_WIDTH}
                  x={annotation.labelX}
                  y={annotation.labelY}
                />
                <text className={styles.annotationTitle} x={annotation.labelX + 12} y={annotation.labelY + 23}>
                  {annotation.title}
                </text>
                <text className={styles.annotationNote} x={annotation.labelX + 12} y={annotation.labelY + 44}>
                  {splitAnnotationNote(annotation.note).map((line, index) => (
                    <tspan
                      dy={index === 0 ? 0 : 14}
                      key={line}
                      x={annotation.labelX + 12}
                    >
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

          <div className={styles.legend} aria-label="Activity legend">
            {ACTIVITY_CATEGORIES.map((category) => (
              <span className={styles.legendItem} key={category.key}>
                <span
                  className={styles.swatch}
                  style={{ backgroundColor: category.color }}
                />
                {category.shortLabel}
              </span>
            ))}
          </div>
        </div>

        <aside className={styles.sidePanel}>
          <div className={styles.statBlock}>
            <span className={styles.panelLabel}>At {formatClockTime(focusPoint.clockMinute)}</span>
            <div className={styles.focusRows}>
              {topActivities.slice(0, 6).map((activity) => (
                <div className={styles.focusRow} key={activity.key}>
                  <span className={styles.focusName}>
                    <span
                      className={styles.focusSwatch}
                      style={{ backgroundColor: activity.color }}
                    />
                    {activity.label}
                  </span>
                  <span>{activity.focusValue.toFixed(0)}%</span>
                </div>
              ))}
            </div>
          </div>

          {comparedCohort && comparedDailyHours ? (
            <div className={styles.statBlock}>
              <span className={styles.panelLabel}>{selectedCohort.shortLabel} vs {comparisonLabel}</span>
              <div className={styles.compareRows}>
                {comparisonRows.slice(0, 5).map((activity) => (
                  <div className={styles.compareRow} key={activity.key}>
                    <span className={styles.compareName}>{activity.shortLabel}</span>
                    <span className={activity.delta >= 0 ? styles.positiveDelta : styles.negativeDelta}>
                      {formatDelta(activity.delta)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          <div className={styles.statBlock}>
            <span className={styles.panelLabel}>Daily hours</span>
            <div className={styles.hourRows}>
              {ACTIVITY_CATEGORIES.map((activity) => (
                <div className={styles.hourRow} key={activity.key}>
                  <div className={styles.hourLabel}>
                    <span>{activity.shortLabel}</span>
                    <span>{dailyHours[activity.key].toFixed(1)}h</span>
                  </div>
                  <div className={styles.hourTrack}>
                    <span
                      className={styles.hourFill}
                      style={{
                        backgroundColor: activity.color,
                        width: `${dailyHours[activity.key] / 10 * 100}%`
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </section>

      <section className={styles.cohortGrid} aria-label="Cohort comparison">
        {COHORTS.map((cohort) => (
          <button
            className={`${styles.cohortTile} ${cohort.key === selectedKey ? styles.activeTile : ""}`}
            key={cohort.key}
            onClick={() => handleSelectedKey(cohort.key)}
            type="button"
          >
            <span className={styles.tileName}>{cohort.label}</span>
            <ActivityStack cohort={cohort} />
          </button>
        ))}
      </section>
    </main>
  );
}

function ActivityStack({ cohort }: { cohort: Cohort }) {
  return (
    <span className={styles.stackBar} aria-hidden="true">
      {ACTIVITY_CATEGORIES.map((category) => (
        <span
          key={category.key}
          style={{
            backgroundColor: category.color,
            width: `${cohort.targets[category.key] / 24 * 100}%`
          }}
        />
      ))}
    </span>
  );
}

function buildComparisonRows(
  dailyHours: Record<ActivityKey, number>,
  comparedDailyHours: Record<ActivityKey, number>
) {
  return ACTIVITY_CATEGORIES
    .map((activity) => ({
      ...activity,
      delta: dailyHours[activity.key] - comparedDailyHours[activity.key]
    }))
    .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));
}

function formatDelta(delta: number): string {
  const sign = delta >= 0 ? "+" : "";
  return `${sign}${delta.toFixed(1)}h`;
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

function layoutAnnotations(annotations: Annotation[], layers: Layer[]) {
  return annotations.map((annotation) => {
    const offsetMinute = clockToOffset(annotation.clockMinute);
    const anchor = getBandCenter(layers, annotation.activity, offsetMinute);
    const labelX = clamp(
      anchor.x + annotation.dx,
      CHART.left + 10,
      SVG_WIDTH - CHART.right - ANNOTATION_CARD_WIDTH - 10
    );
    const labelY = clamp(
      anchor.y + annotation.dy,
      CHART.top + 10,
      SVG_HEIGHT - CHART.bottom - ANNOTATION_CARD_HEIGHT - 10
    );

    return {
      ...annotation,
      anchorX: anchor.x,
      anchorY: anchor.y,
      labelX,
      labelY
    };
  });
}

function getBandCenter(layers: Layer[], activityKey: ActivityKey, offsetMinute: number) {
  const layer = layers.find((candidate) => candidate.key === activityKey);
  const point = layer?.points.reduce((closest, candidate) => {
    const closestDistance = Math.abs(closest.offsetMinute - offsetMinute);
    const candidateDistance = Math.abs(candidate.offsetMinute - offsetMinute);
    return candidateDistance < closestDistance ? candidate : closest;
  });

  if (!point) {
    return {
      x: xScale(offsetMinute),
      y: yScale(50)
    };
  }

  return {
    x: xScale(point.offsetMinute),
    y: yScale((point.y0 + point.y1) / 2)
  };
}

function clockToOffset(clockMinute: number): number {
  return ((clockMinute - START_MINUTE) + 24 * 60) % (24 * 60);
}

function buildLayers(points: TimelinePoint[]): Layer[] {
  return ACTIVITY_CATEGORIES.map((category) => {
    const layerPoints = points.map((point) => {
      let y0 = 0;
      for (const previous of ACTIVITY_CATEGORIES) {
        if (previous.key === category.key) {
          break;
        }
        y0 += point[previous.key];
      }

      const value = point[category.key];
      return {
        offsetMinute: point.offsetMinute,
        y0,
        y1: y0 + value,
        value
      };
    });

    return {
      key: category.key,
      label: category.label,
      color: category.color,
      points: layerPoints
    };
  });
}

function areaPath(layer: Layer): string {
  const top = layer.points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${xScale(point.offsetMinute).toFixed(2)} ${yScale(point.y1).toFixed(2)}`)
    .join(" ");
  const bottom = [...layer.points]
    .reverse()
    .map((point) => `L ${xScale(point.offsetMinute).toFixed(2)} ${yScale(point.y0).toFixed(2)}`)
    .join(" ");

  return `${top} ${bottom} Z`;
}

function xScale(offsetMinute: number): number {
  return CHART.left + offsetMinute / 1440 * INNER_WIDTH;
}

function yScale(percent: number): number {
  return CHART.top + INNER_HEIGHT - percent / 100 * INNER_HEIGHT;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
