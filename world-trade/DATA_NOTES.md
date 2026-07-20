# World Trade as a River — data notes

The study uses annual merchandise-export records from the United Nations Statistics Division's UN Comtrade public API.

Source: <https://comtradeplus.un.org/>

The snapshot follows the eight largest reporting exporters in the 2023 comparison: China, the United States, Germany, Japan, the Netherlands, Italy, France, and South Korea. It includes all 97 reported two-digit Harmonized System chapters, grouped into ten legible commodity families.

Named destinations are the eight largest import markets in the same comparison. Every other partner is retained as “Rest of world,” calculated for each exporter and commodity as world exports minus the named destinations. Thus every represented export dollar remains in the river.

Values are reporter-recorded exports in current US dollars. They are not inflation-adjusted, and exports reported by one country need not exactly equal the partner's recorded imports because of valuation, timing, classification, and reporting differences. The study is a broad view of major merchandise flows, not a complete world trade balance or a measure of services trade.

Regenerate with:

```sh
node world-trade/scripts/build-trade-data.mjs
```
