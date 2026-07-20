import Link from "next/link";
import styles from "./page.module.css";

const STUDIES = [
  { href: "/motion", number: "01", title: "Motion Scatterplots", type: "Animated systems", description: "Countries, metros, and technology companies move through time in Rosling-inspired bubble charts.", accent: "#de7356" },
  { href: "/solar-system", number: "02", title: "The Long Year", type: "Orbital mechanics", description: "Eight planetary clocks reveal the Solar System's speed, scale, and astonishing emptiness.", accent: "#e5b649" },
  { href: "/one-day", number: "03", title: "One Day, Many Americas", type: "Time use", description: "Published ATUS snapshots flow through sleep, work, care, meals, home life, leisure, and television.", accent: "#b96e37" },
  { href: "/grid", number: "04", title: "The Grid's Daily Rhythm", type: "Energy systems", description: "Observed EIA-930 days show sun, wind, thermal plants, hydro, imports, and demand moving hour by hour.", accent: "#4a9072" },
  { href: "/rivers", number: "05", title: "Where Rivers Go", type: "Physical geography", description: "Great drainage basins reveal the invisible divides that send water toward different oceans—or nowhere.", accent: "#4a8e9a" },
  { href: "/nearby-universe", number: "06", title: "The Nearby Universe", type: "Exoplanet systems", description: "Thousands of confirmed planetary systems become tiny, sortable clocks drawn from NASA's archive.", accent: "#65a8a0" },
  { href: "/moores-law", number: "07", title: "128 Years of Compounding", type: "Computing history", description: "The price-performance frontier crosses seven technologies and twenty-one orders of magnitude.", accent: "#c56a3d" },
  { href: "/health-spending", number: "08", title: "Who Pays. Where It Goes.", type: "Health spending flows", description: "America's health dollar moves from households, insurers, and public programs into care, medicines, administration, research, and capital.", accent: "#2f876f" },
  { href: "/world-trade", number: "09", title: "World Trade Is a River", type: "Merchandise flows", description: "Leading exporters pass through ten commodity families on their way to the world's largest destination markets—and everywhere beyond them.", accent: "#54a99c" },
  { href: "/power-costs", number: "10", title: "The Price Collapse", type: "Electricity economics", description: "Utility solar and onshore wind plunge through the cost of gas, coal, and nuclear across sixteen years of U.S. power economics.", accent: "#e4a72c" }
];

export default function IndexPage() {
  return (
    <main className={styles.shell}>
      <header>
        <p>Ten ways to see a system · collection 01</p>
        <h1>Data<br />Visualizations.</h1>
        <div>
          <span>Time</span><i /><span>Scale</span><i /><span>Flow</span>
        </div>
      </header>
      <section className={styles.grid}>
        {STUDIES.map((study) => (
          <Link href={study.href} key={study.href} style={{ "--accent": study.accent } as React.CSSProperties}>
            <div className={styles.cardTop}><span>{study.number}</span><i /></div>
            <p>{study.type}</p>
            <h2>{study.title}</h2>
            <strong>{study.description}</strong>
            <b>Open study <span>↗</span></b>
          </Link>
        ))}
      </section>
    </main>
  );
}
