import {
  INFINITE_SCROLL_FEED_INITIAL,
  INFINITE_SCROLL_FEED_MULTIPLE,
  Photo as PhotoIndex,
} from '.';
import { Photo as GridPhoto } from '../../app/grid/types';
import PhotosLarge from './PhotosLarge';
import PhotosLargeInfinite from './PhotosLargeInfinite';

const mapToGridPhoto = (photo: PhotoIndex): GridPhoto => ({
  ...photo,
  camera: null,
  title: photo.title || '',
  createdAt: photo.createdAt || new Date(),
  updatedAt: photo.updatedAt || new Date(),
  takenAt: photo.takenAt || new Date(),
  takenAtNaive: photo.takenAtNaive || new Date().toISOString(),
  takenAtNaiveFormatted: photo.takenAtNaiveFormatted ||
    new Date().toLocaleDateString(),
  extension: photo.extension || '',
  aspectRatio: photo.aspectRatio || 1,
  blurData: photo.blurData || '',
  tags: photo.tags || [],
  simulation: null
});

export default function PhotoFeedPage({
  photos,
  photosCount,
}: {
  photos: PhotoIndex[]
  photosCount: number
}) {
  const gridPhotos = photos.map(mapToGridPhoto);

  return (
    <div className="flex flex-col items-center w-full p-4">
      <div className="w-full max-w-[1200px]">
        <PhotosLarge photos={gridPhotos} />
        {photosCount > photos.length &&
          <PhotosLargeInfinite
            initialOffset={INFINITE_SCROLL_FEED_INITIAL}
            itemsPerPage={INFINITE_SCROLL_FEED_MULTIPLE}
          />}
      </div>
    </div>
  );
}
