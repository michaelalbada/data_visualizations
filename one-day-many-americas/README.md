# One Day, Many Americas

A self-contained Next/React visualization prototype for American time use.

The current interaction includes:

- Switching between the 2024 annual snapshot and 2015–19 average.
- Dashed comparison outlines for the other published period.
- Hover-driven time readout and activity shares.

The component lives in:

- `components/OneDayManyAmericas.tsx`
- `components/OneDayManyAmericas.module.css`
- `data/timeUseData.ts`

It adds no runtime dependencies beyond the project stack you supplied:

- Next 15.5.16
- React 18.3.1
- React DOM 18.3.1

## Run Locally

```bash
cd /Users/malbada/dev/visualizations/one-day-many-americas
npm install
npm run dev
```

Then open `http://localhost:3000`.

## Copy Into Your Site

For an App Router Next project, copy:

- `components/OneDayManyAmericas.tsx`
- `components/OneDayManyAmericas.module.css`
- `data/timeUseData.ts`

Then render:

```tsx
import { OneDayManyAmericas } from "@/components/OneDayManyAmericas";

export default function Page() {
  return <OneDayManyAmericas />;
}
```

Adjust the import path if your site does not use `@/`.

## Data

This version directly transcribes the BLS ATUS Table A-3 hourly estimates. See
`DATA_NOTES.md` for category mappings.

Official source:

- https://www.bls.gov/tus/tables.htm
