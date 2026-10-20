import type { Metadata, Viewport } from 'next';
import { Blinker, JetBrains_Mono } from 'next/font/google';

import { CursorGlow } from '@/components/site/CursorGlow';
import { Footer } from '@/components/site/Footer';
import { Nav } from '@/components/site/Nav';
import { SmoothScroll } from '@/components/site/SmoothScroll';
import { asset } from '@/lib/asset';
import { site } from '@/content/site';

import './globals.css';

const display = Blinker({
  subsets: ['latin'],
  weight: ['200', '300', '400', '600', '800'],
  variable: '--font-display',
  display: 'swap',
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — non-invasive brain-computer interface research`,
    template: `%s — ${site.name}`,
  },
  description: site.shortDescription,
  applicationName: site.name,
  authors: [{ name: site.author }],
  keywords: [
    'brain-computer interface', 'BCI', 'EEG', 'EMG', 'ear-EEG',
    'non-invasive neurotechnology', 'signal processing', 'machine learning',
    'wearable sensing', 'neural engineering',
  ],
  openGraph: {
    type: 'website',
    siteName: site.name,
    title: `${site.name} — ${site.tagline}`,
    description: site.shortDescription,
    images: [{ url: asset('/brand/cerebral-lockup.png'), width: 1883, height: 292, alt: `${site.name} logotype` }],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${site.name} — ${site.tagline}`,
    description: site.shortDescription,
  },
  icons: {
    icon: asset('/brand/mark-512.png'),
    apple: asset('/brand/apple-touch-icon.png'),
  },
};

export const viewport: Viewport = {
  themeColor: '#000000',
  colorScheme: 'dark',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${mono.variable}`}>
      <body>
        <a className="skip-link mono" href="#main">Skip to content</a>
        <SmoothScroll />
        <CursorGlow />
        <Nav />
        <main id="main">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
