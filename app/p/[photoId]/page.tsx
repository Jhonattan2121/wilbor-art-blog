import { IS_PRODUCTION, STATICALLY_OPTIMIZED_PHOTOS } from '@/app/config';
import {
  absolutePathForPhoto,
  absolutePathForPhotoImage
} from '@/app/paths';
import { HiveAuth } from '@/auth/hive/HiveAuth';
import {
  RELATED_GRID_PHOTOS_TO_SHOW,
  descriptionForPhoto,
  titleForPhoto,
} from '@/photo';
import { getPhotosNearIdCached } from '@/photo/cache';
import { GENERATE_STATIC_PARAMS_LIMIT } from '@/photo/db';
import { getPhotoIds } from '@/photo/db/query';
import { Metadata } from 'next/types';
import { cache } from 'react';
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

interface Props {
  params: {
    photoId: string;
  };
  searchParams: Record<string, string>;
}

interface PhotoProps {
  params: {
    photoId: string;
  };
}

export async function generateMetadata({
  params,
}: PhotoProps): Promise<Metadata> {
  const { photoId } = params;
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

interface TargetPhoto {
  id: string;
  url: string;
  title: string;
  createdAt: Date;
  content: string;
  tags: string[];
}
const HIVE_USERNAME = process.env.NEXT_PUBLIC_HIVE_USERNAME || '';

export default async function PhotoPage({ params }: Props) {
  const { photoId } = params;
  try {
    const hiveAuth = new HiveAuth();
    console.log('Debug - PhotoID recebido:', photoId);

    const posts = await hiveAuth.getUserPosts(HIVE_USERNAME, 20);

    if (!posts?.length) {
      console.log('Debug - No posts returned from Hive API');
      return <div>Nenhum post encontrado</div>;
    }

    console.log('Debug - Number of posts found:', posts.length);

    const post = posts.find(post => {
      try {
        const metadata = JSON.parse(post.json_metadata);
        const allImages = [
          ...(metadata.image || []),
          ...(metadata.images || [])
        ];

        const cleanPhotoId = photoId.replace(/[^a-zA-Z0-9]/g, '');

        return allImages.some(image => {
          const cleanImage = image.toString().replace(/[^a-zA-Z0-9]/g, '');
          return cleanImage.includes(cleanPhotoId);
        });
      } catch (error) {
        console.error('Error processing post metadata:', error);
        return false;
      }
    });

    if (!post) {
      console.log('Post not found for ID:', photoId);
      return <div>Post not found</div>;
    }

    const metadata = JSON.parse(post.json_metadata);
    const targetPhoto: TargetPhoto = {
      id: post.id,
      url: metadata.image?.[0] || metadata.images?.[0] || '',
      title: post.title,
      createdAt: new Date(post.created),
      content: post.body,
      tags: metadata.tags || [],
    };

    return (
      <article className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg overflow-hidden">
          {/* Header com título e data */}
          {/* <header className="px-6 pt-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {targetPhoto.title}
            </h1>
            <time
              className="text-sm text-gray-500 dark:text-gray-400"
              dateTime={targetPhoto.createdAt.toISOString()}
            >
              {targetPhoto.createdAt.toLocaleDateString('pt-BR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </time>
          </header> */}


          <div className="mt-6 mb-6">
            <div className="relative aspect-video">
              <img
                src={targetPhoto.url}
                alt={targetPhoto.title}
                className="w-full h-full object-cover"
              />
            </div>
          </div>


          <div className="px-6 pb-6">
            <div className="prose prose-lg dark:prose-invert max-w-none mb-6">
              {targetPhoto.content}
            </div>


            {/* {targetPhoto.tags.length > 0 && (
              <div>
                <div className="flex flex-wrap gap-2">
                  {targetPhoto.tags.map(tag => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-3 py-1 
                             bg-gray-100 dark:bg-gray-800 
                             text-gray-700 dark:text-gray-300 
                             text-sm rounded-full 
                             hover:bg-gray-200 dark:hover:bg-gray-700 
                             transition-colors duration-200"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )} */}
          </div>
        </div>
      </article>
    );

  } catch (error) {
    console.error('Error processing page:', error);
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md">
          <div className="mb-6">
            <svg
              className="mx-auto h-14 w-14 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <p className="text-gray-600 mb-6">
            Unable to load post content.
            Please try again later.
          </p>
        </div>
      </div>
    );
  }
}