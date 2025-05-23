import { GRID_HOMEPAGE_ENABLED } from '@/app/config';
import {
  INFINITE_SCROLL_FEED_INITIAL,
  INFINITE_SCROLL_GRID_INITIAL,
} from '@/photo';
import { Photo } from '@/photo/components/types';
import { getPhotoSidebarData } from '@/photo/data';
import { getPhotos, getPhotosMeta } from '@/photo/db/query';
import PhotoFeedPage from '@/photo/PhotoFeedPage';
import PhotosEmptyState from '@/photo/PhotosEmptyState';
import { createMetadata } from '@/utility/metadata';
import { Metadata } from 'next/types';
import { cache } from 'react';
import HomeGridClient from './HomeGridClient';

export const dynamic = 'force-static';
export const maxDuration = 60;

const getPhotosCached = cache(() => getPhotos({
  limit: GRID_HOMEPAGE_ENABLED
    ? INFINITE_SCROLL_GRID_INITIAL
    : INFINITE_SCROLL_FEED_INITIAL,
}));

export async function generateMetadata(): Promise<Metadata> {
  return createMetadata({
    title: 'Início',
    description: 'Wilbor Art - Wilson Domingues é um artista multifacetado do Rio de Janeiro que une skate, arte e audiovisual, com exposições e projetos inovadores em xilogravura e produção cultural.',
    path: '/'
  });
}

function HomeGridClientWrapper({ photos, photosCount, tags, cameras, simulations }: any) {
  return (
    <HomeGridClient
      photos={photos}
      photosCount={photosCount}
      tags={tags}
      cameras={cameras}
      simulations={simulations}
    />
  );
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
        ? <HomeGridClientWrapper
            photos={photos as Photo[]}
            photosCount={photosCount}
            tags={tags}
            cameras={cameras}
            simulations={simulations}
          />
        : <PhotoFeedPage
            {...{ photos, photosCount }}
          />
      : <PhotosEmptyState />
  );
}
