import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppNav } from "@/components/AppNav";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "FRANK — Financial Ratio Analysis and Knowledge",
  description: "Composite fundamental + ML technical analysis for retail investors. Educational use only.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <body className={`${inter.className} min-h-full flex flex-col bg-slate-50 text-slate-900 antialiased`}>
        <AppNav />
        {children}
      </body>
    </html>
  );
}
