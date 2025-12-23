import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import RootShell from "@/components/layout/RootShell";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TitanGaming – Smart PC Builder & Neon Gaming Storefront",
  description:
    "TitanGaming is a cyberpunk PC and console storefront with a Smart Builder that estimates FPS, power draw and bottlenecks for high-end gaming rigs.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <RootShell>{children}</RootShell>
      </body>
    </html>
  );
}
