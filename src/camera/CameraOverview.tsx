import { Photo, PhotoDateRange } from '@/photo';
import PhotoGridContainer from '@/photo/PhotoGridContainer';
import { Camera, createCameraKey } from '.';
import CameraHeader from './CameraHeader';

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
    }} />
  );
}
