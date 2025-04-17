import { BASE_URL } from '@/app/config';
import { MetadataRoute } from 'next';

/**
 * This file generates the robots.txt file for better SEO
 * @returns Robot directives for the site
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Add disallow paths if needed
      // disallow: ['/admin/', '/private/'],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
} 