import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { CloudflareAnalytics } from "@/components/cf-analytics";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap"
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap"
});

export const metadata: Metadata = {
  title: "StateSense — find the missing states in your designs",
  description:
    "Audit app designs for missing states and unhappy-path gaps before handoff. Free, BYOK, browser-only — your screens never touch our servers.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://statesense.vercel.app"
  ),
  openGraph: {
    title: "StateSense",
    description:
      "Find missing states and unhappy-path gaps in your designs before handoff.",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "StateSense",
    description:
      "Find missing states and unhappy-path gaps in your designs before handoff."
  },
  robots: { index: true, follow: true }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${mono.variable} font-sans min-h-screen flex flex-col`}>
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
        <CloudflareAnalytics />
      </body>
    </html>
  );
}
