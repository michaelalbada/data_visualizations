export type Destination = "Atlantic" | "Pacific" | "Indian" | "Arctic" | "Southern" | "Mediterranean" | "Endorheic";

export type Basin = {
  id: string;
  name: string | null;
  river: string | null;
  outletName: string | null;
  destination: Destination;
  area: number;
  endorheic: boolean;
  outlet: [number, number];
  label: [number, number];
  path: string;
  riverPath: string | null;
};

export const DESTINATIONS: Record<Destination, { color: string; description: string }> = {
  Atlantic: { color: "#e35d48", description: "Atlantic Ocean and connected seas" },
  Pacific: { color: "#15949d", description: "Pacific Ocean and connected seas" },
  Indian: { color: "#d89a20", description: "Indian Ocean" },
  Arctic: { color: "#557ed3", description: "Arctic Ocean" },
  Southern: { color: "#62a6c8", description: "Southern Ocean margin" },
  Mediterranean: { color: "#8e68b4", description: "Mediterranean and Black Sea system" },
  Endorheic: { color: "#8d7960", description: "No outlet to the ocean" }
};

export const BASIN_COLORS = ["#cf604e", "#358c82", "#cb942b", "#6078b7", "#8a6da0", "#668466", "#b36c43", "#3f8493"];
