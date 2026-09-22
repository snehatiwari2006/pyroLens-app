import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PyroLens GIS Dashboard",
  description: "AI-powered industrial fire and thermal intelligence",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
