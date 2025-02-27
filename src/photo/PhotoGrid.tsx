'use client';

import { GRID_ASPECT_RATIO } from '@/app/config';
import AnimateItems from '@/components/AnimateItems';
import SelectTileOverlay from '@/components/SelectTileOverlay';
import { useAppState } from '@/state/AppState';
import { clsx } from 'clsx/lite';
import { JSX } from 'react';
import { PhotoSetCategory } from '.';
import { ImageMedia, Photo, VideoMedia } from '../../app/grid/types';
import PhotoMedium from './PhotoMedium';

const convertToGridPhoto = (photo: Photo): Photo => {
  const isVideo = photo.url?.toLowerCase().match(/\.(mp4|webm|ogg|mov)$/i);
  
  if (isVideo) {
    return {
      ...photo,
      type: 'video',
    } as VideoMedia;
  }
  
  return {
    ...photo,
    type: 'image',
  } as ImageMedia;
};

export default function PhotoGrid({
  photos,
  selectedPhoto,
 
  photoPriority,
  fast,
  animate = true,
  canStart,
  animateOnFirstLoadOnly,
  staggerOnFirstLoadOnly = true,
  additionalTile,
  small,
  canSelect,
  onLastPhotoVisible,
  onAnimationComplete,
}: {
  photos: Photo[]
  selectedPhoto?: Photo
  photoPriority?: boolean
  fast?: boolean
  animate?: boolean
  canStart?: boolean
  animateOnFirstLoadOnly?: boolean
  staggerOnFirstLoadOnly?: boolean
  additionalTile?: JSX.Element
  small?: boolean
  canSelect?: boolean
  onLastPhotoVisible?: () => void
  onAnimationComplete?: () => void
} & PhotoSetCategory) {
  const {
    isUserSignedIn,
    selectedPhotoIds,
    setSelectedPhotoIds,
    isGridHighDensity,
  } = useAppState();

  return (
    <AnimateItems
      className={clsx(
        'grid gap-0.5 sm:gap-1',
        small
          ? 'grid-cols-3 xs:grid-cols-6'
          : isGridHighDensity
            ? 'grid-cols-2 xs:grid-cols-4 lg:grid-cols-6'
            : 'grid-cols-2 sm:grid-cols-4 md:grid-cols-3 lg:grid-cols-4',
        'items-center',
      )}
      type={animate === false ? 'none' : undefined}
      canStart={canStart}
      duration={fast ? 0.3 : undefined}
      staggerDelay={0.075}
      distanceOffset={40}
      animateOnFirstLoadOnly={animateOnFirstLoadOnly}
      staggerOnFirstLoadOnly={staggerOnFirstLoadOnly}
      onAnimationComplete={onAnimationComplete}
      items={photos.map((photo, index) => {
        const isSelected = selectedPhotoIds?.includes(photo.id) ?? false;
        const processedPhoto = convertToGridPhoto(photo); // Convertendo a foto

        return (
          <div
            key={photo.id}
            className={clsx(
              GRID_ASPECT_RATIO !== 0 && 'flex relative overflow-hidden',
              'group',
            )}
            style={{
              ...GRID_ASPECT_RATIO !== 0 && {
                aspectRatio: GRID_ASPECT_RATIO,
              },
            }}
          >
            <PhotoMedium
              className={clsx(
                'flex w-full h-full',
                selectedPhotoIds?.length !== undefined && 'pointer-events-none',
              )}
              photo={processedPhoto} // Usando a foto processada
              selected={photo.id === selectedPhoto?.id}
              priority={photoPriority}
              onVisible={index === photos.length - 1
                ? onLastPhotoVisible
                : undefined}
            />
            {isUserSignedIn && canSelect && selectedPhotoIds !== undefined && (
              <SelectTileOverlay
                isSelected={isSelected}
                onSelectChange={() => setSelectedPhotoIds?.(
                  isSelected
                    ? selectedPhotoIds.filter(id => id !== photo.id)
                    : [...selectedPhotoIds, photo.id]
                )}
              />
            )}
          </div>
        );
      }).concat(additionalTile ?? [])}
      itemKeys={photos.map(photo => photo.id)
        .concat(additionalTile ? ['more'] : [])}
    />
  );
}
