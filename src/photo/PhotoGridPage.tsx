'use client';
import { Cameras } from '@/camera';
import { FilmSimulations } from '@/simulation';
import { useAppState } from '@/state/AppState';
import { Tags } from '@/tag';
import clsx from 'clsx';
import { useEffect } from 'react';
import PhotoGridSidebar from './PhotoGridSidebar';
import PhotoGridContainer, { Photo } from './PhotoProjectsContainer';
const PATH_GRID_INFERRED = 'projects';

export default function PhotoGridPage({
  photos,
  photosCount,
  tags,
  cameras,
  simulations
}: {
  photos: Photo[]
  photosCount: number
  tags: Tags
  cameras: Cameras
  simulations: FilmSimulations
}) {
  const { setSelectedPhotoIds } = useAppState();

  useEffect(
    () => () => setSelectedPhotoIds?.(undefined),
    [setSelectedPhotoIds],
  );

  const renderGuard = (side: 'top' | 'bottom') =>
    <div
      className={clsx(
        'absolute left-0 right-0',
        side === 'top'
          ? 'top-0 bg-linear-to-b from-white dark:from-black'
          : 'bottom-0 bg-linear-to-t from-white dark:from-black',
        'h-6 z-10 pointer-events-none',
      )}
    />;
  return (
    <PhotoGridContainer
      cacheKey={`page-${PATH_GRID_INFERRED}`}
      media={photos.map(photo => ({
        ...photo,
        type: photo.type === 'video' ? 'video' : 'photo',
        thumbnailSrc: photo.type === 'video' ? photo.thumbnailSrc : undefined,
        videoUrl: photo.type === 'video' ? photo.src : undefined
      }))}
      sidebar={
        <div className={clsx(
          'sticky top-0 -mt-5',
        )}>
          {renderGuard('top')}
          <div className={clsx(
            tags.length > 15 ? 'overflow-y-auto' : 'overflow-y-hidden',
            'max-h-[calc(100vh-120px)]',
            '[scrollbar-width:none]',
            'py-4'
          )}>
            <PhotoGridSidebar {...{
              tags,
              cameras,
              simulations,

            }}
            />
            <div className="py-4 text-sm text-gray-500">
              {photosCount} {photosCount === 1 ? 'photo' : 'photos'}
            </div>
          </div>
          {renderGuard('bottom')}
        </div>
      }
      canSelect
    />
  );
}