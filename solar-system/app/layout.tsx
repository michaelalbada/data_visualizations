import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "The Long Year — The Solar System in Motion",
  description: "An interactive view of the Solar System's distances, sizes, and orbital rhythms."
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          background: "#07100f",
          color: "#f5f0df",
          fontFamily:
            'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
        }}
      >
        {children}
      </body>
    </html>
  );
}
