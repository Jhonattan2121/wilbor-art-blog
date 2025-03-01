import About from '@/app/about/page';
import {
  INFINITE_SCROLL_FEED_INITIAL,
  generateOgImageMetaForPhotos,
} from '@/photo';
import { getPhotos, getPhotosMeta } from '@/photo/db/query';
import { Metadata } from 'next/types';
import { cache } from 'react';

export const dynamic = 'force-static';
export const maxDuration = 60;

const getPhotosCached = cache(() => getPhotos({
  limit: INFINITE_SCROLL_FEED_INITIAL,
}));

export async function generateMetadata(): Promise<Metadata> {
  const photos = await getPhotosCached()
    .catch(() => []);
  return generateOgImageMetaForPhotos(photos);
}

export default async function FeedPage() {
  const [
    photos,
    photosCount,
  ] = await Promise.all([
    getPhotosCached()
      .catch(() => []),
    getPhotosMeta()
      .then(({ count }) => count)
      .catch(() => 0),
  ]);

  return (
    <About />
  );
}
