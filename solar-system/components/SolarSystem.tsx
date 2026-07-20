"use client";

import { useEffect, useMemo, useState } from "react";
import {
  EPOCH,
  MAX_DAYS,
  PLANETS,
  dateFromElapsedDays,
  planetPosition,
  type Planet
} from "../data/solarData";
import styles from "./SolarSystem.module.css";

const WIDTH = 960;
const HEIGHT = 760;
const CENTER = { x: 470, y: 380 };
const MAX_AU = PLANETS[PLANETS.length - 1].semiMajorAU;
const NEPTUNE_YEAR_DAYS = PLANETS[PLANETS.length - 1].periodDays;
const MAX_ORBITS_IN_NEPTUNE_YEAR = NEPTUNE_YEAR_DAYS / PLANETS[0].periodDays;
const STARS = Array.from({ length: 76 }, (_, index) => ({
  x: (index * 137.51 + 23) % WIDTH,
  y: (index * 83.17 + 41) % HEIGHT,
  radius: 0.45 + (index % 4) * 0.28,
  opacity: 0.22 + (index % 5) * 0.11
}));

type DistanceMode = "legible" | "linear";
type SizeMode = "readable" | "relative";

export function SolarSystem() {
  const [elapsedDays, setElapsedDays] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [daysPerTick, setDaysPerTick] = useState(4);
  const [selectedId, setSelectedId] = useState("earth");
  const [distanceMode, setDistanceMode] = useState<DistanceMode>("legible");
  const [sizeMode, setSizeMode] = useState<SizeMode>("readable");
  const selected = PLANETS.find((planet) => planet.id === selectedId) ?? PLANETS[2];
  const currentDate = useMemo(() => dateFromElapsedDays(elapsedDays), [elapsedDays]);

  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => {
      setElapsedDays((current) => (current + daysPerTick) % (MAX_DAYS + 1));
    }, 70);
    return () => window.clearInterval(timer);
  }, [daysPerTick, playing]);

  const orbitRadius = (distanceAU: number) => distanceMode === "linear"
    ? 27 + (distanceAU / MAX_AU) * 325
    : 53 + (Math.log1p(distanceAU * 2.4) / Math.log1p(MAX_AU * 2.4)) * 299;

  const planetRadius = (planet: Planet) => sizeMode === "relative"
    ? Math.max(2.7, Math.sqrt(planet.radiusKm / 6371) * 6.4)
    : 6.2 + Math.log1p(planet.radiusKm / 2400) * 3.6;

  function screenPosition(planet: Planet) {
    const position = planetPosition(planet, elapsedDays);
    const scale = orbitRadius(planet.semiMajorAU) / planet.semiMajorAU;
    return {
      x: CENTER.x + position.x * scale,
      y: CENTER.y + position.y * scale
    };
  }

  return (
    <main className={styles.shell}>
      <header className={styles.hero}>
        <div>
          <p className={styles.kicker}>Eight worlds · one star · many clocks</p>
          <h1>The long year.</h1>
        </div>
        <div className={styles.heroCopy}>
          <p>
            The Solar System is not a lineup. It is a set of rhythms nested inside an
            almost inconceivable amount of empty space.
          </p>
          <div className={styles.heroRule}>
            <span>Start the clock</span>
            <i />
          </div>
        </div>
      </header>

      <section className={styles.workspace}>
        <div className={styles.orbitCard}>
          <div className={styles.chartIntro}>
            <div><p className={styles.eyebrow}>Orbital study · one Neptune year</p><h2>Everyone is falling at a different speed.</h2></div>
            <p>Run one Neptune year. Mercury loops thousands of times while the outermost planet completes one circuit. Select any world to follow its local year.</p>
          </div>
          <div className={styles.chartHeader}>
            <div>
              <span>Heliocentric date</span>
              <strong>{formatDate(currentDate)}</strong>
            </div>
            <div className={styles.viewControls}>
              <ControlGroup
                label="Distance"
                options={[{ value: "legible", label: "Compressed" }, { value: "linear", label: "Linear" }]}
                selected={distanceMode}
                setSelected={(value) => setDistanceMode(value as DistanceMode)}
              />
              <ControlGroup
                label="Planet size"
                options={[{ value: "readable", label: "Readable" }, { value: "relative", label: "Relative" }]}
                selected={sizeMode}
                setSelected={(value) => setSizeMode(value as SizeMode)}
              />
            </div>
          </div>

          <div className={styles.orbitViewport}>
            <svg className={styles.orbitChart} role="img" aria-label={`Solar System planet positions on ${formatDate(currentDate)}`} viewBox={`0 0 ${WIDTH} ${HEIGHT}`}>
              <defs>
                <radialGradient id="sunGlow">
                  <stop offset="0" stopColor="#fff5b8" />
                  <stop offset="0.34" stopColor="#ffc64b" />
                  <stop offset="1" stopColor="#dc6b23" />
                </radialGradient>
                <filter id="glow" x="-80%" y="-80%" width="260%" height="260%">
                  <feGaussianBlur stdDeviation="7" result="blur" />
                  <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
              </defs>

              <rect className={styles.space} width={WIDTH} height={HEIGHT} />
              {STARS.map((star, index) => (
                <circle fill="#edf5e8" key={index} opacity={star.opacity} r={star.radius} cx={star.x} cy={star.y} />
              ))}

              {PLANETS.slice().reverse().map((planet) => {
                const radius = orbitRadius(planet.semiMajorAU);
                const orientation = planet.orientationDeg * Math.PI / 180;
                const centerShift = -radius * planet.eccentricity;
                const cx = CENTER.x + centerShift * Math.cos(orientation);
                const cy = CENTER.y + centerShift * Math.sin(orientation);
                return (
                  <ellipse
                    className={`${styles.orbit} ${selected.id === planet.id ? styles.selectedOrbit : ""}`}
                    cx={cx}
                    cy={cy}
                    key={`orbit-${planet.id}`}
                    rx={radius}
                    ry={radius * Math.sqrt(1 - planet.eccentricity ** 2)}
                    style={{ stroke: planet.accent }}
                    transform={`rotate(${planet.orientationDeg} ${cx} ${cy})`}
                  />
                );
              })}

              <circle className={styles.sunHalo} cx={CENTER.x} cy={CENTER.y} r={42} />
              <circle cx={CENTER.x} cy={CENTER.y} fill="url(#sunGlow)" filter="url(#glow)" r={18} />
              <text className={styles.sunLabel} x={CENTER.x} y={CENTER.y + 56}>SUN</text>

              {PLANETS.map((planet) => {
                const point = screenPosition(planet);
                const radius = planetRadius(planet);
                const isSelected = selected.id === planet.id;
                return (
                  <g className={styles.planetGroup} key={planet.id} transform={`translate(${point.x} ${point.y})`}>
                    {planet.id === "saturn" && (
                      <ellipse className={styles.saturnRing} rx={radius * 1.9} ry={radius * 0.58} transform="rotate(-18)" />
                    )}
                    <circle
                      aria-label={`${planet.name}, ${planet.semiMajorAU} astronomical units from the Sun`}
                      className={`${styles.planetHit} ${isSelected ? styles.selectedPlanet : ""}`}
                      fill={planet.color}
                      onClick={() => setSelectedId(planet.id)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          setSelectedId(planet.id);
                        }
                      }}
                      r={radius}
                      role="button"
                      stroke={isSelected ? "#ffffff" : planet.accent}
                      strokeWidth={isSelected ? 3.4 : 1.5}
                      tabIndex={0}
                    />
                    <text className={`${styles.planetLabel} ${isSelected ? styles.selectedLabel : ""}`} x={radius + 7} y={4}>{planet.name}</text>
                  </g>
                );
              })}
            </svg>
          </div>

          <div className={styles.transport}>
            <button className={styles.playButton} onClick={() => setPlaying((current) => !current)} type="button">
              <span aria-hidden="true">{playing ? "Ⅱ" : "▶"}</span>{playing ? "Pause" : "Play"}
            </button>
            <label>
              <span className={styles.srOnly}>Date from 2025 to 2035</span>
              <input
                max={MAX_DAYS}
                min={0}
                onChange={(event) => {
                  setPlaying(false);
                  setElapsedDays(Number(event.target.value));
                }}
                type="range"
                value={elapsedDays}
              />
              <span className={styles.yearLabels}>
                {Array.from({ length: 11 }, (_, index) => <i key={index}>{2025 + index}</i>)}
              </span>
            </label>
            <div className={styles.speedControl}>
              <span>Step</span>
              {[1, 4, 16].map((speed) => (
                <button
                  aria-pressed={daysPerTick === speed}
                  className={daysPerTick === speed ? styles.activeSpeed : ""}
                  key={speed}
                  onClick={() => setDaysPerTick(speed)}
                  type="button"
                >
                  {speed}d
                </button>
              ))}
            </div>
          </div>
        </div>

        <aside className={styles.inspector}>
          <div className={styles.planetIndex}>
            {PLANETS.map((planet, index) => (
              <button
                aria-current={selected.id === planet.id ? "true" : undefined}
                key={planet.id}
                onClick={() => setSelectedId(planet.id)}
                type="button"
              >
                <span>{String(index + 1).padStart(2, "0")}</span>
                <i style={{ background: planet.color }} />
                {planet.name}
              </button>
            ))}
          </div>

          <div className={styles.planetTitle}>
            <p>{selected.kind}</p>
            <h3>{selected.name}</h3>
          </div>
          <blockquote>{selected.note}</blockquote>

          <dl>
            <div><dt>Distance from Sun</dt><dd>{formatAU(selected.semiMajorAU)}</dd></div>
            <div><dt>One local year</dt><dd>{formatYear(selected.periodDays)}</dd></div>
            <div><dt>One rotation</dt><dd>{formatDay(selected.dayHours)}</dd></div>
            <div><dt>Radius</dt><dd>{selected.radiusKm.toLocaleString()} km</dd></div>
            <div><dt>Axial tilt</dt><dd>{selected.axialTilt.toFixed(1)}°</dd></div>
            <div><dt>Known moons</dt><dd>{selected.moons}</dd></div>
            <div><dt>Sunlight travel time</dt><dd>{formatLightTime(selected.semiMajorAU)}</dd></div>
          </dl>
        </aside>
      </section>

      <section className={styles.factBand} aria-label="Solar system facts">
        <div><strong>8</strong><span>planets</span></div>
        <div><strong>30 AU</strong><span>Sun to Neptune</span></div>
        <div><strong>164.8 yr</strong><span>one Neptune orbit</span></div>
        <div><strong>4.6B yr</strong><span>system age</span></div>
      </section>

      <section className={styles.rhythms}>
        <div className={styles.rhythmIntro}>
          <p className={styles.eyebrow}>Eight local calendars</p>
          <h2>One year for Neptune.<br />Hundreds for Mercury.</h2>
          <p>
            Each line shows how many local years fit inside Neptune&apos;s 164.8-year orbit.
            Bar lengths use a logarithmic scale so every planet remains visible.
          </p>
        </div>
        <div className={styles.yearRows}>
          {PLANETS.map((planet) => {
            const completed = NEPTUNE_YEAR_DAYS / planet.periodDays;
            const width = Math.log1p(completed) / Math.log1p(MAX_ORBITS_IN_NEPTUNE_YEAR) * 100;
            return (
              <button key={planet.id} onClick={() => setSelectedId(planet.id)} type="button">
                <span>{planet.name}</span>
                <i><b style={{ background: planet.color, width: `${width}%` }} /></i>
                <strong>{formatOrbitCount(completed)}</strong>
              </button>
            );
          })}
        </div>
      </section>

      <footer className={styles.dataNote}>
        <strong>Sources &amp; model</strong>
        <div>
          <p>
            Positions use simplified two-body Keplerian ellipses and fixed orbital elements for explanatory motion; they are not an observational ephemeris.
          </p>
          <p className={styles.sourceLinks}>
            <a href="https://science.nasa.gov/solar-system/planets/">NASA Solar System Exploration</a>
            <a href="https://nssdc.gsfc.nasa.gov/planetary/factsheet/">NASA Planetary Fact Sheets</a>
          </p>
        </div>
      </footer>
    </main>
  );
}

function ControlGroup({
  label,
  options,
  selected,
  setSelected
}: {
  label: string;
  options: Array<{ value: string; label: string }>;
  selected: string;
  setSelected: (value: string) => void;
}) {
  return (
    <div className={styles.controlGroup}>
      <span>{label}</span>
      <div>
        {options.map((option) => (
          <button
            aria-pressed={selected === option.value}
            className={selected === option.value ? styles.activeControl : ""}
            key={option.value}
            onClick={() => setSelected(option.value)}
            type="button"
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" }).format(date);
}

function formatAU(value: number) {
  return `${value.toFixed(value < 10 ? 2 : 1)} AU`;
}

function formatYear(days: number) {
  if (days < 700) return `${Math.round(days).toLocaleString()} Earth days`;
  return `${(days / 365.256).toFixed(1)} Earth years`;
}

function formatDay(hours: number) {
  const direction = hours < 0 ? " · retrograde" : "";
  const absolute = Math.abs(hours);
  if (absolute > 72) return `${(absolute / 24).toFixed(1)} Earth days${direction}`;
  return `${absolute.toFixed(1)} hours${direction}`;
}

function formatLightTime(distanceAU: number) {
  const minutes = distanceAU * 8.3167;
  if (minutes < 60) return `${minutes.toFixed(1)} minutes`;
  return `${Math.floor(minutes / 60)}h ${Math.round(minutes % 60)}m`;
}

function formatOrbitCount(value: number) {
  if (Math.abs(value - 1) < 0.01) return "1 orbit";
  if (value >= 100) return `${Math.round(value)} orbits`;
  if (value >= 10) return `${value.toFixed(1)} orbits`;
  return `${value.toFixed(2)} orbits`;
}
