# Motion Scatterplots — data notes

All plotted positions and bubble sizes are published observations. The browser does not interpolate missing years.

## Global energy transition

Annual 2000–2023 observations join Our World in Data's **CO₂ emissions and GDP per capita** chart to its population series by ISO country code and year. GDP per person is PPP-adjusted and expressed in constant 2021 international dollars. CO₂ is territorial fossil-fuel and industry emissions per person. Population controls bubble area.

Sources:

- <https://ourworldindata.org/grapher/co2-emissions-and-gdp-per-capita>
- <https://ourworldindata.org/grapher/population>

## Housing affordability

The 2021–2024 frames use ACS 1-year metropolitan estimates from four detailed tables:

- B25071: median gross rent as a percentage of household income
- B25077: median value of owner-occupied housing units
- B19013: median household income
- B11001: household count

The purchase barrier is B25077 divided by B19013. Bubble area uses B11001. The ACS did not publish 2020 1-year estimates. These are survey estimates and have margins of error; the visualization currently shows point estimates.

Source: <https://www.census.gov/programs-surveys/acs/data/summary-file.html>

## Technology company lifecycles

The series uses facts reported in annual Form 10-K filings through the SEC Company Facts API. X is annual revenue, Y is operating income divided by revenue, and bubble area uses total assets. Facts are matched by fiscal-year end. Comparative facts from later filings are allowed to incorporate company restatements; missing facts remain missing.

Source: <https://www.sec.gov/search-filings/edgar-application-programming-interfaces>

## Rebuild

Run `node motion-atlas/scripts/build-motion-data.mjs`. SEC asks automated clients to identify themselves, so the script uses the repository's `git config user.email` as its contact.
