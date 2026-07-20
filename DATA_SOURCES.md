# Data provenance audit

All ten studies use traceable published records. Generated JSON means “preprocessed for the browser,” not synthetic. Retrieval dates and transformations live in each study's `DATA_NOTES.md`.

| Study | Published data | Browser transformation |
| --- | --- | --- |
| Motion Scatterplots | OWID/Global Carbon Budget and World Bank; Census ACS; SEC 10-K Company Facts | Joins, ratios, units, and category labels; missing years remain missing |
| The Long Year | NASA planetary fact sheets and Solar System Exploration | Keplerian explanatory animation using published orbital elements |
| One Day, Many Americas | BLS ATUS Table A-3, 2015–19 and 2024 | Published hourly categories combined into ten non-overlapping display groups |
| The Grid's Daily Rhythm | EIA Form EIA-930, January–June 2024 balance file | Fuel grouping, positive net imports, and a disclosed emissions proxy |
| Where Rivers Go | HydroBASINS level 3 | Equal Earth projection, geometry simplification, and destination classification |
| The Nearby Universe | NASA Exoplanet Archive `pscomppars` snapshot | Logarithmic display scale; diagram phases are decorative, not observations |
| 128 Years of Compounding | Kurzweil/Jurvetson published computational frontier | Editorial transcription of the source chart's approximate price-performance series |
| Who Pays. Where It Goes. | CMS National Health Expenditure Accounts, 1960–2024 | Detailed accounts grouped into payer and service families |
| World Trade Is a River | UN Comtrade annual merchandise exports | HS chapters grouped into commodity families; remaining partners retained as rest of world |
| The Price Collapse | Lazard LCOE+ versions 3.0–18.0 | Published high/low midpoint for each technology and edition |

## Integrity policy

- No placeholder, demo, randomized, or hand-shaped observations are displayed.
- Derived values are documented and remain distinguishable from source observations.
- Decorative animation state—such as an exoplanet's starting phase—is not presented as measured data.
- Missing observations are preserved rather than silently filled.
