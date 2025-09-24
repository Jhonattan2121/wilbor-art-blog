import React, { useState } from 'react';

export interface ProjectImage {
  src: string;
  alt?: string;
}

interface ProjectImageCarouselProps {
  images: ProjectImage[];
  initialIndex?: number;
}

const ProjectImageCarousel: React.FC<ProjectImageCarouselProps> = ({ images, initialIndex = 0 }) => {
  const [current, setCurrent] = useState(initialIndex);
  const total = images.length;

  const goTo = (idx: number) => {
    if (idx < 0) idx = total - 1;
    if (idx >= total) idx = 0;
    setCurrent(idx);
  };

  return (
    <div className="flex flex-col items-center w-full">
      <div className="relative w-full flex justify-center items-center" style={{ minHeight: 320 }}>
        <button
          className="absolute left-0 top-1/2 -translate-y-1/2 px-2 py-1 bg-black/50 text-white rounded-full z-10"
          onClick={() => goTo(current - 1)}
          aria-label="Anterior"
        >
          &#8592;
        </button>
        <img
          src={images[current].src}
          alt={images[current].alt || `Imagem ${current + 1}`}
          className="rounded-lg object-contain w-full h-[320px]"
          style={{ maxHeight: 320, background: '#111' }}
        />
        <button
          className="absolute right-0 top-1/2 -translate-y-1/2 px-2 py-1 bg-black/50 text-white rounded-full z-10"
          onClick={() => goTo(current + 1)}
          aria-label="Próxima"
        >
          &#8594;
        </button>
      </div>
      <div className="flex gap-2 mt-4">
        {images.map((img, idx) => (
          <button
            key={idx}
            className={`w-3 h-3 rounded-full ${current === idx ? 'bg-red-500' : 'bg-gray-400'}`}
            onClick={() => goTo(idx)}
            aria-label={`Ir para imagem ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default ProjectImageCarousel;
