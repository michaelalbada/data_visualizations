"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import styles from "./AtlasNavigation.module.css";

const ITEMS = [
  { href: "/motion", number: "01", label: "Motion Atlas" },
  { href: "/solar-system", number: "02", label: "Solar System" },
  { href: "/one-day", number: "03", label: "One Day" },
  { href: "/grid", number: "04", label: "The Grid" },
  { href: "/rivers", number: "05", label: "Rivers" },
  { href: "/nearby-universe", number: "06", label: "Exoplanets" },
  { href: "/moores-law", number: "07", label: "Moore's Law" },
  { href: "/health-spending", number: "08", label: "Health Spending" },
  { href: "/world-trade", number: "09", label: "Trade River" },
  { href: "/power-costs", number: "10", label: "Power Costs" },
  { href: "/ulysses", number: "11", label: "Ulysses" }
];

export function AtlasNavigation() {
  const pathname = usePathname();
  const activeRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    activeRef.current?.scrollIntoView({ block:"nearest", inline:"center" });
  }, [pathname]);

  return (
    <header className={styles.bar}>
      <Link className={styles.brand} href="/">
        <i />
        Data Visualizations
      </Link>
      <nav aria-label="Visualizations">
        {ITEMS.map((item) => (
          <Link
            aria-current={pathname === item.href ? "page" : undefined}
            href={item.href}
            key={item.href}
            ref={pathname === item.href ? activeRef : undefined}
          >
            <span>{item.number}</span>{item.label}
          </Link>
        ))}
      </nav>
      <Link className={styles.indexLink} href="/">All studies</Link>
    </header>
  );
}
