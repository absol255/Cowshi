import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Cowshi — Trade the future in Macho Bucks",
  description: "A Kalshi-style prediction market settled in Macho Bucks.",
};

export const viewport: Viewport = {
  colorScheme: "dark",
  themeColor: "#0a1120",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-background text-foreground">
        <Header />
        <main className="mx-auto w-full max-w-[1280px] px-4 pb-16 pt-4">{children}</main>
      </body>
    </html>
  );
}
