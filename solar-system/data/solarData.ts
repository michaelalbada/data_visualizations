export type Planet = {
  id: string;
  name: string;
  kind: "rocky" | "gas giant" | "ice giant";
  semiMajorAU: number;
  eccentricity: number;
  periodDays: number;
  radiusKm: number;
  dayHours: number;
  moons: number;
  axialTilt: number;
  phaseDeg: number;
  orientationDeg: number;
  color: string;
  accent: string;
  note: string;
};

export const PLANETS: Planet[] = [
  {
    id: "mercury",
    name: "Mercury",
    kind: "rocky",
    semiMajorAU: 0.387,
    eccentricity: 0.2056,
    periodDays: 87.97,
    radiusKm: 2439.7,
    dayHours: 1407.6,
    moons: 0,
    axialTilt: 0.03,
    phaseDeg: 174,
    orientationDeg: 29,
    color: "#a9a397",
    accent: "#dad3c3",
    note: "A year ends before a single solar day does. Mercury races through the most eccentric planetary orbit."
  },
  {
    id: "venus",
    name: "Venus",
    kind: "rocky",
    semiMajorAU: 0.723,
    eccentricity: 0.0068,
    periodDays: 224.7,
    radiusKm: 6051.8,
    dayHours: -5832.5,
    moons: 0,
    axialTilt: 177.4,
    phaseDeg: 51,
    orientationDeg: 55,
    color: "#d9a85f",
    accent: "#ffe0a6",
    note: "Venus turns backward, slowly. Its nearly circular orbit hides one of the strangest rotations in the system."
  },
  {
    id: "earth",
    name: "Earth",
    kind: "rocky",
    semiMajorAU: 1,
    eccentricity: 0.0167,
    periodDays: 365.256,
    radiusKm: 6371,
    dayHours: 23.934,
    moons: 1,
    axialTilt: 23.44,
    phaseDeg: 100,
    orientationDeg: 103,
    color: "#4d8fc9",
    accent: "#98d5ea",
    note: "Our familiar clocks—day and year—are merely one local rhythm among eight very different ones."
  },
  {
    id: "mars",
    name: "Mars",
    kind: "rocky",
    semiMajorAU: 1.524,
    eccentricity: 0.0934,
    periodDays: 686.98,
    radiusKm: 3389.5,
    dayHours: 24.623,
    moons: 2,
    axialTilt: 25.19,
    phaseDeg: 213,
    orientationDeg: 250,
    color: "#c55e3d",
    accent: "#f29b72",
    note: "A Martian day feels almost ordinary. Its year, seasons, and changing distance from the Sun do not."
  },
  {
    id: "jupiter",
    name: "Jupiter",
    kind: "gas giant",
    semiMajorAU: 5.203,
    eccentricity: 0.0489,
    periodDays: 4332.59,
    radiusKm: 69911,
    dayHours: 9.925,
    moons: 101,
    axialTilt: 3.13,
    phaseDeg: 84,
    orientationDeg: 274,
    color: "#c99b6b",
    accent: "#f2d2a8",
    note: "More than twice as massive as every other planet combined, Jupiter still spins once in under ten hours."
  },
  {
    id: "saturn",
    name: "Saturn",
    kind: "gas giant",
    semiMajorAU: 9.537,
    eccentricity: 0.0565,
    periodDays: 10759.22,
    radiusKm: 58232,
    dayHours: 10.656,
    moons: 274,
    axialTilt: 26.73,
    phaseDeg: 111,
    orientationDeg: 339,
    color: "#d4bd79",
    accent: "#f5df9c",
    note: "Saturn takes almost three decades to circle the Sun. Its ring plane follows a deep seasonal tilt."
  },
  {
    id: "uranus",
    name: "Uranus",
    kind: "ice giant",
    semiMajorAU: 19.191,
    eccentricity: 0.0472,
    periodDays: 30688.5,
    radiusKm: 25362,
    dayHours: -17.24,
    moons: 28,
    axialTilt: 97.77,
    phaseDeg: 50,
    orientationDeg: 97,
    color: "#79c5c9",
    accent: "#b9f0eb",
    note: "Uranus rolls around the Sun on its side, producing seasons that last for decades."
  },
  {
    id: "neptune",
    name: "Neptune",
    kind: "ice giant",
    semiMajorAU: 30.069,
    eccentricity: 0.0086,
    periodDays: 60182,
    radiusKm: 24622,
    dayHours: 16.11,
    moons: 16,
    axialTilt: 28.32,
    phaseDeg: 355,
    orientationDeg: 274,
    color: "#4069c8",
    accent: "#8ba9ff",
    note: "Since its discovery in 1846, Neptune has completed only one full orbit around the Sun."
  }
];

export const MAX_DAYS = 3652;
export const EPOCH = new Date(Date.UTC(2025, 0, 1));

export function planetPosition(planet: Planet, elapsedDays: number) {
  const meanAnomaly = degreesToRadians(planet.phaseDeg) + (elapsedDays / planet.periodDays) * Math.PI * 2;
  let eccentricAnomaly = meanAnomaly;

  for (let iteration = 0; iteration < 6; iteration += 1) {
    eccentricAnomaly -= (
      eccentricAnomaly - planet.eccentricity * Math.sin(eccentricAnomaly) - meanAnomaly
    ) / (1 - planet.eccentricity * Math.cos(eccentricAnomaly));
  }

  const rawX = planet.semiMajorAU * (Math.cos(eccentricAnomaly) - planet.eccentricity);
  const rawY = planet.semiMajorAU * Math.sqrt(1 - planet.eccentricity ** 2) * Math.sin(eccentricAnomaly);
  const orientation = degreesToRadians(planet.orientationDeg);

  return {
    x: rawX * Math.cos(orientation) - rawY * Math.sin(orientation),
    y: rawX * Math.sin(orientation) + rawY * Math.cos(orientation)
  };
}

export function dateFromElapsedDays(elapsedDays: number) {
  const date = new Date(EPOCH);
  date.setUTCDate(date.getUTCDate() + elapsedDays);
  return date;
}

function degreesToRadians(value: number) {
  return value * Math.PI / 180;
}
