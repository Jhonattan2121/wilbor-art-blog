import { useState } from 'react';

interface ImageCarouselProps {
  images: { src: string; alt?: string }[];
}

export default function ImageCarousel({ images }: ImageCarouselProps) {
  const [current, setCurrent] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  if (images.length === 0) return null;

  const prev = () => {
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 300);
    setCurrent((c) => (c === 0 ? images.length - 1 : c - 1));
  };
  const next = () => {
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 300);
    setCurrent((c) => (c === images.length - 1 ? 0 : c + 1));
  };
  const goTo = (idx: number) => setCurrent(idx);

  // Swipe handlers
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    setTouchStartX(e.touches[0].clientX);
  };
  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    setTouchEndX(e.touches[0].clientX);
  };
  const handleTouchEnd = () => {
    if (touchStartX !== null && touchEndX !== null) {
      const distance = touchStartX - touchEndX;
      if (distance > 40) next();
      if (distance < -40) prev();
    }
    setTouchStartX(null);
    setTouchEndX(null);
  };

  return (
    <div className="relative w-full flex flex-col items-center my-6">
      <div
        className="w-full flex justify-center items-center max-w-full sm:max-w-[700px] relative overflow-hidden"
        style={{
          minHeight: 220,
          margin: '0 auto',
          background: 'rgba(0,0,0,0.02)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Setas laterais - só desktop */}
        {images.length > 1 && (
          <>
            <button
              onClick={prev}
              aria-label="Anterior"
              className="hidden sm:flex absolute left-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 sm:w-20 sm:h-20 items-center justify-center transition bg-transparent"
              style={{ opacity: 0, pointerEvents: 'auto', background: 'none', border: 'none', boxShadow: 'none', padding: 0 }}
            >
              {/* Setas invisíveis, mas clicáveis */}
              <svg width="40" height="40" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                <polyline points="38,12 18,30 38,48" stroke="#ef4444" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              </svg>
            </button>
            <button
              onClick={next}
              aria-label="Próxima"
              className="hidden sm:flex absolute right-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 sm:w-20 sm:h-20 items-center justify-center transition bg-transparent"
              style={{ opacity: 0, pointerEvents: 'auto', background: 'none', border: 'none', boxShadow: 'none', padding: 0 }}
            >
              {/* Setas invisíveis, mas clicáveis */}
              <svg width="40" height="40" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                <polyline points="22,12 42,30 22,48" stroke="#ef4444" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              </svg>
            </button>
          </>
        )}
        {/* Áreas clicáveis invisíveis para navegação */}
        {images.length > 1 && (
          <>
            <div
              className="hidden sm:block absolute left-0 top-0 h-full w-1/2 cursor-pointer z-20"
              style={{ background: 'transparent' }}
              onClick={prev}
              aria-label="Anterior"
            />
            <div
              className="hidden sm:block absolute right-0 top-0 h-full w-1/2 cursor-pointer z-20"
              style={{ background: 'transparent' }}
              onClick={next}
              aria-label="Próxima"
            />
          </>
        )}
        <img
          src={images[current].src}
          alt={images[current].alt || ''}
          className={`rounded-lg shadow-lg w-full max-w-full sm:max-w-[700px] transition-transform duration-300 ${isAnimating ? 'scale-95' : 'scale-100'}`}
          style={{
            objectFit: 'contain',
            display: 'block',
            margin: '0 auto',
            background: 'transparent',
          }}
        />
        {/* Bolinhas de navegação */}
        {images.length > 1 && (
          <div className="absolute bottom-1 sm:bottom-4 left-1/2 -translate-x-1/2 flex items-center justify-center gap-2">
            {images.map((_, idx) => (
              <button
                key={idx}
                onClick={() => goTo(idx)}
                aria-label={`Ir para imagem ${idx + 1}`}
                className="rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-red-500"
                style={{ width: 13, height: 13, minWidth: 13, minHeight: 13, padding: 0, borderWidth: 0, background: current === idx ? '#ef4444' : '#e5e7eb', borderColor: current === idx ? '#ef4444' : '#9ca3af', borderStyle: 'solid', borderRadius: '50%' }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
