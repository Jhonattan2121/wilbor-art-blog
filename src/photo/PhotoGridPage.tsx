'use client';
import { Cameras } from '@/camera';
import { FilmSimulations } from '@/simulation';
import { useAppState } from '@/state/AppState';
import { Tags } from '@/tag';
import { useEffect } from 'react';
import { Photo } from './components/types';
import PhotoGridContainer from './PhotoProjectsContainer';

const PATH_GRID_INFERRED = 'projects';

export default function PhotoGridPage({
  photos,
  photosCount,
  tags,
  cameras,
  simulations,
  selectedTag,
  setSelectedTag,
  username,
  postingKey,
  isEditMode
}: {
  photos: Photo[],
  photosCount: number,
  tags: Tags,
  cameras: Cameras,
  simulations: FilmSimulations,
  selectedTag: string | null,
  setSelectedTag: (tag: string | null) => void,
  username?: string | null,
  postingKey?: string | null,
  isEditMode?: boolean
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
          media={photos.map(photo => ({
            ...photo,
            type: photo.type === 'video' ? 'video' : 'photo',
            thumbnailSrc: photo.type === 'video' ? photo.thumbnailSrc : undefined,
            videoUrl: photo.type === 'video' ? photo.src : undefined
          }))}
          sidebar={undefined}
          selectedTag={selectedTag}
          setSelectedTag={setSelectedTag}
          username={username}
          postingKey={postingKey}
          isEditMode={isEditMode}
        />
      </div>
    </>
  );
}