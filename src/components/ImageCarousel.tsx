import { useTheme } from 'next-themes';
import { useRef, useState } from 'react';

interface ImageCarouselProps {
  images: { src: string; alt?: string }[];
}

export default function ImageCarousel({ images }: ImageCarouselProps) {
  const [current, setCurrent] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchMoveX, setTouchMoveX] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [transition, setTransition] = useState(true);
  const [translateX, setTranslateX] = useState(0);
  const transitionTimeout = useRef<NodeJS.Timeout | null>(null);

  // Ajuste de cor das bolinhas conforme o tema (pedido do layout)
  const { theme, systemTheme } = useTheme();
  const resolvedTheme = theme === 'system' ? systemTheme : theme;
  const isDark = resolvedTheme === 'dark';
  const inactiveDotBg = isDark ? '#4b5563' : '#e5e7eb';   // cinza escuro no dark, cinza claro no light
  const inactiveDotBorder = isDark ? '#4b5563' : '#9ca3af';
  const activeDotBg = '#ef4444';
  const activeDotBorder = '#ef4444';

  if (images.length === 0) return null;

  // Próxima imagem
  const getNextIndex = () => (current === images.length - 1 ? 0 : current + 1);
  // Imagem anterior
  const getPrevIndex = () => (current === 0 ? images.length - 1 : current - 1);

  // Eventos de swipe
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    setTouchStartX(e.touches[0].clientX);
    setTouchMoveX(null);
    setIsDragging(true);
    setTransition(false);
    if (transitionTimeout.current) clearTimeout(transitionTimeout.current);
  };
  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const moveX = e.touches[0].clientX;
    setTouchMoveX(moveX);
    const delta = moveX - (touchStartX ?? 0);
    setTranslateX(delta);
  };
  const handleTouchEnd = () => {
    if (transitionTimeout.current) {
      clearTimeout(transitionTimeout.current);
      transitionTimeout.current = null;
    }
    if (!isDragging || touchStartX === null || touchMoveX === null) {
      setIsDragging(false);
      setTransition(true);
      setTranslateX(0);
      return;
    }
    const distance = touchMoveX - touchStartX;
    setIsDragging(false);
    setTransition(true);
    // Se arrastar o suficiente, troca a imagem
    if (distance < -60) {
      setTranslateX(-window.innerWidth);
      transitionTimeout.current = setTimeout(() => {
        setTransition(false);
        setCurrent(getNextIndex());
        setTranslateX(window.innerWidth); // começa fora da tela à direita
        setTimeout(() => {
          setTransition(true);
          setTranslateX(0); // anima para o centro
        }, 20);
      }, 300);
    } else if (distance > 60) {
      setTranslateX(window.innerWidth);
      transitionTimeout.current = setTimeout(() => {
        setTransition(false);
        setCurrent(getPrevIndex());
        setTranslateX(-window.innerWidth); // começa fora da tela à esquerda
        setTimeout(() => {
          setTransition(true);
          setTranslateX(0); // anima para o centro
        }, 20);
      }, 300);
    } else {
      // Volta para o centro
      setTransition(true);
      setTranslateX(0);
    }
  };

  // Troca imagem ao clicar nos cantos no desktop
  const handleDesktopClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Só ativa em telas maiores que 640px (sm)
    if (window.innerWidth < 640) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    if (x < rect.width / 3) {
      // Clique no lado esquerdo
      setCurrent(getPrevIndex());
    } else if (x > (rect.width * 2) / 3) {
      // Clique no lado direito
      setCurrent(getNextIndex());
    }
  };

  // Sempre mostra a anterior, atual e próxima
  const imagesToShow = [images[getPrevIndex()], images[current], images[getNextIndex()]];
  const slideWidth = 100; // porcentagem
  // Offset do slide
  let offset = -slideWidth;
  if (isDragging && touchStartX !== null && touchMoveX !== null) {
    offset = -slideWidth + ((touchMoveX - touchStartX) / window.innerWidth) * slideWidth;
  } else if (transition && translateX !== 0) {
    offset = translateX < 0 ? -2 * slideWidth : 0;
  }

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
        onClick={handleDesktopClick}
      >
        <div
          style={{
            display: 'flex',
            width: '300%',
            maxWidth: '2100px',
            transform: `translateX(${offset}%)`,
            transition: transition ? 'transform 0.3s' : 'none',
          }}
        >
          {imagesToShow.map((img, idx) => (
            <img
              key={idx}
              src={img.src}
              alt={img.alt || ''}
              className="rounded-lg shadow-lg w-full max-w-full sm:max-w-[700px]"
              style={{
                objectFit: 'contain',
                display: 'block',
                margin: '0 auto',
                background: 'transparent',
                minWidth: '100%',
                width: '100%',
              }}
            />
          ))}
        </div>
      </div>
      {/* Navegação por bolinhas abaixo da imagem */}
      {images.length > 1 && (
        <div className="mt-2 flex items-center justify-center gap-2">
          {images.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrent(idx)}
              aria-label={`Ir para imagem ${idx + 1}`}
              className="rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-red-500"
              style={{
                width: 13,
                height: 13,
                minWidth: 13,
                minHeight: 13,
                padding: 0,
                borderWidth: 0,
                background: current === idx ? activeDotBg : inactiveDotBg,
                borderColor: current === idx ? activeDotBorder : inactiveDotBorder,
                borderStyle: 'solid',
                borderRadius: '50%',
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}


