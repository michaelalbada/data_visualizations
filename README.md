  1. One Day, Many Americas
     American Time Use Survey river: sleep, work, care, meals, travel, leisure, media across a day. Built.

  2. The Grid’s Daily Rhythm
     Electricity demand and generation over a day: solar rise, wind variation, gas ramp, batteries, imports, net load. Started.

  4. The Nearby Universe — Built.
     Every confirmed exoplanet system with a published orbital period as a tiny solar system. Sort by distance, discovery year, planet size, orbital period, or detection method.


  5. The Solar System


6. I’d make it a piece called Where Rivers Go.

  Core idea: an interactive world map where every basin is colored by its final destination:

  - Atlantic
  - Pacific
  - Indian
  - Arctic
  - Southern Ocean, maybe
  - Mediterranean / Black Sea as sub-destinations, optional
  - Endorheic basins: water that never reaches the ocean

  The Open Culture piece highlights Robert Szucs’ map of world rivers divided by ocean drainage destination: Atlantic, Arctic, Indian, Pacific, plus endorheic basins. Source: Open
  Culture (https://www.openculture.com/2023/12/all-the-rivers-of-the-world-shown-in-rainbow-colors-a-data-visualization-to-explore.html).

  What would make ours different:

  1. Hover any basin
     Show: destination ocean, basin area, major river, outlet, downstream path.

  2. Click a river
     Highlight the whole upstream watershed and trace the river’s route to the sea.

  3. Toggle views
      - Ocean destination
      - Major basins
      - River hierarchy
      - Endorheic basins
      - Human settlements in each basin, later

  4. Zoom levels
     At world scale, show big basins.
     At regional scale, reveal sub-basins and tributaries.

  5. Narrative annotations
     Examples:
      - “The Caspian basin never reaches the ocean.”
      - “The Mississippi drains much of the interior U.S.”
      - “Tiny coastal basins dominate wet mountain ranges.”
      - “Continental divides are often invisible until water reveals them.”

  Data path is feasible. The best source is probably HydroSHEDS / HydroBASINS / HydroRIVERS from WWF, which provides global hydrographic layers including watershed boundaries, river
  networks, drainage directions, and topology. HydroRIVERS alone has 8.5 million river reaches, so we’d need to simplify/preprocess heavily. Sources: HydroSHEDS
  (https://www.hydrosheds.org/about), HydroRIVERS (https://www.hydrosheds.org/products/hydrorivers), HydroATLAS (https://www.hydrosheds.org/hydroatlas).

  For a lighter first version, we could use Natural Earth rivers and coastlines for the base map, then add simplified HydroBASINS polygons. Natural Earth is public-domain and designed
  for small-scale world maps. Source: Natural Earth rivers (https://www.naturalearthdata.com/downloads/10m-physical-vectors/10m-rivers-lake-centerlines/).

  Implementation-wise, this is more GIS-heavy than the first two. The browser part is straightforward; the hard part is preprocessing:

  HydroBASINS / HydroRIVERS
  → simplify geometry
  → classify by ocean destination
  → convert to TopoJSON or vector tiles
  → render interactive map

  I would not start with all rivers. I’d start with:

  - HydroBASINS level 3 or 4 polygons
  - major rivers only
  - ocean-destination coloring
  - hover/click basin details

  Then add downstream river tracing once the map feels good. This could become one of the strongest visualizations on the site.


7. Better version of https://ourworldindata.org/energy-mix

8. Better, interactive version of 128 years of Moore's Law — Built: https://x.com/FutureJurvetson/status/1863649174358831312/photo/1
