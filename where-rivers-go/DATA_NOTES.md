# Data notes

The map contains 292 official HydroBASINS level-3 drainage polygons, projected to Equal Earth and simplified with a 0.12-degree Douglas–Peucker tolerance. The generated browser dataset retains basin ID, area, endorheic status, outlet coordinates, destination class, and selected major-river metadata.

## Preprocessing

`scripts/build-hydro-data.mjs` performs the current conversion:

1. Reads the nine official continental HydroBASINS level-3 shapefiles.
2. Matches each basin to its official level-3 pour-point locations.
3. Uses HydroBASINS endorheic attributes and pour-point geography to classify the terminal system.
4. Projects polygon coordinates with the Equal Earth formula.
5. Simplifies SVG geometry for world-scale delivery.
6. Adds editorial names for selected major systems.

The generated file is `data/basins.generated.json`. It should be regenerated from the source shapefiles rather than edited by hand.

## Next production step

Regional zoom levels should eventually use separate, progressively detailed geometry or vector tiles rather than enlarging the overview layer indefinitely. Accurate river paths can be added later from simplified HydroRIVERS reaches joined by shared HydroBASINS IDs.

Sources:

- https://www.hydrosheds.org/about
- https://www.hydrosheds.org/products/hydrobasins
- https://www.hydrosheds.org/products/hydrorivers
