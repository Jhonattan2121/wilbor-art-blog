'use client';

import SiteGrid from '@/components/SiteGrid';
import { clsx } from 'clsx/lite';
import Image from 'next/image';
import Link from 'next/link';
import { JSX, useState } from 'react';

export interface Photo {
  cameraKey?: string;
  camera?: any;
  simulation?: any;
  id: string;
  url: string;
  src: string;
  title: string;
  type: 'photo' | 'video';
  thumbnailSrc?: string;
  videoUrl?: string;
  width: number;
  height: number;
  blurData: string;
  tags: string[];
  takenAt: Date;
  takenAtNaive: string;
  takenAtNaiveFormatted: string;
  updatedAt: Date;
  createdAt: Date;
  aspectRatio: number;
  priority: boolean;
  extension: string;
  focalLengthFormatted?: string;
  focalLengthIn35MmFormatFormatted?: string;
  fNumberFormatted?: string;
  isoFormatted?: string;
  exposureTimeFormatted?: string;
  exposureCompensationFormatted?: string;
  hiveMetadata?: {
    author: string;
    permlink: string;
    body: string;
  };
  author?: string;
  permlink?: string;
}

interface Media {
  id: string;
  url: string;
  src: string;
  title: string;
  type: 'photo' | 'video';
  thumbnailSrc?: string;
  width?: number;
  videoUrl?: string;
  height?: number;
}

interface PhotoGridContainerProps {
  cacheKey: string;
  media: Media[];
  count: number;
  sidebar?: JSX.Element;
  canSelect?: boolean;
  header?: JSX.Element;
  animateOnFirstLoadOnly?: boolean;

}

const isValidImage = (url: string): boolean => {
  if (url.includes('hackmd.io/_uploads/')) {
    return true;
  }
  if (url.includes('ipfs.skatehive.app/ipfs/')) {
    return true;
  }
  if (url.includes('.blob.vercel-storage.com/')) {
    return true;
  }
  if (url.includes('files.peakd.com/')) {
    return true;
  }
  const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
  const hasValidExtension = validExtensions.some(ext =>
    url.toLowerCase().endsWith(ext)
  );

  if (hasValidExtension) {
    console.log('✅ URL com extensão válida:', url);
    return true;
  }

  console.log('❌ URL inválida:', url);
  return false;
};

const MediaItem = ({ item }: { item: Media }) => {
  const [imageError, setImageError] = useState(false);

  if (item.type === 'photo' && isValidImage(item.src)) {
    return (
      <div className="relative group">
        <Link
          href={`/p/${item.id}`}
          className="block aspect-square overflow-hidden 
          rounded-lg hover:opacity-95 transition-all duration-300
           transform hover:scale-[1.02]"
        >
          <Image
            src={item.src}
            alt={item.title || ''}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
            quality={85}
            priority={false}
            onError={(e) => {
              console.error('❌ Erro ao carregar imagem:', item.src);
              setImageError(true);
            }}
            unoptimized={true}
          />
          <div className="absolute bottom-0 left-0 right-0
           bg-black bg-opacity-50 p-2 opacity-0 group-hover:opacity-100
            transition-opacity duration-300">
            <h3 className="text-white text-sm truncate">
              {item.title || 'Sem título'}
            </h3>
          </div>
          {imageError && (
            <div className="absolute inset-0 bg-gray-200 flex 
            items-center justify-center">
              <span className="text-gray-500">Erro ao carregar imagem</span>
            </div>
          )}
        </Link>
      </div>
    );
  }

  return null;
};

function removeDuplicates(media: Media[]): Media[] {
  const mediaMap = new Map<string, Media>();

  media.forEach(item => {
    const key = `${item.id}-${item.src}`;

    if (!mediaMap.has(key)) {
      mediaMap.set(key, item);
    }
  });

  return Array.from(mediaMap.values());
}

export default function PhotoGridContainer({
  sidebar,
  media = [],
  header,
  ...props
}: PhotoGridContainerProps) {

  const uniqueMedia = removeDuplicates(media);

  if (!Array.isArray(media)) {
    console.warn('Media não é um array:', media);
    return null;
  }

  const validatedMedia = uniqueMedia.map(item => ({
    ...item,
    title: item.title || `Media of ${item.id}`
  }));

  return (
    <SiteGrid
      contentMain={
        <div className={clsx(
          'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
          header && 'space-y-8 mt-1.5'
        )}>
          {header}
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {validatedMedia.length > 0 ? (
              uniqueMedia.map((item) => (
                <MediaItem
                  key={`${item.id}-${item.src}`}
                  item={item}

                />

              ))
            ) : (
              <div className="col-span-full text-center py-8 text-gray-500">
                Nenhuma mídia encontrada
              </div>
            )}
          </div>
        </div>
      }
      contentSide={sidebar}
      sideHiddenOnMobile
    />
  );
}