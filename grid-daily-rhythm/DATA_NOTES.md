# Data Notes

This first version is a design scaffold, not a historical grid record.

The component generates plausible half-hour power profiles for four regional
scenarios. Source values are modeled with deterministic curves for demand,
solar, wind, gas, nuclear, hydro, imports, and battery discharge. Each
half-hour is scaled so total supply equals demand.

Why this approach:

- It keeps the visualization static and cheap to host.
- It lets the visual design settle before adding an API or ETL step.
- It preserves the same front-end shape that real hourly data would use.

Before publishing as exact data, replace the generated points in
`data/gridData.ts` with hourly or sub-hourly generation data.

Useful official source:

- EIA Open Data: https://www.eia.gov/opendata/

Suggested real-data replacement path:

1. Pick one balancing authority, region, or state.
2. Pull hourly demand and generation by fuel from EIA Open Data or the relevant
   balancing-authority source.
3. Normalize fuel names into the seven source categories used here.
4. Export an array of `GridPoint` objects with `demand`, `netLoad`,
   `cleanShare`, `carbonRate`, and source values in GW.
5. Keep the component unchanged and replace only the data builder.
