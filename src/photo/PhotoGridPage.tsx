'use client';

import PhotoGridContainer from './PhotoProjectsContainer';
import { Photo } from './components/types';

const PATH_GRID_INFERRED = 'projects';

export default function PhotoGridPage({
  photos,
  photosCount,
  selectedTag,
  setSelectedTag
}: {
  photos: Photo[]
  photosCount: number
  selectedTag: string | null
  setSelectedTag: (tag: string | null) => void
}) {
  return (
    <>
      <div>
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
          selectedTag={selectedTag}
          setSelectedTag={setSelectedTag}
        />
      </div>
    </>
  );
}