"use client";

import { Photo, PhotoDateRange } from '@/photo';
import PhotoGridContainer from '@/photo/PhotoProjectsContainer';
import { Camera, createCameraKey } from '.';
import CameraHeader from './CameraHeader';
import { useState } from 'react';

export default function CameraOverview({
  camera,
  photos,
  count,
  dateRange,
  animateOnFirstLoadOnly,
}: {
  camera: Camera,
  photos: Photo[],
  count: number,
  dateRange?: PhotoDateRange,
  animateOnFirstLoadOnly?: boolean,
}) {
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  return (
    <PhotoGridContainer {...{
      cacheKey: `camera-${createCameraKey(camera)}`,
      photos,
      count,
      camera,
      animateOnFirstLoadOnly,
      media: [],
      sidebar: <div></div>,
      header: <CameraHeader {...{
        camera,
        photos,
        count,
        dateRange,
      }} />,
      selectedTag,
      setSelectedTag,
    }} />
  );
}
