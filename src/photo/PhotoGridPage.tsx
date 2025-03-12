'use client';
import { Cameras } from '@/camera';
import CollapsibleFooterTags from '@/components/CollapsibleFooterTags';
import { FilmSimulations } from '@/simulation';
import { useAppState } from '@/state/AppState';
import { Tags } from '@/tag';
import clsx from 'clsx';
import { useEffect } from 'react';
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

  useEffect(() => {
    console.log('Tags recebidas:', tags);
  }, [tags]);

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
    <>
      <div className="pb-20">
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
              'sticky top-0 pt-5',
              'w-full max-w-[250px]',
              'md:min-w-[200px]'
            )}>
              {renderGuard('top')}
              <div className={clsx(
                'overflow-y-auto',
                'max-h-[calc(100vh-100px)]',
                'scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700',
                'scrollbar-track-transparent',
                'px-2 py-4'
              )}>


                <div className="py-4 text-sm  dark:text-gray-400">
                  {photosCount} {photosCount === 1 ? 'photo' : 'photos'}
                </div>
              </div>
              {renderGuard('bottom')}
            </div>

          }
          canSelect
        />
      </div>
      {Object.keys(tags).length > 0 ? (
        <CollapsibleFooterTags tags={tags.map(tag => tag.tag)} />

      ) : (

        console.log('Tags não disponíveis')
      )}

    </>
  );
}