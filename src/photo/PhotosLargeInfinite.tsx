'use client';

import { PATH_FEED_INFERRED } from '@/app/paths';
import { Photo } from '../../app/grid/types';
import InfinitePhotoScroll from './InfinitePhotoScroll';
import PhotosLarge from './PhotosLarge';

export default function PhotosLargeInfinite({
  initialOffset,
  itemsPerPage,
}: {
  initialOffset: number
  itemsPerPage: number
}) {
  return (
    <InfinitePhotoScroll
      cacheKey={`page-${PATH_FEED_INFERRED}`}
      initialOffset={initialOffset}
      itemsPerPage={itemsPerPage}
      wrapMoreButtonInGrid
    >
      {({ photos, onLastPhotoVisible, revalidatePhoto }) =>
        <PhotosLarge
          onLastPhotoVisible={onLastPhotoVisible}
          revalidatePhoto={revalidatePhoto}
          photos={photos as Photo[]}
        />}
    </InfinitePhotoScroll>
  );
}
