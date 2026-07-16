# The Grid's Daily Rhythm

A self-contained Next/React visualization prototype for electricity supply and
demand over a day.

The current interaction includes:

- Region switching across four modeled grid scenarios.
- A hoverable 24-hour stacked supply chart.
- Demand and net-load line overlays.
- An animated grid-flow map for the selected time.
- Source mix, daily energy, clean share, and carbon proxy readouts.

The component lives in:

- `components/GridDailyRhythm.tsx`
- `components/GridDailyRhythm.module.css`
- `data/gridData.ts`

It adds no runtime dependencies beyond the project stack you supplied:

- Next 15.5.16
- React 18.3.1
- React DOM 18.3.1

## Run Locally

```bash
cd /Users/malbada/dev/visualizations/grid-daily-rhythm
npm install
npm run dev
```

Then open `http://localhost:3000`.

## Copy Into Your Site

For an App Router Next project, copy:

- `components/GridDailyRhythm.tsx`
- `components/GridDailyRhythm.module.css`
- `data/gridData.ts`

Then render:

```tsx
import { GridDailyRhythm } from "@/components/GridDailyRhythm";

export default function Page() {
  return <GridDailyRhythm />;
}
```

Adjust the import path if your site does not use `@/`.

## Data

This version uses modeled grid profiles inspired by public electricity data.
It is meant to settle the visual design before doing a real data extract. See
`DATA_NOTES.md`.

Official source for the eventual extract:

- https://www.eia.gov/opendata/
