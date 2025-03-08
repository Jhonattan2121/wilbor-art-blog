import { IS_PRODUCTION, STATICALLY_OPTIMIZED_PHOTOS } from '@/app/config';
import {
  absolutePathForPhoto,
  absolutePathForPhotoImage,
  PATH_ROOT
} from '@/app/paths';
import { getPost as fetchHivePost } from '@/lib/hive/hive-client';
import { MarkdownRenderer } from '@/lib/markdown/MarkdownRenderer';
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

    // Extract media using MarkdownRenderer
    const mediaItems = MarkdownRenderer.extractMediaFromHive(hivePost);
    console.log('Mídia encontrada:', mediaItems);

    const processedBody = hivePost.body
      .replace(/https:\/\/lime-useful-snake-714\.mypinata\.cloud\/ipfs\/[^\s?]+(\?pinataGatewayToken=[^\s]+)?/g, '')
      .replace(/<center>[\s\S]*?3Speak[\s\S]*?<\/center>/g, '')
      .replace(/▶️[\s\S]*?3Speak/g, '')
      .replace(/<iframe[\s\S]*?<\/iframe>/g, '')
      .replace(/<img[\s\S]*?>/g, '')
      .replace(/!\[.*?\]\(.*?\)/g, '')
      .replace(/https?:\/\/[^\s<>"']+?\.(?:jpg|jpeg|gif|png|webp)(?:\?[^\s<>"']*)?/gi, '')
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
