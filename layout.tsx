import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "REP//AI — Your AI Gym Trainer",
  description: "Scan gym machines, discover exercises and track every rep.",
  manifest: "/manifest.webmanifest",
  themeColor: "#080b0a",
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
