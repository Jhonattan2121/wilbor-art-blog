import {
  INFINITE_SCROLL_FEED_INITIAL,
  INFINITE_SCROLL_FEED_MULTIPLE,
} from '.';
import { ImageMedia, Photo, VideoMedia } from '../../app/grid/types';
import PhotosLarge from './PhotosLarge';
import PhotosLargeInfinite from './PhotosLargeInfinite';

const mapToGridPhoto = (photo: Photo): Photo => {
  const baseProps = {
    ...photo,
    camera: photo.camera || null,
    title: "photo.title || ''",
    createdAt: photo.createdAt || new Date(),
    updatedAt: photo.updatedAt || new Date(),
    takenAt: photo.takenAt || new Date(),
    takenAtNaive: photo.takenAtNaive || new Date().toISOString(),
    takenAtNaiveFormatted: photo.takenAtNaiveFormatted ||
      new Date().toLocaleDateString(),
    aspectRatio: photo.aspectRatio || 1,
    blurData: photo.blurData || '',
    tags: photo.tags || [],
    simulation: photo.simulation || null,
  };

  if (photo.type === 'video') {
    return {
      ...baseProps,
      type: 'video',
      extension: (photo as VideoMedia).extension || 'mp4',
      duration: (photo as VideoMedia).duration || 0,
      thumbnailUrl: (photo as VideoMedia).thumbnailUrl || '',
    } as VideoMedia;
  }

  return {
    ...baseProps,
    type: 'image',
    extension: (photo as ImageMedia).extension || '',
  } as ImageMedia;
};

export default function PhotoFeedPage({
  photos,
  photosCount,
}: {
  photos: Photo[]
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
