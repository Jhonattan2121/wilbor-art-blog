import { useTheme } from 'next-themes';
import { useEffect, useRef, useState } from 'react';

interface ImageCarouselProps {
  images: { src: string; alt?: string }[];
  fullscreen?: boolean;
  inExpandedCard?: boolean;
  hasLittleContent?: boolean;
  currentIndex?: number;
  onIndexChange?: (index: number) => void;
}

export default function ImageCarousel({ images, fullscreen = false, inExpandedCard = false, hasLittleContent = false, currentIndex, onIndexChange }: ImageCarouselProps) {
  const [internalCurrent, setInternalCurrent] = useState(0);
  const current = currentIndex !== undefined ? currentIndex : internalCurrent;
  const setCurrent = (index: number) => {
    if (onIndexChange) {
      onIndexChange(index);
    } else {
      setInternalCurrent(index);
    }
  };
  
  // Sincroniza o estado interno quando currentIndex externo mudar
  useEffect(() => {
    if (currentIndex !== undefined) {
      setInternalCurrent(currentIndex);
    }
  }, [currentIndex]);
  
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchMoveX, setTouchMoveX] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [transition, setTransition] = useState(true);
  const [translateX, setTranslateX] = useState(0);
  const transitionTimeout = useRef<NodeJS.Timeout | null>(null);
  const touchStartY = useRef<number | null>(null);

  // Ajuste de cor das bolinhas conforme o tema (pedido do layout)
  const { theme, systemTheme } = useTheme();
  const resolvedTheme = theme === 'system' ? systemTheme : theme;
  const isDark = resolvedTheme === 'dark';
  // Mesma cor de cinza escuro usada no ícone de fechar (IconX) para seguir o layout no modo escuro
  const inactiveDotBg = isDark ? '#626262' : '#e5e7eb';
  const inactiveDotBorder = isDark ? '#626262' : '#9ca3af';
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
    touchStartY.current = e.touches[0].clientY;
    setTouchMoveX(null);
    setIsDragging(true);
    setTransition(false);
    if (transitionTimeout.current) clearTimeout(transitionTimeout.current);
  };
  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isDragging || touchStartX === null || touchStartY.current === null) return;
    const moveX = e.touches[0].clientX;
    const moveY = e.touches[0].clientY;
    const deltaX = Math.abs(moveX - touchStartX);
    const deltaY = Math.abs(moveY - touchStartY.current);
    
    // Só ativa o drag se o movimento horizontal for maior que o vertical (swipe horizontal)
    if (deltaX > deltaY && deltaX > 10) {
      setTouchMoveX(moveX);
      const delta = moveX - touchStartX;
      setTranslateX(delta);
    } else if (deltaY > deltaX && deltaY > 10) {
      // Se for movimento vertical maior, cancela o drag para permitir scroll
      setIsDragging(false);
      setTransition(true);
      setTranslateX(0);
    }
  };
  const handleTouchEnd = () => {
    if (transitionTimeout.current) {
      clearTimeout(transitionTimeout.current);
      transitionTimeout.current = null;
    }
    touchStartY.current = null;
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
    <div 
      className={fullscreen ? "relative w-full h-full flex flex-col items-center justify-center" : inExpandedCard ? "relative w-full flex flex-col items-center" : "relative w-full flex flex-col items-center my-6"}
      style={inExpandedCard && !fullscreen ? { marginTop: '0', marginBottom: '0' } : undefined}
    >
      <div
        className={
          fullscreen 
            ? "w-full h-full flex justify-center items-center mx-auto overflow-hidden"
            : inExpandedCard
              ? "w-full flex justify-center items-center max-w-full mx-auto overflow-hidden"
              : "w-full flex justify-center items-center max-w-full mx-auto overflow-hidden"
        }
        style={{
          background: 'transparent',
          position: fullscreen ? 'relative' : 'relative',
          isolation: fullscreen ? 'auto' : 'isolate'
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
            height: '100%',
            transform: `translateX(${offset}%)`,
            transition: transition ? 'transform 0.3s' : 'none',
            position: 'relative',
            willChange: 'transform'
          }}
        >
          {imagesToShow.map((img, idx) => (
            <div
              key={idx}
              style={{
                width: '100%',
                minWidth: '100%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                flexShrink: 0,
                position: 'relative',
                padding: '0'
              }}
            >
              <img
                src={img.src}
                alt={img.alt || ''}
                className={fullscreen ? "shadow-2xl" : "rounded-lg shadow-lg"}
                style={{
                  objectFit: 'contain',
                  display: 'block',
                  background: 'transparent',
                  margin: '0 auto',
                  ...(fullscreen ? {
                    width: '100%',
                    height: '100%',
                    maxHeight: '90vh',
                    maxWidth: '100%',
                  } : {
                    width: '100%',
                    height: 'auto',
                    maxWidth: '100%',
                    maxHeight: inExpandedCard ? 'none' : '70vh',
                    flexShrink: 0,
                  }),
                }}
                draggable={false}
              />
            </div>
          ))}
        </div>
      </div>
      {/* Navegação por bolinhas abaixo da imagem */}
      {images.length > 1 && (
        <div className={fullscreen ? "absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center justify-center gap-2 sm:gap-3" : "mt-2 flex items-center justify-center gap-2"}>
          {images.map((_, idx) => (
            <button
              key={idx}
              onClick={(e) => {
                e.stopPropagation();
                setCurrent(idx);
              }}
              aria-label={`Ir para imagem ${idx + 1}`}
              className="rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-red-500"
              style={{
                width: fullscreen ? 16 : 13,
                height: fullscreen ? 16 : 13,
                minWidth: fullscreen ? 16 : 13,
                minHeight: fullscreen ? 16 : 13,
                padding: 0,
                borderWidth: 0,
                background: current === idx ? activeDotBg : (fullscreen ? 'rgba(255,255,255,0.3)' : inactiveDotBg),
                borderColor: 'transparent',
                borderStyle: 'none',
                borderRadius: '50%',
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

