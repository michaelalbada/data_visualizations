"use client";

import { useEffect, useMemo, useState } from "react";
import { STORIES, type MotionPoint, type Story } from "../data/motionData";
import styles from "./MotionAtlas.module.css";

const WIDTH = 980;
const HEIGHT = 620;
const PLOT = { left: 92, right: 32, top: 28, bottom: 82 };
const INNER_WIDTH = WIDTH - PLOT.left - PLOT.right;
const INNER_HEIGHT = HEIGHT - PLOT.top - PLOT.bottom;

export function MotionAtlas() {
  const [storyId, setStoryId] = useState<Story["id"]>("energy");
  const [frameIndex, setFrameIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [focusId, setFocusId] = useState("gbr");
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [showTrails, setShowTrails] = useState(true);
  const story = STORIES.find((candidate) => candidate.id === storyId) ?? STORIES[0];
  const frame = story.frames[frameIndex];

  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => {
      setFrameIndex((current) => {
        if (current >= story.frames.length - 1) {
          setPlaying(false);
          return current;
        }
        return current + 1;
      });
    }, 560);
    return () => window.clearInterval(timer);
  }, [playing, story.frames.length]);

  const maxSize = useMemo(
    () => Math.max(...story.frames.flatMap((candidate) => candidate.points.map((point) => point.size))),
    [story]
  );
  const activeId = hoverId ?? focusId;
  const activePoint = frame.points.find((point) => point.id === activeId) ?? frame.points[0];
  const firstPoint = story.frames[0].points.find((point) => point.id === activePoint.id) ?? activePoint;

  function selectStory(nextStory: Story) {
    setStoryId(nextStory.id);
    setFrameIndex(0);
    setPlaying(false);
    setHoverId(null);
    setFocusId(Object.keys(nextStory.callouts)[0] ?? nextStory.frames[0].points[0].id);
  }

  function togglePlayback() {
    if (!playing && frameIndex === story.frames.length - 1) setFrameIndex(0);
    setPlaying((current) => !current);
  }

  const x = (value: number) => {
    const [min, max] = story.xDomain;
    const ratio = story.xScale === "log"
      ? (Math.log(value) - Math.log(min)) / (Math.log(max) - Math.log(min))
      : (value - min) / (max - min);
    return PLOT.left + ratio * INNER_WIDTH;
  };
  const y = (value: number) => {
    const [min, max] = story.yDomain;
    return PLOT.top + (1 - (value - min) / (max - min)) * INNER_HEIGHT;
  };
  const radius = (value: number) => 6 + Math.sqrt(value / maxSize) * 36;
  const ticksX = story.xScale === "log"
    ? [2000, 5000, 10000, 25000, 50000, 90000]
    : makeTicks(story.xDomain, 5);
  const ticksY = makeTicks(story.yDomain, 5);

  return (
    <main className={styles.shell}>
      <header className={styles.hero}>
        <div>
          <p className={styles.kicker}>Motion atlas · three systems over time</p>
          <h1>Motion Scatterplots.</h1>
        </div>
        <p className={styles.intro}>
          A set of animated field studies inspired by Hans Rosling. Every dot is a persistent
          character; its position, scale, and path reveal a changing system.
        </p>
      </header>

      <nav className={styles.storyTabs} aria-label="Motion studies">
        {STORIES.map((candidate, index) => (
          <button
            aria-current={candidate.id === story.id ? "page" : undefined}
            className={candidate.id === story.id ? styles.activeTab : ""}
            key={candidate.id}
            onClick={() => selectStory(candidate)}
            type="button"
          >
            <span>0{index + 1}</span>
            {candidate.shortTitle}
          </button>
        ))}
      </nav>

      <section className={styles.workspace}>
        <div className={styles.chartCard}>
          <div className={styles.studyHeader}>
            <div>
              <p className={styles.eyebrow}>{story.eyebrow}</p>
              <h2>{story.title}</h2>
              <p>{story.description}</p>
            </div>
            <aside>
              <span>Question in motion</span>
              <strong>{story.question}</strong>
            </aside>
          </div>
          <div className={styles.chartTopline}>
            <div className={styles.legend} aria-label="Color legend">
              {Object.entries(story.groups).map(([group, color]) => (
                <span key={group}><i style={{ background: color }} />{group}</span>
              ))}
            </div>
            <button
              aria-pressed={showTrails}
              className={styles.trailToggle}
              onClick={() => setShowTrails((current) => !current)}
              type="button"
            >
              {showTrails ? "Trails on" : "Trails off"}
            </button>
          </div>

          <div className={styles.chartWrap}>
            <svg
              aria-label={`${story.title}, animated bubble chart for ${frame.label}`}
              className={styles.chart}
              role="img"
              viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
            >
              <rect className={styles.plotBackground} height={INNER_HEIGHT} width={INNER_WIDTH} x={PLOT.left} y={PLOT.top} />

              {ticksY.map((tick) => (
                <g key={`y-${tick}`}>
                  <line className={styles.gridLine} x1={PLOT.left} x2={WIDTH - PLOT.right} y1={y(tick)} y2={y(tick)} />
                  <text className={styles.yTick} x={PLOT.left - 14} y={y(tick) + 5}>{story.formatY(tick)}</text>
                </g>
              ))}
              {ticksX.map((tick) => (
                <g key={`x-${tick}`}>
                  <line className={styles.gridLine} x1={x(tick)} x2={x(tick)} y1={PLOT.top} y2={HEIGHT - PLOT.bottom} />
                  <text className={styles.xTick} x={x(tick)} y={HEIGHT - PLOT.bottom + 27}>{story.formatX(tick)}</text>
                </g>
              ))}

              <text className={styles.yAxisLabel} transform={`translate(24 ${PLOT.top + INNER_HEIGHT / 2}) rotate(-90)`}>{story.yLabel}</text>
              <text className={styles.xAxisLabel} x={PLOT.left + INNER_WIDTH / 2} y={HEIGHT - 18}>{story.xLabel}</text>
              <text className={styles.yearWatermark} x={WIDTH - PLOT.right - 6} y={HEIGHT - PLOT.bottom - 18}>{frame.label}</text>

              {showTrails && frame.points.map((point) => {
                const points = story.frames
                  .slice(0, frameIndex + 1)
                  .map((candidate) => candidate.points.find((item) => item.id === point.id))
                  .filter((item): item is MotionPoint => Boolean(item));
                return (
                  <polyline
                    className={`${styles.trail} ${point.id === activeId ? styles.activeTrail : ""}`}
                    key={`trail-${point.id}`}
                    points={points.map((item) => `${x(item.x)},${y(item.y)}`).join(" ")}
                    style={{ stroke: story.groups[point.group] }}
                  />
                );
              })}

              {frame.points
                .slice()
                .sort((a, b) => b.size - a.size)
                .map((point) => {
                  const isActive = point.id === activeId;
                  const isNamed = isActive || Object.prototype.hasOwnProperty.call(story.callouts, point.id);
                  return (
                    <g key={point.id}>
                      <circle
                        aria-label={`${point.label}: ${story.formatX(point.x)}, ${story.formatY(point.y)}, ${story.formatSize(point.size)}`}
                        className={`${styles.bubble} ${isActive ? styles.activeBubble : ""}`}
                        cx={x(point.x)}
                        cy={y(point.y)}
                        fill={story.groups[point.group]}
                        onBlur={() => setHoverId(null)}
                        onClick={() => setFocusId(point.id)}
                        onFocus={() => setHoverId(point.id)}
                        onMouseEnter={() => setHoverId(point.id)}
                        onMouseLeave={() => setHoverId(null)}
                        r={radius(point.size)}
                        role="button"
                        stroke={isActive ? "#17211d" : "#fffdf7"}
                        strokeWidth={isActive ? 4 : 2}
                        tabIndex={0}
                      />
                      {isNamed && (
                        <text
                          className={`${styles.pointLabel} ${isActive ? styles.activePointLabel : ""}`}
                          x={x(point.x) + radius(point.size) + 7}
                          y={y(point.y) + 4}
                        >
                          {point.label}
                        </text>
                      )}
                    </g>
                  );
                })}
            </svg>
          </div>

          <div className={styles.transport}>
            <button className={styles.playButton} onClick={togglePlayback} type="button">
              <span aria-hidden="true">{playing ? "Ⅱ" : "▶"}</span>
              {playing ? "Pause" : frameIndex === story.frames.length - 1 ? "Replay" : "Play"}
            </button>
            <label>
              <span className={styles.srOnly}>Time</span>
              <input
                aria-valuetext={frame.label}
                max={story.frames.length - 1}
                min={0}
                onChange={(event) => {
                  setPlaying(false);
                  setFrameIndex(Number(event.target.value));
                }}
                step={1}
                type="range"
                value={frameIndex}
              />
              <span className={styles.timelineLabels}>
                {timelineMilestones(story.frames).map(({ frame: candidate, index }) => (
                  <i
                    key={candidate.label}
                    style={{ left: `${(index / (story.frames.length - 1)) * 100}%` }}
                  >
                    {candidate.label}
                  </i>
                ))}
              </span>
            </label>
          </div>
        </div>

        <aside className={styles.inspector}>
          <div className={styles.inspectorHead}>
            <span style={{ background: story.groups[activePoint.group] }} />
            <div>
              <p>{activePoint.group} · {frame.label}</p>
              <h3>{activePoint.label}</h3>
            </div>
          </div>

          <dl>
            <div><dt>{story.xLabel.split(" · ")[0]}</dt><dd>{story.formatX(activePoint.x)}</dd></div>
            <div><dt>{story.yLabel.split(" · ")[0]}</dt><dd>{story.formatY(activePoint.y)}</dd></div>
            <div><dt>{story.sizeLabel}</dt><dd>{story.formatSize(activePoint.size)}</dd></div>
          </dl>

          <div className={styles.deltaBlock}>
            <span>Since {story.frames[0].label}</span>
            <div>
              <strong>{signedChange(activePoint.x, firstPoint.x, story.formatX)}</strong>
              <small>x-axis</small>
            </div>
            <div>
              <strong>{signedChange(activePoint.y, firstPoint.y, story.formatY)}</strong>
              <small>y-axis</small>
            </div>
          </div>

          <blockquote>
            {story.callouts[activePoint.id] ?? "Select a named trajectory to follow its path through the system."}
          </blockquote>
          <p className={styles.interactionHint}>Hover to inspect. Click to pin a dot. Turn trails off to see the field more clearly.</p>
        </aside>
      </section>

      <footer className={styles.dataNote}>
        <strong>Sources &amp; method</strong>
        <div>
          <p>
            {story.method} Sources:
          </p>
          <p className={styles.sourceLinks}>
            {story.sources.map((source) => (
              <a href={source.href} key={source.href}>{source.label}</a>
            ))}
          </p>
        </div>
      </footer>
    </main>
  );
}

function makeTicks(domain: [number, number], count: number) {
  const [min, max] = domain;
  return Array.from({ length: count + 1 }, (_, index) => min + ((max - min) * index) / count);
}

function signedChange(value: number, baseline: number, formatter: (value: number) => string) {
  const delta = value - baseline;
  return `${delta > 0 ? "+" : ""}${formatter(delta)}`;
}

function timelineMilestones(frames: Story["frames"]) {
  return frames
    .map((frame, index) => ({ frame, index }))
    .filter(({ frame, index }) => (
      index === 0 ||
      index === frames.length - 1 ||
      Number(frame.label) % 5 === 0
    ));
}
