# Data Notes

This first version is a design scaffold, not a publication-grade ATUS extract.

The component uses rounded daily hour targets for each cohort, then generates
half-hour rhythms with deterministic curves. An iterative proportional fitting
pass makes each half-hour sum to 100 percent while preserving the daily hour
targets.

Why this approach:

- It keeps the visualization completely static and cheap to host.
- It avoids adding a data pipeline before the visual direction is settled.
- It makes the front-end component easy to replace with real ATUS aggregates.

Before publishing as exact BLS estimates, replace `COHORTS[].targets` and the
modeled rhythms in `data/timeUseData.ts` with an extract from ATUS microdata.

Useful official source:

- BLS American Time Use Survey data files: https://www.bls.gov/tus/data.htm

Suggested real-data replacement path:

1. Download the ATUS activity, respondent, and lexicon files for the target year
   or multi-year range.
2. Map ATUS activity codes into the ten categories used here.
3. Apply respondent weights.
4. Aggregate each group into 48 half-hour bins.
5. Export the same `TimelinePoint[]` shape currently returned by
   `buildTimeline`.
