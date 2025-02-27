'use client';

import { SHOULD_PREFETCH_ALL_LINKS } from '@/app/config';
import { pathForPhoto } from '@/app/paths';
import ImageMedium from '@/components/image/ImageMedium';
import LinkWithStatus from '@/components/LinkWithStatus';
import Spinner from '@/components/Spinner';
import useVisible from '@/utility/useVisible';
import { clsx } from 'clsx/lite';
import { marked } from 'marked'; // Importando marked para renderizar markdown
import { useRef } from 'react';
import { doesPhotoNeedBlurCompatibility, PhotoSetCategory } from '.';
import { Photo } from '../../app/grid/types'; // Corrigido: importando do lugar correto

export default function PhotoMedium({
  photo,
  tag,
  camera,
  simulation,
  focal,
  selected,
  priority,
  prefetch = SHOULD_PREFETCH_ALL_LINKS,
  className,
  onVisible,
}: {
  photo: Photo // Agora usando o Photo do grid/types
  selected?: boolean
  priority?: boolean
  prefetch?: boolean
  className?: string
  onVisible?: () => void
} & PhotoSetCategory) {
  const ref = useRef<HTMLAnchorElement>(null);

  useVisible({ ref, onVisible });

  const renderMarkdown = (content: string) => {
    return marked(content);
  };

  return (
    <LinkWithStatus
      ref={ref}
      href={pathForPhoto({ photo, tag, camera, simulation, focal })}
      className={clsx(
        'active:brightness-75',
        selected && 'brightness-50',
        className,
      )}
      prefetch={prefetch}
    >
      {({ isLoading }) => (
        <div className="relative w-full h-full">
          {isLoading && (
            <div className={clsx(
              'absolute inset-0 flex items-center justify-center',
              'text-white bg-black/25 backdrop-blur-xs',
              'animate-fade-in',
              'z-10',
            )}>
              <Spinner size={20} color="text" />
            </div>
          )}
          
          {photo.type === 'video' ? ( // Usando photo.type ao invés de isVideo
            <>
              <video
                src={photo.url}
                className="absolute inset-0 w-full h-full object-cover"
                autoPlay
                muted
                loop
                playsInline
                controls={false}
              />
              {photo.title && (
                <div 
                  className="absolute bottom-0 left-0 right-0 p-2 bg-black 
                    bg-opacity-50 text-white text-sm z-20"
                  dangerouslySetInnerHTML={{ 
                    __html: renderMarkdown(photo.title),
                  }}
                />
              )}
            </>
          ) : (
            <>
              <ImageMedium
                src={photo.url}
                aspectRatio={photo.aspectRatio}
                blurDataURL={photo.blurData}
                blurCompatibilityMode={doesPhotoNeedBlurCompatibility(photo)}
                className="flex object-cover w-full h-full"
                imgClassName="object-cover w-full h-full"
                alt={photo.title || ""}
                priority={priority}
              />
              {photo.title && (
                <div 
                  className="absolute bottom-0 left-0 right-0 p-2 bg-black 
                    bg-opacity-50 text-white text-sm z-20"
                  dangerouslySetInnerHTML={{ 
                    __html: renderMarkdown(photo.title),
                  }}
                />
              )}
            </>
          )}
        </div>
      )}
    </LinkWithStatus>
  );
}
