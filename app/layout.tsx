import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://tax-ai-delta.vercel.app"),

  title: "Tax AI | AI Tax Calculator & Nigeria Tax Act 2025 Guide",
  description:
    "Calculate PAYE, VAT, CIT, and corporate taxes with our AI-powered platform. Get instant PDF downloads and expert guidance on the Nigeria Tax Act 2025. Simplified tax solutions for Nigerians.",

  applicationName: "Tax AI",

  keywords: [
    "Nigeria tax calculator",
    "PAYE calculator Nigeria",
    "VAT Nigeria",
    "Corporate Income Tax Nigeria",
    "Nigeria Tax Act 2025",
    "AI tax assistant",
    "Tax estimation Nigeria",
  ],

  authors: [{ name: "Tax AI Team" }],
  creator: "Tax AI",

  robots: {
    index: true,
    follow: true,
  },

  alternates: {
    canonical: "https://tax-ai-delta.vercel.app/",
  },

  openGraph: {
    title: "Tax AI: Nigeria's AI Tax Assistant",
    description:
      "Expert guidance on the Nigeria Tax Act 2025. Calculate your taxes in seconds.",
    url: "https://tax-ai-delta.vercel.app/",
    siteName: "Tax AI",
    images: [
      {
        url: "/tax-ai.png",
        width: 1200,
        height: 630,
        alt: "Tax AI - Nigeria AI Tax Calculator",
      },
    ],
    locale: "en_NG",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Tax AI: Nigeria's AI Tax Assistant",
    description:
      "Calculate PAYE, VAT, and corporate taxes instantly using AI. Built for Nigeria's Tax Act 2025.",
    images: ["/tax-ai.png"],
    creator: "@taxai", // optional
  },

  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-zinc-50 dark:bg-zinc-950 flex flex-col min-h-screen`}
      >
        <Header />
        <main className="pt-16 grow">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
