# Data notes

The bundled snapshot was retrieved from the NASA Exoplanet Archive `pscomppars`
table on 2026-07-17. It contains every confirmed-planet row with a published
orbital period at retrieval time: 5,981 planets grouped into 4,408 systems.

The source query retains host name, planet name, system distance, discovery
year and method, orbital period and semimajor axis, planet radius and mass,
stellar temperature and radius, and planet equilibrium temperature.
Galactic longitude and latitude are also retained for the distorted neighborhood
map.

The miniature systems are explanatory diagrams. Orbit radius is logarithmic by
default, planets are enlarged for visibility, orbital phases are deterministic
but invented, and neither eccentricity nor inclination is modeled. They are not
ephemerides and should not be used to infer current sky positions.

The neighborhood map projects each host star onto the Galactic plane using its
archive longitude and latitude, then compresses radial distance logarithmically.
It deliberately enlarges the dense Solar neighborhood and collapses the much
larger Milky Way volume. Latitude is encoded as color and does not create a true
three-dimensional position. The map is a finding aid, not an astronomical chart.

A system's planet count means "confirmed in this snapshot," not the system's
true total. Transit, radial-velocity, imaging, and microlensing surveys have
different sensitivity to planet size, orbital period, system orientation, and
distance, so undiscovered planets may remain in any displayed system.

Most displayed names are scientific designations. Prefixes such as HD and GJ
identify stellar catalogs, while TOI identifies a TESS Object of Interest.
Planets generally inherit the host-star designation and add a lowercase letter
in discovery order, beginning with `b`.

Source: https://exoplanetarchive.ipac.caltech.edu/
