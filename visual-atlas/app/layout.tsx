import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AtlasNavigation } from "../components/AtlasNavigation";
import "./globals.css";

export const metadata: Metadata = {
  title: "Data Visualizations",
  description: "A collection of interactive visual explanations."
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AtlasNavigation />
        {children}
      </body>
    </html>
  );
}
