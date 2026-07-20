export type ComputeEra = "Mechanical" | "Relay" | "Vacuum tube" | "Transistor" | "CPU" | "GPU" | "ASIC";

export type ComputePoint = {
  id: string;
  year: number;
  name: string;
  era: ComputeEra;
  cpsPerDollar: number;
  note: string;
};

export const ERA_COLORS: Record<ComputeEra, string> = {
  Mechanical: "#c8a56b",
  Relay: "#d8784f",
  "Vacuum tube": "#d9515d",
  Transistor: "#9f70c8",
  CPU: "#4e85c5",
  GPU: "#43a783",
  ASIC: "#e3ba3e"
};

// Approximate visual transcription of the computational frontier assembled by
// Ray Kurzweil and updated by Steve Jurvetson. Values support an explanatory
// semi-log narrative; they are not normalized product benchmark claims.
export const COMPUTE_POINTS: ComputePoint[] = [
  { id:"hollerith", year:1896, name:"Hollerith tabulator", era:"Mechanical", cpsPerDollar:1e-6, note:"Punched cards turn a national census into machine-readable work." },
  { id:"comptometer", year:1910, name:"Comptometer", era:"Mechanical", cpsPerDollar:5e-6, note:"Office arithmetic becomes a repeatable mechanical process." },
  { id:"monroe", year:1924, name:"Monroe calculator", era:"Mechanical", cpsPerDollar:4e-5, note:"Compact geared calculators push computation onto more desks." },
  { id:"zuse-z1", year:1938, name:"Zuse Z1", era:"Mechanical", cpsPerDollar:3e-4, note:"A programmable binary machine points beyond decimal office equipment." },
  { id:"zuse-z3", year:1941, name:"Zuse Z3", era:"Relay", cpsPerDollar:1e-3, note:"Electromechanical relays make a working, programmable digital computer." },
  { id:"mark-i", year:1944, name:"Harvard Mark I", era:"Relay", cpsPerDollar:5e-3, note:"Thousands of relays coordinate long automatic calculations." },
  { id:"eniac", year:1946, name:"ENIAC", era:"Vacuum tube", cpsPerDollar:2e-2, note:"Electronic switching outruns moving relays by orders of magnitude." },
  { id:"univac", year:1951, name:"UNIVAC I", era:"Vacuum tube", cpsPerDollar:1e-1, note:"Electronic computing enters commercial data processing." },
  { id:"ibm-704", year:1956, name:"IBM 704", era:"Vacuum tube", cpsPerDollar:1, note:"Floating-point hardware helps turn computers into scientific instruments." },
  { id:"ibm-7090", year:1959, name:"IBM 7090", era:"Transistor", cpsPerDollar:8, note:"Transistors replace hot, fragile vacuum tubes." },
  { id:"cdc-6600", year:1964, name:"CDC 6600", era:"Transistor", cpsPerDollar:60, note:"Parallel functional units establish the supercomputer frontier." },
  { id:"pdp-8", year:1965, name:"PDP-8", era:"CPU", cpsPerDollar:120, note:"The minicomputer compresses cost and size enough to reach laboratories." },
  { id:"intel-4004", year:1971, name:"Intel 4004", era:"CPU", cpsPerDollar:2.5e3, note:"A general-purpose processor arrives on a single integrated circuit." },
  { id:"apple-ii", year:1977, name:"Apple II", era:"CPU", cpsPerDollar:5e4, note:"The computational frontier moves into homes and small businesses." },
  { id:"ibm-pc", year:1981, name:"IBM PC", era:"CPU", cpsPerDollar:2e5, note:"A common personal-computing architecture unlocks a vast software market." },
  { id:"macintosh", year:1984, name:"Apple Macintosh", era:"CPU", cpsPerDollar:1e6, note:"Graphical computing becomes a mass-market product." },
  { id:"intel-486", year:1989, name:"Intel 80486", era:"CPU", cpsPerDollar:1e7, note:"A million-plus transistors and on-chip cache accelerate the desktop." },
  { id:"pentium", year:1993, name:"Intel Pentium", era:"CPU", cpsPerDollar:5e7, note:"Superscalar execution brings multiple operations per clock to PCs." },
  { id:"pentium-ii", year:1997, name:"Pentium II", era:"CPU", cpsPerDollar:3e8, note:"Commodity processors continue the integrated-circuit climb." },
  { id:"geforce-256", year:1999, name:"NVIDIA GeForce 256", era:"GPU", cpsPerDollar:1e9, note:"Dedicated parallel graphics hardware begins a new architectural branch." },
  { id:"pentium-4", year:2003, name:"Pentium 4", era:"CPU", cpsPerDollar:7e9, note:"Clock speed rises, but heat begins to constrain the old path." },
  { id:"g80", year:2006, name:"NVIDIA G80", era:"GPU", cpsPerDollar:5e10, note:"A unified shader architecture makes GPUs increasingly general-purpose." },
  { id:"fermi", year:2009, name:"NVIDIA Fermi", era:"GPU", cpsPerDollar:2e11, note:"GPU computing becomes a deliberate platform for scientific workloads." },
  { id:"kepler", year:2012, name:"NVIDIA Kepler", era:"GPU", cpsPerDollar:1e12, note:"Energy-efficient parallelism accelerates simulation and early deep learning." },
  { id:"tpu-v1", year:2016, name:"Google TPU v1", era:"ASIC", cpsPerDollar:1.5e13, note:"A custom tensor processor trades generality for neural-network throughput." },
  { id:"p100", year:2016, name:"NVIDIA Tesla P100", era:"GPU", cpsPerDollar:8e12, note:"High-bandwidth memory and specialized math push GPUs toward AI." },
  { id:"tpu-v2", year:2017, name:"Google TPU v2", era:"ASIC", cpsPerDollar:3e13, note:"Purpose-built accelerators scale from inference into training." },
  { id:"v100", year:2018, name:"NVIDIA V100", era:"GPU", cpsPerDollar:4e13, note:"Tensor cores blur the boundary between GPU and AI-specific silicon." },
  { id:"a100", year:2020, name:"NVIDIA A100", era:"GPU", cpsPerDollar:1.5e14, note:"Mixed-precision matrix hardware becomes central to frontier AI." },
  { id:"tpu-v4", year:2021, name:"Google TPU v4", era:"ASIC", cpsPerDollar:4e14, note:"Accelerators are designed as networked systems, not isolated chips." },
  { id:"h100", year:2022, name:"NVIDIA H100", era:"GPU", cpsPerDollar:8e14, note:"A GPU becomes a transition species with increasingly AI-specific machinery." },
  { id:"wse-3", year:2024, name:"Cerebras WSE-3", era:"ASIC", cpsPerDollar:1.2e15, note:"Wafer-scale integration attacks the communication cost between chips." },
  { id:"blackwell", year:2024, name:"NVIDIA Blackwell", era:"ASIC", cpsPerDollar:2e15, note:"Low-precision transformer engines move the frontier toward specialized AI compute." }
];

export const ERA_NOTES: Array<{ era: ComputeEra; years: string; title: string; body: string }> = [
  { era:"Mechanical", years:"1896–1938", title:"Teeth and levers", body:"For four decades, progress comes from making physical mechanisms faster, smaller, and easier to operate." },
  { era:"Relay", years:"1941–1944", title:"Electricity moves the switch", body:"Relays preserve mechanical logic but let electrical signals control it." },
  { era:"Vacuum tube", years:"1946–1956", title:"No moving parts", body:"Electronic switching creates an abrupt jump—and fills rooms with heat." },
  { era:"Transistor", years:"1959–1964", title:"The solid-state handoff", body:"Smaller, cooler, more reliable switches make dense circuits possible." },
  { era:"CPU", years:"1965–2003", title:"The general-purpose age", body:"Integration and mass production carry one flexible architecture across nearly forty years." },
  { era:"GPU", years:"1999–2022", title:"Parallelism takes the mantle", body:"The frontier shifts from faster serial cores to many arithmetic units working at once." },
  { era:"ASIC", years:"2016–2024", title:"Specialization wins", body:"AI accelerators sacrifice generality to push the cost of matrix computation sharply downward." }
];
