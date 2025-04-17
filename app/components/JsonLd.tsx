'use client';

import { BASE_URL, SITE_DESCRIPTION, SITE_TITLE } from '@/app/config';
import Script from 'next/script';

interface JsonLdProps {
  type: 'website' | 'person' | 'article' | 'breadcrumb';
  data?: Record<string, any>;
}

export default function JsonLd({ type, data = {} }: JsonLdProps) {
  // Website schema
  if (type === 'website') {
    const websiteSchema = {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: SITE_TITLE,
      description: SITE_DESCRIPTION,
      url: BASE_URL,
      ...data
    };

    return (
      <Script
        id="json-ld-website"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
    );
  }

  if (type === 'person') {
    const personSchema = {
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: 'Wilson Domingues',
      alternateName: 'Wilbor',
      description: 'Wilson Domingues, conhecido como Wilbor, é um artista multifacetado do Rio de Janeiro que une skate, arte e audiovisual.',
      sameAs: [
        'https://instagram.com/wilbor_domina',
        'https://vimeo.com/wilbor',
        'https://odysee.com/@wilbor'
      ],
      jobTitle: 'Artista',
      ...data
    };

    return (
      <Script
        id="json-ld-person"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
      />
    );
  }

  if (type === 'article') {
    const articleSchema = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: data.title || 'Exposições e Exibições',
      description: data.description || 'Exposições e exibições de Wilson Domingues "Wilbor"',
      image: data.image || `${BASE_URL}/wilborPhotos/bannerWilbor.png`,
      author: {
        '@type': 'Person',
        name: 'Wilson Domingues',
        url: `${BASE_URL}/about`
      },
      publisher: {
        '@type': 'Organization',
        name: 'Wilbor Art',
        logo: {
          '@type': 'ImageObject',
          url: `${BASE_URL}/wilborPhotos/bannerWilbor.png`
        }
      },
      datePublished: data.datePublished || new Date().toISOString(),
      dateModified: data.dateModified || new Date().toISOString(),
      ...data
    };

    return (
      <Script
        id="json-ld-article"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
    );
  }

  if (type === 'breadcrumb') {
    const itemListElement = data.breadcrumbs || [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Início',
        item: BASE_URL
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: data.currentPage || 'Página atual',
        item: `${BASE_URL}${data.path || ''}`
      }
    ];

    const breadcrumbSchema = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement,
      ...data
    };

    return (
      <Script
        id="json-ld-breadcrumb"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
    );
  }

  return null;
} 