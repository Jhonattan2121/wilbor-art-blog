'use client';

import { ComponentProps } from 'react';
import { INFINITE_SCROLL_GRID_MULTIPLE } from '.';
import { Photo } from '../../app/grid/types';
import InfinitePhotoScroll from './InfinitePhotoScroll';
import PhotoGrid from './PhotoGrid';

export default function PhotoGridInfinite({
  cacheKey,
  initialOffset,
  canStart,
  tag,
  camera,
  simulation,
  focal,
  animateOnFirstLoadOnly,
  canSelect,
}: {
  cacheKey: string
  initialOffset: number
} & Omit<ComponentProps<typeof PhotoGrid>, 'photos'>) {
  return (
    <InfinitePhotoScroll
      cacheKey={cacheKey}
      initialOffset={initialOffset}
      itemsPerPage={INFINITE_SCROLL_GRID_MULTIPLE}
      tag={tag}
      camera={camera}
      simulation={simulation}
    >
      {({ photos, onLastPhotoVisible }) =>
        <PhotoGrid {...{
          photos: photos as Photo[],
          canStart,
          tag,
          camera,
          simulation,
          focal,
          onLastPhotoVisible,
          animateOnFirstLoadOnly,
          canSelect,
        }} />}
    </InfinitePhotoScroll>
  );
}
