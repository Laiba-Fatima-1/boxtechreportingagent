import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import AppShell from "@/components/shell/AppShell";

/**
 * TYPE PAIRING — and why these two.
 *
 * Inter for interface text. It was drawn for small sizes on screens, which
 * is most of what a dashboard is: labels, table cells, captions.
 *
 * Space Grotesk for headings and every number. In a reporting tool the
 * figures ARE the product, so they get the face with actual character — its
 * numerals are geometric and distinctive, and the slightly technical tone
 * suits a telematics company better than another neutral grotesque.
 *
 * Two families, one job each. Both self-host at build time via next/font,
 * so there's no runtime request to Google and no layout shift.
 */
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  display: "swap",
  weight: ["500", "600", "700"],
  variable: "--font-display",
});

export const metadata = {
  title: "BoxTech · AI Reporting Agent",
  description:
    "Read-only reporting and natural-language analytics over ERPNext CRM data.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0F2E22",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <body className={`${inter.className} antialiased`}>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
