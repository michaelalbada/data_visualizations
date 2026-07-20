# Data notes

## Scope

The visualization includes the Solar System's eight planets. NASA also recognizes five dwarf planets; those are a natural future layer rather than being silently treated as planets here.

## Sources

- NASA Solar System Exploration: planet classifications, descriptive facts, sizes, and mean distances
- NASA planetary fact sheets: mean orbital period, rotation period, axial tilt, mean radius, semimajor axis, and eccentricity
- NASA moon pages: currently recognized moon counts

Moon counts are discovery-sensitive. The scaffold uses NASA's July 2026 figures, including 101 officially recognized moons for Jupiter, 274 confirmed moons for Saturn, 28 for Uranus, and 16 for Neptune.

## Orbital model

The browser solves Kepler's equation for a fixed two-body ellipse using each planet's semimajor axis, eccentricity, orbital period, and a hand-set phase/orientation for a legible starting arrangement. It intentionally omits:

- planetary perturbations;
- changing orbital elements;
- inclination and three-dimensional projection;
- barycentric motion;
- light-time correction;
- ephemeris-grade initial states.

The resulting motion explains relative rhythm and elliptical geometry. It must not be used to locate a planet in the night sky or navigate a spacecraft.

## Display scales

- **Compressed distance** applies a logarithmic transform so the inner and outer systems remain visible together.
- **Linear distance** preserves relative mean orbital distance and reveals how tightly the rocky planets cluster near the Sun.
- **Readable size** emphasizes interaction targets.
- **Relative size** preserves planet-to-planet radius ratios with a small minimum target; the Sun remains a symbolic marker in both modes.

## Shared-year comparison

The local-calendar comparison uses one Neptune orbit (60,182 Earth days, about 164.8 Earth years) as its common interval. Exact orbit counts are shown as labels. Bar length is `log(1 + orbit count)` so Neptune, Uranus, and the rapidly orbiting inner planets remain legible on one display; bar length should not be read as a linear ratio.
