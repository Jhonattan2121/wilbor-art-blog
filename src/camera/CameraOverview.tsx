import { Photo, PhotoDateRange } from '@/photo';
import { Camera } from '.';

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
    // <PhotoGridContainer {...{
    //   cacheKey: `camera-${createCameraKey(camera)}`,
    //   photos,
    //   count,
    //   camera,
    //   animateOnFirstLoadOnly,
    //   media: [],
    //   sidebar: <div></div>,
    //   header: <CameraHeader {...{
    //     camera,
    //     photos,
    //     count,
    //     dateRange,
    //   }} />,
    // }} />
    <div></div>
  );
}
