# The Grid's Daily Rhythm — data notes

Every hourly value comes from Form EIA-930, downloaded from the U.S. Energy Information Administration's official January–June 2024 six-month balance file.

The seven examples are single observed days from CAISO, ERCOT, MISO, NYISO, Southern Company, Bonneville Power Administration, and Southwest Power Pool. The chart prefers EIA's adjusted values, which incorporate EIA's published validation and imputation, and falls back to the reported value when no adjusted value exists.

Mappings:

- Hydro includes hydropower and pumped storage.
- Coal is shown separately.
- “Gas + other” combines natural gas, petroleum, other, and unknown fuel sources.
- Imports are the positive portion of negative total interchange; export hours can therefore show generation above local demand.
- The carbon readout is a derived proxy using disclosed generic emission factors. It is not an EIA emissions observation.

Source: <https://www.eia.gov/electricity/gridmonitor/>

Regenerate with `node grid-daily-rhythm/scripts/build-grid-data.mjs`.
