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
  const [imgRatio, setImgRatio] = useState<number | null>(null);
  const total = images.length;

  const goTo = (idx: number) => {
    if (idx < 0) idx = total - 1;
    if (idx >= total) idx = 0;
    setCurrent(idx);
  };

  // Função para detectar proporção da imagem atual
  const handleImgLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { naturalWidth, naturalHeight } = e.currentTarget;
    setImgRatio(naturalWidth / naturalHeight);
  };

  return (
    <div className="flex flex-col items-center w-full">
      <div className="relative w-full flex justify-center items-center h-[260px] sm:h-[420px] max-w-4xl px-3 sm:px-0 mx-auto select-none overflow-hidden">
        <button
          className="absolute left-2 top-1/2 -translate-y-1/2 z-10 text-red-600 hover:text-red-500 transition-colors duration-150 focus:outline-none bg-transparent border-none p-0 m-0"
          style={{ boxShadow: 'none', outline: 'none', background: 'none', border: 'none' }}
          onClick={() => goTo(current - 1)}
          aria-label="Imagem anterior"
        >
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
        </button>
        <img
          src={images[current].src}
          alt={images[current].alt || `Imagem ${current + 1}`}
          className={`rounded-lg w-full h-full ${imgRatio !== null ? (imgRatio > 1 ? 'object-cover' : 'object-contain') : 'object-cover'}`}
          style={{ display: 'block', margin: '0 auto', minWidth: '100%' }}
          draggable={false}
          onLoad={handleImgLoad}
        />
        <button
          className="absolute right-2 top-1/2 -translate-y-1/2 z-10 text-red-600 hover:text-red-500 transition-colors duration-150 focus:outline-none bg-transparent border-none p-0 m-0"
          style={{ boxShadow: 'none', outline: 'none', background: 'none', border: 'none' }}
          onClick={() => goTo(current + 1)}
          aria-label="Próxima imagem"
        >
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 6 15 12 9 18"></polyline></svg>
        </button>
        {/* Indicadores centralizados sobre a imagem */}
        <div className="absolute bottom-2 sm:bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20 px-3 py-1 rounded-full">
          {images.map((img, idx) => (
            <button
              key={idx}
              className={`w-3 h-3 rounded-full p-0 m-0 border-0 focus:outline-none transition-colors duration-150 ${current === idx ? 'bg-red-500' : 'bg-gray-400'}`}
              style={{ minWidth: '0', minHeight: '0' }}
              onClick={() => goTo(idx)}
              aria-label={`Ir para imagem ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProjectImageCarousel;
