import {
  BASE_URL,
  SITE_DESCRIPTION,
  SITE_TITLE
} from '@/app/config';
import { Metadata } from 'next/types';

/**
 * Creates metadata for a specific page by extending the base metadata
 * 
 * @param title - The page-specific title (will be appended to site title)
 * @param description - The page-specific description (defaults to site description)
 * @param imageUrl - Optional custom OG image URL (defaults to banner image)
 * @param path - Current page path (used for canonical URL)
 * @returns Metadata object to be used in Next.js pages
 */
export function createMetadata({
  title,
  description = SITE_DESCRIPTION,
  imageUrl = `${BASE_URL}/wilborPhotos/bannerWilbor.png`,
  path = '',
}: {
  title: string;
  description?: string;
  imageUrl?: string;
  path?: string;
}): Metadata {
  const fullTitle = `${title} | ${SITE_TITLE || 'Wilbor Art'}`;
  const canonicalUrl = `${BASE_URL}${path}`;
  
  return {
    title: fullTitle,
    description,
    ...BASE_URL && { metadataBase: new URL(BASE_URL) },
    openGraph: {
      title: fullTitle,
      description,
      type: 'website',
      locale: 'pt_BR',
      url: canonicalUrl,
      siteName: SITE_TITLE || 'Wilbor Art',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title
        }
      ]
    },
    twitter: {
      title: fullTitle,
      description,
      card: 'summary_large_image',
      images: [imageUrl],
      creator: '@wilborart'
    },
    alternates: {
      canonical: canonicalUrl,
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
    keywords: ['Wilbor Art', 'Arte', 'Fotografia', 'Design', 'Projetos Artísticos', 'Portfolio', title],
    authors: [{ name: 'Wilbor Art' }],
    creator: 'Wilbor Art',
    publisher: 'Wilbor Art',
  };
} 