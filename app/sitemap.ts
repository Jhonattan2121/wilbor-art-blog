import { BASE_URL } from '@/app/config';
import { MetadataRoute } from 'next';

/**
 * This file generates the sitemap.xml file for better SEO
 * @returns Sitemap entries for the site
 */
export default function sitemap(): MetadataRoute.Sitemap {
  // Base URL without trailing slash
  const baseUrl = BASE_URL.endsWith('/') 
    ? BASE_URL.slice(0, -1) 
    : BASE_URL;

  return [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/projects`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/exhibitions`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    // Add more pages as needed
  ];
} 