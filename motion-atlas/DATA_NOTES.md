# Data notes

## Current status

The prototype values are hand-curated, modeled approximations. They are useful for interaction design, narrative testing, scale decisions, and performance work. They are not a publishable statistical dataset.

The six labeled anchor years in each study are the authored scaffold. Annual frames between those anchors are generated with linear interpolation to make motion and trails easier to follow. These intermediate values must not be represented as annual observations.

## Production source plan

### Global energy transition

- GDP per person and population: World Bank World Development Indicators or Gapminder
- Territorial CO2 per person and energy mix: Our World in Data energy dataset, with its upstream source metadata retained
- Join key: ISO 3166-1 alpha-3 country code plus year

### Housing affordability

- Rent burden and household income: US Census ACS 1-year estimates
- Home values/prices: Zillow Research or FHFA, depending whether the story uses listing values or repeat-sale indexes
- Population/households: ACS
- Join key: stable CBSA code plus year; document boundary changes

### Technology company lifecycles

- Revenue, operating income, and employee count: company annual reports / SEC company facts
- Market capitalization: a versioned market-price source joined to diluted shares outstanding
- Join key: CIK plus fiscal year; preserve fiscal calendars and restatements

## Required methodology before publication

1. Pin every source version and retrieval date.
2. Preserve missing values rather than interpolating silently.
3. Define currency year and inflation treatment.
4. Record geography and corporate-entity changes.
5. Add per-measure source links and downloadable tidy data.
