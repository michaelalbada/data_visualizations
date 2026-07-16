# Where Rivers Go

An interactive Next/React prototype exploring where major world river basins ultimately drain.

## Included

- 292 official HydroBASINS level-3 drainage polygons in an Equal Earth projection.
- Four map views: ocean destination, major basins, basin scale, and endorheic basins.
- Hover previews and click-to-pin basin profiles.
- Wheel, trackpad, touch, button, and drag-based map navigation.
- Zoom controls with progressively revealed basin labels and a reset action.
- Responsive layout and keyboard-focusable basin geometry.

## Data status

The basin fabric uses official HydroBASINS level-3 geometry and attributes, simplified for a global browser view. Destination classes are derived from endorheic flags and pour-point locations. Editorial main-stem river traces are still schematic and should eventually be replaced by simplified HydroRIVERS geometry. See `DATA_NOTES.md`.

## Run

```bash
cd /Users/malbada/dev/data_visualizations/where-rivers-go
npm install
npm run dev
```
