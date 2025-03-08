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
  type: 'photo' | 'video' | 'iframe';
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
  iframeHtml?: string;
}

interface Media {
  id: string;
  url: string;
  src: string;
  title: string;
  type: 'photo' | 'video' | 'iframe';
  thumbnailSrc?: string;
  width?: number;
  videoUrl?: string;
  height?: number;
  iframeHtml?: string;
  tags?: string[];
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


const MediaItem = ({ item }: { item: Media & { hiveMetadata?: { body: string } } }) => {
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const renderMedia = () => {
    console.log('Rendering media:', { 
      type: item.type, 
      src: item.src, 
      includes: item.src?.includes('ipfs.skatehive.app/ipfs/') 
    });

    if (item.src?.includes('ipfs.skatehive.app/ipfs/')) {
      return (
        <div className="relative w-full h-full aspect-square overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <iframe
            src={`${item.src}?autoplay=1&mute=1&controls=0&loop=1&showinfo=0&modestbranding=1&playsinline=1&enablejsapi=1&origin=${window.location.origin}&preload=auto&loading=lazy`}
            className="w-[200%] h-[200%]"
            style={{
              transform: 'scale(0.7)',
              transformOrigin: 'center',
              pointerEvents: 'none'
            }}
          allow="autoplay"
              frameBorder="0"
          />
        </div>
      </div>

         
      );
    }
    
    // Check other media types
    if (item.type === 'photo') {
      return (

        <Image
          src={item.src}
          alt={item.title || ''}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
          quality={85}
          onError={() => setImageError(true)}
          unoptimized={true}
        />
      );
    }
    return null;
  };



  return (
    <Link href={`/p/${item.id}`} className="block">
      <div
        className="relative group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="aspect-square overflow-hidden rounded-lg hover:opacity-95 transition-all duration-300 transform hover:scale-[1.02]">
          <div className="w-full h-full flex items-center justify-center">
            {renderMedia()}
          </div>
          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <h3 className="text-white text-sm truncate">
              {item.title || 'No title'}
            </h3>
          </div>
        </div>

        {imageError && (
          <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
            <span className="text-gray-500">Failed to load media</span>
          </div>
        )}
      </div>
    </Link>
  );
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
    console.warn('Media is not an array:', media);
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
                No media found
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