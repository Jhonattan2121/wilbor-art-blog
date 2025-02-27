import AnimateItems from '@/components/AnimateItems';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Photo } from '../../app/grid/types';
import { RevalidatePhoto } from './InfinitePhotoScroll';

// Componente para renderizar vídeos
const VideoPlayer = ({ photo, index }: { photo: Photo; index: number }) => {
  console.log('Renderizando vídeo:', photo);
  
  return (
    <div className="w-full h-0 relative" style={{ paddingBottom: '56.25%' }}>
      <iframe
        src={photo.url}
        className="absolute top-0 left-0 w-full h-full"
        frameBorder="0"
        allowFullScreen
        title={photo.title}
        loading={index <= 1 ? 'eager' : 'lazy'}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      />
    </div>
  );
};

// Componente para renderizar imagens
const ImageDisplay = ({ photo, index }: { photo: Photo; index: number }) => (
  <img
    key={`image-${photo.id}`}
    src={photo.url}
    alt={photo.title}
    className="w-full h-auto object-contain max-h-[600px]"
    loading={index <= 1 ? 'eager' : 'lazy'}
  />
);

// Componente para tags
const Tags = ({ tags }: { tags: string[] }) => (
  <div className="flex flex-wrap gap-2">
    {tags.map(tag => (
      <span
        key={tag}
        className="bg-gray-100 hover:bg-gray-200 transition-colors px-3 py-1 rounded-full text-sm text-gray-700"
      >
        #{tag}
      </span>
    ))}
  </div>
);

// Componente principal PhotosLarge
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
            {photo.type === 'video' ? (
              <VideoPlayer photo={photo} index={index} />
            ) : (
              <ImageDisplay photo={photo} index={index} />
            )}
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

            {photo.tags?.length > 0 && <Tags tags={photo.tags} />}
          </div>
        </article>
      ))}
      itemKeys={photos.map(photo => photo.id)}
    />
  );
}