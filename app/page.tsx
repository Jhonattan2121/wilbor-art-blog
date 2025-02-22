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
  console.log('Searching for posts for:', HIVE_USERNAME);

  const posts = await hiveAuth.getUserPosts(
    HIVE_USERNAME,
    INFINITE_SCROLL_FEED_INITIAL,
  );

  const photos: Photo[] = [];
  posts.forEach((post) => {
    try {
      const json = JSON.parse(post.json_metadata);
      const images = [
        ...(json.image || []),
        ...(json.images || [])
      ];

      images.forEach((url: string) => {
        const isIpfs = url.includes('ipfs/');
        const ipfsHash = isIpfs ? url.split('ipfs/')
        [1].split('?')[0].split('/')[0] : null;

        const now = new Date();
        photos.push({
          id: `${post.id}-${url.split('/').pop()}`,
          url: url,
          ipfsHash: isIpfs ? ipfsHash : null,
          title: post.title || '',
          createdAt: new Date(post.created || now),
          updatedAt: new Date(post.last_update || now),
          blurData: '',
          tags: Array.isArray(JSON.parse(post.json_metadata).tags)
            ? JSON.parse(post.json_metadata).tags
            : [],
          takenAt: now,
          takenAtNaive: now.toISOString(),
          takenAtNaiveFormatted: now.toLocaleDateString(),
          extension: url.split('.').pop() || '',
          aspectRatio: 1,
          camera: null,
          simulation: null,
        });
      });
    } catch (error) {
      console.error('Error processing post:', {
        postId: post.id,
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  console.log('Total photos processed:', photos.length);
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