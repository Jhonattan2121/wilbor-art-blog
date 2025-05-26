import {
  BASE_URL,
  DEFAULT_THEME,
  SITE_DESCRIPTION,
  SITE_TITLE
} from '@/app/config';
import Footer from '@/app/Footer';
import PhotoEscapeHandler from '@/photo/PhotoEscapeHandler';
import ShareModals from '@/share/ShareModals';
import AppStateProvider from '@/state/AppStateProvider';
import SwrConfigClient from '@/state/SwrConfigClient';
import ToasterWithThemes from '@/toast/ToasterWithThemes';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { ThemeProvider } from 'next-themes';
import Image from 'next/image';
import Link from 'next/link';
import { Metadata } from 'next/types';
import BannerWilbor from "../public/wilborPhotos/bannerWilbor.png";
import '../tailwind.css';
import JsonLd from './components/JsonLd';

export const metadata: Metadata = {
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  ...BASE_URL && { metadataBase: new URL(BASE_URL) },
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    type: 'website',
    locale: 'pt_BR',
    url: BASE_URL,
    siteName: SITE_TITLE,
    images: [
      {
        url: `${BASE_URL}/wilborPhotos/bannerWilbor.png`,
        width: 1200,
        height: 630,
        alt: 'Wilbor Art'
      }
    ]
  },
  twitter: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    card: 'summary_large_image',
    images: [`${BASE_URL}/wilborPhotos/bannerWilbor.png`],
    creator: '@wilborart'
  },
  alternates: {
    canonical: BASE_URL,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  keywords: ['Wilbor Art', 'Arte', 'Fotografia', 'Design', 'Projetos Artísticos', 'Portfolio'],
  authors: [{ name: 'Wilbor Art' }],
  creator: 'Wilbor Art',
  publisher: 'Wilbor Art',
  icons: [{
    rel: 'icon',
    url: '/favicons/icon.png',
    type: 'image/png',
    sizes: '32x32'
  }, {
    rel: 'apple-touch-icon',
    url: '/favicons/favicon.png',
    sizes: '180x180'
  }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
    >
      <head>
        <link rel="icon" type="image/png" href="/favicons/icon.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/favicons/favicon.png" />
      </head>
      <body className="bg-main">
        <AppStateProvider>
          <ThemeProvider attribute="class" defaultTheme={DEFAULT_THEME}>
            <SwrConfigClient>
              <div className="w-full px-4 sm:px-8 pt-4">
                <div className="w-full flex justify-start">
                  <Link href="/projects">
                    <Image
                      src={BannerWilbor}
                      alt="Wilbor Art Logo"
                      className="h-24 sm:h-32 w-auto object-contain cursor-pointer hover:opacity-90 transition-opacity"
                    />
                  </Link>
                </div>
              </div>
              <main >
                <div className="flex flex-col items-center">
                </div>
                {/* <Nav siteDomainOrTitle="" /> */}
                <div >
                  <ShareModals />
                  {children}
                </div>
                <Footer />
              </main>
              {/* <CommandK /> */}
            </SwrConfigClient>
            <Analytics debug={false} />
            <SpeedInsights debug={false} />
            <PhotoEscapeHandler />
            <ToasterWithThemes />
            <JsonLd type="website" />
          </ThemeProvider>
        </AppStateProvider>
      </body>
    </html>
  );
}
