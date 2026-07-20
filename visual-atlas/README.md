# Data Visualizations

An integrated shell for the repository's completed interactive visualizations.

## Routes

- `/motion` — Motion Atlas
- `/solar-system` — The Long Year
- `/one-day` — One Day, Many Americas
- `/grid` — The Grid's Daily Rhythm
- `/rivers` — Where Rivers Go
- `/nearby-universe` — The Nearby Universe
- `/health-spending` — Who Pays. Where It Goes.
- `/world-trade` — World Trade Is a River
- `/moores-law` — 128 Years of Compounding
- `/power-costs` — The Price Collapse

The route pages import the source components from their original standalone projects, so improvements remain shared rather than duplicated.

Every study uses published source records. See [`../DATA_SOURCES.md`](../DATA_SOURCES.md) for the collection-wide provenance audit and each study's `DATA_NOTES.md` for transformations.

## Run

```bash
npm install
npm run dev
```

These commands can be run from the repository root; the root npm workspace owns the shared toolchain used by cross-project imports.
