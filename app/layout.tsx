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
import DashboardPage from './dashboard/page';

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
        <link rel="icon" type="image/png" href="/favicons/FAVCOM_WILBOR.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/favicons/favicon.png" />
      </head>
      <body className="bg-main">
        <AppStateProvider>
          <ThemeProvider attribute="class" defaultTheme={DEFAULT_THEME}>
            <SwrConfigClient>
              <DashboardPage />
            </SwrConfigClient>
            <ToasterWithThemes />
            <JsonLd type="website" />
          </ThemeProvider>
        </AppStateProvider>
      </body>
    </html>
  );
}
