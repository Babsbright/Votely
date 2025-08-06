import type { Metadata } from "next";
import "./globals.css";
import Toaster from "./components/toaster";
import { Inter } from "next/font/google";
import { Sora } from "next/font/google";
import { Outfit } from "next/font/google";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Votely - Vote for Your Favorites",
  description:
    "A modern voting app built with Next.js, Tailwind, and Firebase.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
       <body className={`${outfit.variable} ${inter.variable} ${sora.variable} font-outfit`} >
        {children}

        <Toaster />
      </body>
    </html>
  );
}
