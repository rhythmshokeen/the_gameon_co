import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "GameOn Co. — Professional Sports Talent Marketplace",
  description:
    "Connect athletes, coaches, and academies through verified competitions and structured performance profiles. Turn talent into opportunity.",
  keywords: [
    "sports",
    "talent marketplace",
    "athletes",
    "coaches",
    "competitions",
    "recruitment",
  ],
  openGraph: {
    title: "GameOn Co. — Professional Sports Talent Marketplace",
    description:
      "Connect athletes, coaches, and academies through verified competitions and structured performance profiles.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} antialiased min-h-screen bg-[#0b0d14]`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
