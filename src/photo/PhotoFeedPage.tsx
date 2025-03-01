import About from '@/app/about/page';
import {
  Photo
} from '.';

export default function PhotoFeedPage({
  photos,
  photosCount,
}: {
  photos: Photo[]
  photosCount: number
}) {
  return (
    <div className="space-y-1">
      <About />
    </div>
  );
}