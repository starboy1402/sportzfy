import type { Metadata } from "next";
import { Bebas_Neue, Barlow } from "next/font/google";
import "./globals.css";

const bebasNeue = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bebas",
  display: "swap",
});

const barlow = Barlow({
  weight: ["400", "500", "600", "700", "800"],
  subsets: ["latin"],
  variable: "--font-barlow",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Sportzfy — Real-Time Turf Booking & Matchmaking",
  description: "Discover, hold, and instantly book 5v5, 6v6, and 7v7 football and cricket turfs across Chattogram and Dhaka with zero double-booking.",
  openGraph: {
    title: "Sportzfy — Real-Time Turf Booking & Matchmaking",
    description: "Instant slot locking, verified turf specs, and seamless local payments for sports enthusiasts in Bangladesh.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${bebasNeue.variable} ${barlow.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans bg-[var(--color-paper)] text-[var(--color-ink)] selection:bg-[var(--color-field)] selection:text-white">
        {children}
      </body>
    </html>
  );
}
