import {
  INFINITE_SCROLL_FEED_INITIAL,
  generateOgImageMetaForPhotos,
} from '@/photo';
import { getPhotos, getPhotosMeta } from '@/photo/db/query';
import PhotoFeedPage from '@/photo/PhotoFeedPage';
import PhotosEmptyState from '@/photo/PhotosEmptyState';
import { Metadata } from 'next/types';
import { cache } from 'react';
import { Photo } from '../grid/types';

const convertToGridPhoto = (photo: any): Photo => {
  const isVideo = photo.url?.toLowerCase().match(/\.(mp4|webm|ogg|mov)$/i);

  return {
    ...photo,
    type: isVideo ? 'video' : 'image',
    camera: photo.camera || null,
    simulation: photo.simulation || null,
    createdAt: photo.createdAt || new Date(),
    updatedAt: photo.updatedAt || new Date(),
    takenAt: photo.takenAt || new Date(),
    takenAtNaive: photo.takenAtNaive || new Date().toISOString(),
    takenAtNaiveFormatted: photo.takenAtNaiveFormatted ||
      new Date().toLocaleDateString(),
    aspectRatio: photo.aspectRatio || 1,
  };
};

const getPhotosCached = cache(() =>
  getPhotos({
    limit: INFINITE_SCROLL_FEED_INITIAL,
  }).then(photos => photos.map(convertToGridPhoto))
);

export async function generateMetadata(): Promise<Metadata> {
  const photos = await getPhotosCached()
    .catch((): Photo[] => []);
  return generateOgImageMetaForPhotos(photos);
}

export default async function FeedPage() {
  const [
    photos,
    photosCount,
  ] = await Promise.all([
    getPhotosCached()
      .catch((): Photo[] => []),
    getPhotosMeta()
      .then(({ count }) => count)
      .catch(() => 0),
  ]);

  return (
    photos.length > 0
      ? <PhotoFeedPage {...{ photos, photosCount }} />
      : <PhotosEmptyState />
  );
}
