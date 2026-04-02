import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import { QueryProvider } from '@/components/providers/QueryProvider';
import './globals.css';

// next/font downloads and self-hosts the font at build time — no
// runtime request to Google Fonts, which eliminates a render-blocking
// resource and prevents the FOUT (flash of unstyled text) that causes CLS.
const geist = Geist({
  subsets: ['latin'],
  variable: '--font-geist',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    template: '%s | CineExplorer',
    default: 'CineExplorer — Discover Movies',
  },
  description:
    'Browse, search, and discover movies powered by The Movie Database (TMDB).',
  openGraph: {
    type: 'website',
    siteName: 'CineExplorer',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${geist.variable} h-full`}>
      <body className="min-h-full bg-slate-950 text-white antialiased font-[family-name:var(--font-geist)]">
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
