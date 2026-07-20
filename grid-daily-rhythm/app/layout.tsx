import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "The Grid's Daily Rhythm",
  description: "An observed EIA-930 electricity grid visualization."
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          background: "#f2f5ee",
          color: "#18212c",
          fontFamily:
            'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
        }}
      >
        {children}
      </body>
    </html>
  );
}
