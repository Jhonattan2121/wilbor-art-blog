import { GRID_HOMEPAGE_ENABLED } from '@/app/config';
import { HiveAuth } from '@/auth/hive/HiveAuth';
import {
  INFINITE_SCROLL_FEED_INITIAL,
  generateOgImageMetaForPhotos,
} from '@/photo';
import { getPhotoSidebarData } from '@/photo/data';
import { getPhotosMeta } from '@/photo/db/query';
import PhotoFeedPage from '@/photo/PhotoFeedPage';
import PhotoGridPage from '@/photo/PhotoGridPage';
import { Metadata } from 'next/types';
import { cache } from 'react';
import { Photo } from './grid/types';

const HIVE_USERNAME = process.env.NEXT_PUBLIC_HIVE_USERNAME || '';

export const dynamic = 'force-static';
export const maxDuration = 60;

const getPhotosCached = cache(async () => {
  const hiveAuth = new HiveAuth();
  const posts = await hiveAuth.getUserPosts(
    HIVE_USERNAME,
    INFINITE_SCROLL_FEED_INITIAL,
  );

  const photos: Photo[] = [];
  posts.forEach((post: any) => {
    const json = JSON.parse(post.json_metadata);
    if (json.image) {
      json.image.forEach((url: string) => {
        const now = new Date();
        // Melhorar a extração do ID IPFS
        const ipfsPath = url.includes('ipfs/')
          ? url.split('ipfs/')[1].split('/')[0].split('?')[0]
          : url;

        console.log('Gerando ID para:', {
          originalUrl: url,
          ipfsPath: ipfsPath,
          generatedId: `ipfs/${ipfsPath}`
        });

        photos.push({
          id: ipfsPath,
          url: `${url}`,
          title: post.title,
          createdAt: new Date(post.created),
          updatedAt: new Date(post.last_update),
          blurData: '',
          tags: json.tags || [],
          takenAt: now,
          takenAtNaive: now.toISOString(),
          takenAtNaiveFormatted: now.toLocaleDateString(),
          extension: url.split('.').pop() || '',
          aspectRatio: 1,
          camera: null
        });
      });
    }
  });

  return photos;
});

export async function generateMetadata(): Promise<Metadata> {
  const photos = await getPhotosCached();
  return generateOgImageMetaForPhotos(photos);
}

export default async function FeedPage() {
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

  return photos.length > 0
    ? GRID_HOMEPAGE_ENABLED ? (
      <PhotoGridPage
        photos={photos}
        photosCount={photosCount}
        tags={tags}
        cameras={cameras}
        simulations={simulations}
      />
    ) : (
      <PhotoFeedPage
        photos={photos}
        photosCount={photosCount}
      />
    )
    : null;

}