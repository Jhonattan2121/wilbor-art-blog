import { useState } from 'react';

interface ImageCarouselProps {
  images: { src: string; alt?: string }[];
}

export default function ImageCarousel({ images }: ImageCarouselProps) {
  const [current, setCurrent] = useState(0);

  if (images.length === 0) return null;

  const prev = () => setCurrent((c) => (c === 0 ? images.length - 1 : c - 1));
  const next = () => setCurrent((c) => (c === images.length - 1 ? 0 : c + 1));
  const goTo = (idx: number) => setCurrent(idx);

  return (
    <div className="relative w-full flex flex-col items-center my-6">
      <div
        className="w-full flex justify-center items-center"
        style={{
          width: '100%',
          maxWidth: 1400, 
          maxHeight: 700,
          minHeight: 300,
          margin: '0 auto',
          background: 'rgba(0,0,0,0.02)',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Setas laterais */}
        {images.length > 1 && (
          <>
            <button
              onClick={prev}
              aria-label="Anterior"
              className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-20 h-20 flex items-center justify-center transition"
              style={{ background: 'none', border: 'none', boxShadow: 'none', padding: 0 }}
            >
              <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                <polyline points="38,12 18,30 38,48" stroke="#ef4444" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              </svg>
            </button>
            <button
              onClick={next}
              aria-label="Próxima"
              className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-20 h-20 flex items-center justify-center transition"
              style={{ background: 'none', border: 'none', boxShadow: 'none', padding: 0 }}
            >
              <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                <polyline points="22,12 42,30 22,48" stroke="#ef4444" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              </svg>
            </button>
          </>
        )}
        <img
          src={images[current].src}
          alt={images[current].alt || ''}
          className="rounded-lg shadow-lg"
          style={{
            width: '100%',
            maxWidth: 1400,
            maxHeight: 700,
            objectFit: 'contain',
            display: 'block',
            margin: '0 auto',
            background: 'transparent',
          }}
        />
      </div>
      {/* Bolinhas de navegação */}
      {images.length > 1 && (
        <div className="flex items-center justify-center gap-1 mt-4">
          {images.map((_, idx) => (
            <button
              key={idx}
              onClick={() => goTo(idx)}
              aria-label={`Ir para imagem ${idx + 1}`}
              className={`w-2 h-2 rounded-full border-2 transition-all focus:outline-none focus:ring-2 focus:ring-red-500 ${
                current === idx
                  ? 'bg-red-500 border-red-500'
                  : 'bg-gray-200 border-gray-400 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
