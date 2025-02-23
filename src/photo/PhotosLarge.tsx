import AnimateItems from '@/components/AnimateItems';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Photo } from '../../app/grid/types';
import { RevalidatePhoto } from './InfinitePhotoScroll';
export default function PhotosLarge({
  photos,
  animate = true,

}: {
  photos: Photo[]
  animate?: boolean
  prefetchFirstPhotoLinks?: boolean
  onLastPhotoVisible?: () => void
  revalidatePhoto?: RevalidatePhoto
}) {
  return (
    <AnimateItems
      className="flex flex-col gap-12"
      type={animate ? 'scale' : 'none'}
      duration={0.7}
      staggerDelay={0.15}
      distanceOffset={0}
      staggerOnFirstLoadOnly
      items={photos.map((photo, index) => (
        <article key={photo.id} className="flex flex-col max-w-4xl mx-auto">
          <div className="relative mb-6 shadow-md rounded-lg overflow-hidden">
            <img
              src={photo.url}
              alt={photo.title}
              className="w-full h-auto object-contain max-h-[600px]"
              loading={index <= 1 ? 'eager' : 'lazy'}
            />
          </div>

          <div className="space-y-4 px-2">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold text-gray-800">
                {photo.title}
              </h2>
              <div className="text-sm text-gray-500">
                {format(photo.createdAt, "d 'de' MMMM 'de' yyyy", {
                  locale: ptBR,
                })}
              </div>
            </div>

            {photo.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {photo.tags.map(tag => (
                  <span
                    key={tag}
                    className="bg-gray-100 hover:bg-gray-200 
                             transition-colors px-3 py-1 
                             rounded-full text-sm text-gray-700"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {photo.camera && (
              <div className="text-gray-600 flex items-center gap-2 text-sm">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.
                    812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664
                    .89l.812 1.22A2 2 0 0018.07 7H19a2 2 0
                     012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                  />
                </svg>
                <span>{String(photo.camera)}</span>
              </div>
            )}
          </div>
        </article>
      ))}
      itemKeys={photos.map(photo => photo.id)}
    />
  );
}
