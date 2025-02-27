'use client';

import { PATH_GRID_INFERRED } from '@/app/paths';
import { Cameras } from '@/camera';
import { FilmSimulations } from '@/simulation';
import { useAppState } from '@/state/AppState';
import { Tags } from '@/tag';
import clsx from 'clsx/lite';
import { useEffect } from 'react';
import { Photo } from '../../app/grid/types';
import PhotoGridContainer from './PhotoGridContainer';
import PhotoGridSidebar from './PhotoGridSidebar';

export default function PhotoGridPage({
  photos,
  photosCount,
  tags,
  cameras,
  simulations,
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
      photos={photos.map(photo => ({
        ...photo,
      
      }))}
      count={photosCount}
      sidebar={
        <div
          className={clsx(
            'sticky top-0 -mb-5 -mt-5',
            'max-h-screen h-full',
          )}
        >
          {renderGuard('top')}
          <div className={clsx(
            'max-h-full overflow-y-auto [scrollbar-width:none]',
            'py-4',
          )}>
            <PhotoGridSidebar
              tags={tags}
              cameras={cameras}
              simulations={simulations}
              photosCount={photosCount}
            />
          </div>
          {renderGuard('bottom')}
        </div>
      }
      canSelect
    />
  );
}
