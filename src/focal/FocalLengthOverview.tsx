import { Photo, PhotoDateRange } from "@/photo";
import PhotoGridContainer from "@/photo/PhotoGridContainer";
import FocalLengthHeader from "./FocalLengthHeader";

export default function FocalLengthOverview({
  focal,
  photos,
  count,
  dateRange,
  animateOnFirstLoadOnly,
}: {
  focal: number,
  photos: Photo[],
  count: number,
  dateRange?: PhotoDateRange,
  animateOnFirstLoadOnly?: boolean,
}) {
  return (
    <PhotoGridContainer
      cacheKey={`focal-${focal}`}
      media={photos.map(photo => ({
        ...photo,
        type: photo.type || 'photo',
        thumbnailSrc: photo.type === 'video' ? photo.src : undefined,
        videoUrl: photo.type === 'video' ? photo.src : undefined
      }))}
      count={count}
      header={<FocalLengthHeader
        focal={focal}
        photos={photos}
        count={count}
        dateRange={dateRange} />}
      animateOnFirstLoadOnly={animateOnFirstLoadOnly}
      sidebar={undefined} />
  );
}