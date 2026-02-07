import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Tax Matters | AI Tax Calculator & Nigeria Tax Act 2025 Guide',
  description:
    'Calculate PAYE, VAT, CIT, and corporate taxes with our AI-powered platform. Get instant PDF downloads and expert guidance on the Nigeria Tax Act 2025. Simplified tax solutions for Nigerians.',
  openGraph: {
    title: 'Tax Matters: Nigeria’s AI Tax Assistant',
    description:
      'Expert guidance on the Nigeria Tax Act 2025. Calculate your taxes in seconds.',
    url: 'https://tax-ai-delta.vercel.app/',
    siteName: 'Tax Matters',
    images: [
      {
        url: '', // Create a 1200x630 image for better CTR
        width: 1200,
        height: 630,
      },
    ],
    locale: 'en_NG',
    type: 'website',
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
