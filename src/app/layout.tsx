import type { Metadata } from "next";
import { Inter, Rokkitt } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const rokkitt = Rokkitt({
  variable: "--font-rokkitt",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "CampLog — Your Camping Journal",
  description:
    "Track your camping trips, discover campgrounds, and share your outdoor adventures.",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Tally analytics (cookieless); tracks client-side navigations via pushState */}
        <script defer data-site="tl_lpdx93erdehe" src="https://tally.coffeyconsult.com/js/t.js" />
      </head>
      <body className={`${inter.variable} ${rokkitt.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
