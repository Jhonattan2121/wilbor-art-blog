import { GRID_HOMEPAGE_ENABLED } from '@/app/config';
import {
  INFINITE_SCROLL_FEED_INITIAL,
  INFINITE_SCROLL_GRID_INITIAL,
  generateOgImageMetaForPhotos,
} from '@/photo';
import { Photo } from '@/photo/components/types';
import { getPhotoSidebarData } from '@/photo/data';
import { getPhotos, getPhotosMeta } from '@/photo/db/query';
import PhotoFeedPage from '@/photo/PhotoFeedPage';
import PhotoGridPage from '@/photo/PhotoGridPage';
import PhotosEmptyState from '@/photo/PhotosEmptyState';
import { Metadata } from 'next/types';
import { cache } from 'react';

export const dynamic = 'force-static';
export const maxDuration = 60;

const getPhotosCached = cache(() => getPhotos({
  limit: GRID_HOMEPAGE_ENABLED
    ? INFINITE_SCROLL_GRID_INITIAL
    : INFINITE_SCROLL_FEED_INITIAL,
}));

export async function generateMetadata(): Promise<Metadata> {
  const photos = await getPhotosCached()
    .catch(() => []);
  return generateOgImageMetaForPhotos(photos);
}

export default async function HomePage() {
  const [
    photos,
    photosCount,
    tags,
    cameras,
    simulations,
  ] = await Promise.all([
    getPhotosCached()
      .catch(() => []),
    getPhotosMeta()
      .then(({ count }) => count)
      .catch(() => 0),
    ...(GRID_HOMEPAGE_ENABLED
      ? getPhotoSidebarData()
      : [[], [], []]),
  ]);

  return (
    photos.length > 0
      ? GRID_HOMEPAGE_ENABLED
        ? <PhotoGridPage
          {...{
            photos: photos as Photo[],
            photosCount, tags, cameras, simulations
          }}
        />
        : <PhotoFeedPage
          {...{ photos, photosCount }}
        />
      : <PhotosEmptyState />
  );
}
