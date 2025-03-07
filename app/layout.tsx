import {
  BASE_URL,
  DEFAULT_THEME,
  SITE_DESCRIPTION,
  SITE_TITLE
} from '@/app/config';
import Footer from '@/app/Footer';
import Nav from '@/app/Nav';
import PhotoEscapeHandler from '@/photo/PhotoEscapeHandler';
import ShareModals from '@/share/ShareModals';
import AppStateProvider from '@/state/AppStateProvider';
import SwrConfigClient from '@/state/SwrConfigClient';
import ToasterWithThemes from '@/toast/ToasterWithThemes';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { clsx } from 'clsx/lite';
import { ThemeProvider } from 'next-themes';
import Image from 'next/image';
import Link from 'next/link';
import { Metadata } from 'next/types';
import BannerWilbor from "../public/wilborPhotos/bannerWilbor.png";
import '../tailwind.css';

export const metadata: Metadata = {
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  ...BASE_URL && { metadataBase: new URL(BASE_URL) },
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
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
      // Suppress hydration errors due to next-themes behavior
      suppressHydrationWarning
    >
      <head>
        <link rel="icon" type="image/png" href="/favicons/icon.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/favicons/favicon.png" />
      </head>
      <body>
        <AppStateProvider>
          <ThemeProvider attribute="class" defaultTheme={DEFAULT_THEME}>
            <SwrConfigClient>
              <div className="w-full bg-white dark:bg-black px-3 py-3">
                <div className="w-full max-w-[1280px] mx-auto flex justify-center">
                  <Link href="/projects">
                    <Image
                      src={BannerWilbor}
                      alt="Wilbor Art Logo"
                      className="h-24 sm:h-32 w-auto object-contain cursor-pointer hover:opacity-90 transition-opacity"
                    />
                  </Link>
                </div>
              </div>
              <main className={clsx(
                'mx-auto max-w-[1280px] px-3 mb-3',
                'lg:px-6 lg:mb-6',
              )}>
                <div className="flex flex-col items-center">
                </div>
                <Nav siteDomainOrTitle="" />
                <div className={clsx(
                  'min-h-[16rem] sm:min-h-[30rem]',
                  'mb-12 w-full',
                )}>
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
          </ThemeProvider>
        </AppStateProvider>
      </body>
    </html>
  );
}
