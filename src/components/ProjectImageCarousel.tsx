import React, { useState } from 'react';

export interface ProjectImage {
  src: string;
  alt?: string;
}

interface ProjectImageCarouselProps {
  images: ProjectImage[];
  initialIndex?: number;
  /** Quando true, usa proporções pensadas para fullscreen (zoom) */
  fullscreen?: boolean;
  /** Mostra setas de navegação (no zoom desktop vamos ocultar) */
  showArrows?: boolean;
}

const ProjectImageCarousel: React.FC<ProjectImageCarouselProps> = ({
  images,
  initialIndex = 0,
  fullscreen = false,
  showArrows = true,
}) => {
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

  const arrowBase =
    'absolute top-1/2 -translate-y-1/2 z-10 text-red-500 hover:text-red-400 transition-colors duration-150 focus:outline-none bg-transparent border-none p-0 m-0';

  return (
    <div className="flex flex-col items-center w-full h-full">
      <div
        className={
          fullscreen
            ? 'relative w-full h-full flex justify-center items-center max-w-none px-1 sm:px-4 mx-auto select-none overflow-hidden'
            : 'relative w-full flex justify-center items-center h-[260px] sm:h-[420px] max-w-4xl px-3 sm:px-0 mx-auto select-none overflow-hidden'
        }
      >
        {showArrows && (
          <button
            className={`${arrowBase} ${fullscreen ? 'left-4 sm:left-8 lg:-left-4' : 'left-2'}`}
            style={{ boxShadow: 'none', outline: 'none', background: 'none', border: 'none' }}
            onClick={() => goTo(current - 1)}
            aria-label="Imagem anterior"
          >
            <svg
              width={fullscreen ? 60 : 40}
              height={fullscreen ? 60 : 40}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>
        )}
        <img
          src={images[current].src}
          alt={images[current].alt || `Imagem ${current + 1}`}
          className="rounded-lg object-contain shadow-2xl"
          style={{
            display: 'block',
            margin: '0 auto',
            maxHeight: fullscreen ? 'calc(100vh - 60px)' : '100%',
            maxWidth: fullscreen ? 'calc(100vw - 40px)' : '100%',
          }}
          draggable={false}
          onLoad={handleImgLoad}
        />
        {showArrows && (
          <button
            className={`${arrowBase} ${fullscreen ? 'right-4 sm:right-8 lg:-right-4' : 'right-2'}`}
            style={{ boxShadow: 'none', outline: 'none', background: 'none', border: 'none' }}
            onClick={() => goTo(current + 1)}
            aria-label="Próxima imagem"
          >
            <svg
              width={fullscreen ? 60 : 40}
              height={fullscreen ? 60 : 40}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="9 6 15 12 9 18"></polyline>
            </svg>
          </button>
        )}
        {/* Indicadores centralizados logo abaixo da imagem */}
        <div className="absolute bottom-3 sm:bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20 px-3 py-1 rounded-full bg-black/30 backdrop-blur-sm">
          {images.map((img, idx) => (
            <button
              key={idx}
              className={`w-3 h-3 rounded-full p-0 m-0 border border-white/60 focus:outline-none transition-colors duration-150 ${
                current === idx ? 'bg-red-500' : 'bg-gray-300'
              }`}
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
