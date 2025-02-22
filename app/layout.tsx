import AdminBatchEditPanel from '@/admin/AdminBatchEditPanel';
import CommandK from '@/app/CommandK';
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
import { Metadata } from 'next/types';

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
    url: '/favicon.ico',
    rel: 'icon',
    type: 'image/png',
    sizes: '180x180',
  }, {
    url: '/favicons/light.png',
    rel: 'icon',
    media: '(prefers-color-scheme: light)',
    type: 'image/png',
    sizes: '32x32',
  }, {
    url: '/favicons/dark.png',
    rel: 'icon',
    media: '(prefers-color-scheme: dark)',
    type: 'image/png',
    sizes: '32x32',
  }, {
    url: '/favicons/apple-touch-icon.png',
    rel: 'icon',
    type: 'image/png',
    sizes: '180x180',
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
      <body>
        <AppStateProvider>
          <ThemeProvider attribute="class" defaultTheme={DEFAULT_THEME}>
            <SwrConfigClient>

              <div className="w-full bg-white dark:bg-black px-6 py-6">
                <div className="w-full max-w-[1280px] mx-auto flex justify-center">
                  <img
                    src="https://media.cargocollective.com/1/3/100581/headerimg/CABECA_SITE_WILBOR7.png"
                    alt="Wilbor Art Logo"
                    className="h-32 sm:h-40 w-auto object-contain"
                  />
                </div>
              </div>

              <main className={clsx(
                'mx-auto max-w-[1280px] px-3 mb-3',
                'lg:px-6 lg:mb-6',
              )}>
                <div className="flex flex-col items-center">
                </div>
                <Nav siteDomainOrTitle="Wilbor Art" />
                <AdminBatchEditPanel />
                <div className={clsx(
                  'min-h-[16rem] sm:min-h-[30rem]',
                  'mb-12 w-full',
                )}>
                  <ShareModals />
                  {children}
                </div>
                <Footer />
              </main>
              <CommandK />
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
