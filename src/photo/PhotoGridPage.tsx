'use client';
import { Cameras } from '@/camera';
import CollapsibleFooterTags from '@/components/CollapsibleFooterTags';
import { FilmSimulations } from '@/simulation';
import { useAppState } from '@/state/AppState';
import { Tags } from '@/tag';
import { useEffect } from 'react';
import PhotoGridContainer from './PhotoProjectsContainer';
import { Photo } from './components/types';

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

  return (
    <>
      <div >
        <PhotoGridContainer
          cacheKey={`page-${PATH_GRID_INFERRED}`}
          media={photos.map(photo => ({
            ...photo,
            type: photo.type === 'video' ? 'video' : 'photo',
            thumbnailSrc: photo.type === 'video' ? photo.thumbnailSrc : undefined,
            videoUrl: photo.type === 'video' ? photo.src : undefined
          }))}
          sidebar={undefined}
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