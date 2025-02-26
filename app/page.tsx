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
import { MarkdownRenderer } from '../utils/MarkdownRenderer';

const HIVE_USERNAME = process.env.NEXT_PUBLIC_HIVE_USERNAME || '';

export const revalidate = 0;
export const dynamic = 'force-dynamic';

const getPhotosCached = cache(async () => {
  const hiveAuth = new HiveAuth();
  console.log('Searching for posts for:', HIVE_USERNAME);

  const posts = await hiveAuth.getUserPosts(
    HIVE_USERNAME,
    INFINITE_SCROLL_FEED_INITIAL,
  );

  const uniqueMediaMap = new Map();

  posts.forEach((post) => {
    try {
      const medias = MarkdownRenderer.extractImagesFromMarkdown(post.body);

      medias.forEach((media) => {
        const key = media.url;
        if (!uniqueMediaMap.has(key)) {
          uniqueMediaMap.set(key, {
            id: `${post.id}-${media.url.split('/').pop()}`,
            url: media.url,
            type: media.type,
            ipfsHash: MarkdownRenderer.getIpfsHash(media.url),
            title: post.title || '',
            createdAt: new Date(post.created),
            updatedAt: new Date(post.last_update),
            blurData: '',
            tags: Array.isArray(JSON.parse(post.json_metadata).tags)
              ? JSON.parse(post.json_metadata).tags
              : [],
            takenAt: new Date(),
            takenAtNaive: new Date().toISOString(),
            takenAtNaiveFormatted: new Date().toLocaleDateString(),
            extension: media.url.split('.').pop()?.toLowerCase() ||
              (media.type === 'video' ? 'mp4' : 'jpg'),
            aspectRatio: media.type === 'video' ? 1.777 : 1,
            camera: null,
            simulation: null,
          });
        }
      });

      console.log('Mídias extraídas:', Array.from(uniqueMediaMap.values()));
    } catch (error) {
      console.error('Error processing post:', error);
    }
  });

  const photos = Array.from(uniqueMediaMap.values());
  console.log('Total unique media items:', photos.length);
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