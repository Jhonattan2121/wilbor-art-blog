import { IS_PRODUCTION, STATICALLY_OPTIMIZED_PHOTOS } from '@/app/config';
import {
  absolutePathForPhoto,
  absolutePathForPhotoImage,
  PATH_ROOT
} from '@/app/paths';
import { getPost as fetchHivePost } from '@/lib/hive/hive-client';
import {
  descriptionForPhoto,
  RELATED_GRID_PHOTOS_TO_SHOW,
  titleForPhoto,
} from '@/photo';
import { getPhotosNearIdCached } from '@/photo/cache';
import { GENERATE_STATIC_PARAMS_LIMIT } from '@/photo/db';
import { getPhotoIds } from '@/photo/db/query';
import { redirect } from 'next/navigation';
import { Metadata } from 'next/types';
import { cache } from 'react';
import { PhotoGalleryClient } from './PhotoGalleryClient';
import { MarkdownRenderer } from '@/lib/markdown/MarkdownRenderer';

export const maxDuration = 60;

const getPhotosNearIdCachedCached = cache((photoId: string) =>
  getPhotosNearIdCached(photoId, { limit: RELATED_GRID_PHOTOS_TO_SHOW + 2 }));

export let generateStaticParams:
  (() => Promise<{ photoId: string }[]>) | undefined = undefined;

if (STATICALLY_OPTIMIZED_PHOTOS && IS_PRODUCTION) {
  generateStaticParams = async () => {
    const photos = await getPhotoIds({ limit: GENERATE_STATIC_PARAMS_LIMIT });
    return photos.map(photoId => ({ photoId }));
  };
}

interface PhotoProps {
  params: Promise<{
    author: string;
    permlink: string;
    photoId: string;
  }>
}

export async function generateMetadata({
  params,
}: PhotoProps): Promise<Metadata> {
  const { photoId } = await params;
  const { photo } = await getPhotosNearIdCachedCached(photoId);

  if (!photo) { return {}; }

  const title = titleForPhoto(photo);
  const description = descriptionForPhoto(photo);
  const images = absolutePathForPhotoImage(photo);
  const url = absolutePathForPhoto({ photo });

  return {
    title,
    description,
    openGraph: {
      title,
      images,
      description,
      url,
    },
    twitter: {
      title,
      description,
      images,
      card: 'summary_large_image',
    },
  };
}

const extractIpfsHash = (url: string) => {
  // Debug
  console.log('Received URL:', url);

  const patterns = [
    /ipfs\.skatehive\.app\/ipfs\/([A-Za-z0-9]+)/,
    /\/ipfs\/([A-Za-z0-9]+)/,
    /^([A-Za-z0-9]+)$/
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      console.log('Hash found:', match[1]);
      return match[1];
    }
  }

  console.log('No IPFS hash found');
  return '';
};

const fetchPhoto = async (id: string) => {
  try {
    const cleanId = id.replace(/\/+/g, '/').trim();
    console.log('Clean ID:', cleanId);

    const variations = [
      cleanId,
      cleanId.replace(/^\//, ''),
      cleanId.replace(/-/g, '/'),
      cleanId.split('/').pop() || ''
    ];

    for (const variation of variations) {
      console.log('Trying variation:', variation);
      const result = await getPhotosNearIdCachedCached(variation);
      if (result?.photo) {
        console.log('Photo found with variation:', variation);
        return result;
      }
    }

    return null;
  } catch (error) {
    console.error('Error fetching photo:', error);
    return null;
  }
};

export default async function PhotoPage({
  params,
}: PhotoProps) {
  const { author, permlink, photoId } = await params;

  try {
    const hivePost = await fetchHivePost(author, permlink);
    console.log('Hive post found:', !!hivePost);

    if (!hivePost) {
      console.log('Post not found in Hive');
      redirect(PATH_ROOT);
    }

    // Extrair mídia usando o MarkdownRenderer
    const mediaItems = MarkdownRenderer.extractMediaFromHive(hivePost);
    console.log('Mídia encontrada:', mediaItems);

    const processedBody = hivePost.body
  .replace(/<center>[\s\S]*?3Speak[\s\S]*?<\/center>/g, '')
  .replace(/▶️[\s\S]*?3Speak/g, '')
  .replace(/<iframe[\s\S]*?<\/iframe>/g, '')
  .replace(/<img[\s\S]*?>/g, '')
  .replace(/!\[.*?\]\(.*?\)/g, '')
  .replace(/https?:\/\/[^\s<>"']+?\.(?:jpg|jpeg|gif|png|webp)(?:\?[^\s<>"']*)?/gi, '')
  .replace(/<center>\s*<\/center>/g, '')
  .replace(/<[^>]*>/g, '')
  .replace(/\n{3,}/g, '\n\n')
  .replace(/^\s+|\s+$/gm, '')
  .trim();

    return (
      <div className="photo-container">
        <PhotoGalleryClient
          media={mediaItems}
          postTitle={hivePost.title}
          postBody={processedBody}
        />
      </div>
    );

  } catch (error) {
    console.error('Detailed error:', error);
    redirect(PATH_ROOT);
  }
}
