import { Photo, PhotoDateRange } from '@/photo';
import PhotoGridContainer from '@/photo/PhotoGridContainer';
import TagHeader from './TagHeader';

export default function TagOverview({
  tag,
  photos,
  count,
  dateRange,
  animateOnFirstLoadOnly,
}: {
  tag: string,
  photos: Photo[],
  count: number,
  dateRange?: PhotoDateRange,
  animateOnFirstLoadOnly?: boolean,
}) {
  return (
    <PhotoGridContainer media={[]} {...{
      cacheKey: `tag-${tag}`,
      photos,
      count,
      tag,
      header: <TagHeader {...{
        tag,
        photos,
        count,
        dateRange,
      }} />,
      animateOnFirstLoadOnly,
    }} />
  );
}
