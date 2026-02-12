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

interface ViewportMetrics {
  isTabletViewport: boolean;
}

const getViewportMetrics = (): ViewportMetrics => {
  if (typeof window === 'undefined') {
    return {
      isTabletViewport: false,
    };
  }
  const coarse = typeof window.matchMedia === 'function' && window.matchMedia('(pointer: coarse)').matches;
  const width = window.innerWidth;
  const height = window.innerHeight;
  const shortestSide = Math.min(width, height);
  return {
    isTabletViewport: coarse && shortestSide >= 700,
  };
};

export default function ImageCarousel({ images, fullscreen = false, inExpandedCard = false, currentIndex, onIndexChange }: ImageCarouselProps) {
  const [internalCurrent, setInternalCurrent] = useState(0);
  const current = currentIndex !== undefined ? currentIndex : internalCurrent;
  const [isTabletViewport, setIsTabletViewport] = useState<boolean>(() => getViewportMetrics().isTabletViewport);

  // Detecta tamanho de tela para ajustes de fullscreen em tablet
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleResize = () => {
      const viewport = getViewportMetrics();
      setIsTabletViewport(viewport.isTabletViewport);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
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
  const touchMoveXRef = useRef<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [transition, setTransition] = useState(true);
  const [translateX, setTranslateX] = useState(0);
  const transitionTimeout = useRef<NodeJS.Timeout | null>(null);
  const isAnimatingRef = useRef(false);
  const touchStartY = useRef<number | null>(null);
  const [imgRatios, setImgRatios] = useState<Record<string, number>>({});
  const [imgSrcOverrides, setImgSrcOverrides] = useState<Record<string, string>>({});

  // Ajuste de cor das bolinhas conforme o tema (pedido do layout)
  const { theme, systemTheme } = useTheme();
  const resolvedTheme = theme === 'system' ? systemTheme : theme;
  const isDark = resolvedTheme === 'dark';
  // Mesma cor de cinza escuro usada no ícone de fechar (IconX) para seguir o layout no modo escuro
  const inactiveDotBg = isDark ? '#626262' : '#e5e7eb';
  const activeDotBg = '#ef4444';

  // Próxima imagem
  const getNextIndex = () => (current === images.length - 1 ? 0 : current + 1);
  // Imagem anterior
  const getPrevIndex = () => (current === 0 ? images.length - 1 : current - 1);

  // Eventos de swipe
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (isAnimatingRef.current) return;
    setTouchStartX(e.touches[0].clientX);
    touchStartY.current = e.touches[0].clientY;
    touchMoveXRef.current = null;
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
      touchMoveXRef.current = moveX;
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
    if (!isDragging || touchStartX === null || touchMoveXRef.current === null) {
      setIsDragging(false);
      setTransition(true);
      setTranslateX(0);
      return;
    }
    const distance = touchMoveXRef.current - touchStartX;
    touchMoveXRef.current = null;
    setIsDragging(false);
    setTransition(true);
    // Se arrastar o suficiente, troca a imagem
    if (distance < -60) {
      isAnimatingRef.current = true;
      setTranslateX(-window.innerWidth);
      transitionTimeout.current = setTimeout(() => {
        setTransition(false);
        setCurrent(getNextIndex());
        setTranslateX(0);
        requestAnimationFrame(() => {
          setTransition(true);
          isAnimatingRef.current = false;
        });
      }, 300);
    } else if (distance > 60) {
      isAnimatingRef.current = true;
      setTranslateX(window.innerWidth);
      transitionTimeout.current = setTimeout(() => {
        setTransition(false);
        setCurrent(getPrevIndex());
        setTranslateX(0);
        requestAnimationFrame(() => {
          setTransition(true);
          isAnimatingRef.current = false;
        });
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
  if (isDragging && touchStartX !== null && touchMoveXRef.current !== null) {
    offset = -slideWidth + ((touchMoveXRef.current - touchStartX) / window.innerWidth) * slideWidth;
  } else if (transition && translateX !== 0) {
    offset = translateX < 0 ? -2 * slideWidth : 0;
  }

  const borderRadius = fullscreen ? undefined : 8;
  const containerHeight = fullscreen ? '100%' : 'auto';
  const currentRatio = images[current]?.src ? imgRatios[images[current].src] : undefined;
  const lockViewportToCurrent = Boolean(inExpandedCard && !fullscreen && currentRatio);

  if (images.length === 0) return null;

  return (
    <div 
      className={fullscreen ? "fixed top-0 left-0 right-0 z-50" : inExpandedCard ? "relative w-full flex flex-col items-center" : "relative w-full flex flex-col items-center my-6"}
      style={fullscreen ? { margin: 0, padding: 0, width: '100vw', height: 'var(--fullscreen-vh, 100svh)' } : (inExpandedCard && !fullscreen ? { marginTop: '0', marginBottom: '0' } : undefined)}
    >
      <div
        className={
          fullscreen 
            ? "w-full h-full flex justify-center items-center overflow-hidden"
            : inExpandedCard
              ? "w-full flex justify-center items-center max-w-full mx-auto overflow-hidden rounded-lg"
              : "w-full flex justify-center items-center max-w-full mx-auto overflow-hidden rounded-lg"
        }
        style={{
          position: 'relative',
          isolation: fullscreen ? 'auto' : 'isolate',
          border: 'none',
          boxShadow: 'none',
          borderRadius,
          overflow: 'hidden',
          width: fullscreen ? '100%' : undefined,
          height: fullscreen ? '100%' : undefined,
          aspectRatio: lockViewportToCurrent ? currentRatio : undefined,
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
            height: fullscreen ? '100%' : (lockViewportToCurrent ? '100%' : 'auto'),
            transform: `translateX(${offset}%)`,
            transition: transition ? 'transform 0.3s' : 'none',
            position: 'relative',
            willChange: 'transform',
          }}
        >
          {imagesToShow.map((img, idx) => {
            const resolvedSrc = imgSrcOverrides[img.src] || img.src;
            const isActiveSlide = idx === 1;
            const objectFit = 'contain';
            const imgHeight = fullscreen ? '100%' : 'auto';
            const imgMaxHeight = fullscreen ? '100%' : '100%';
            const fullscreenInset = fullscreen && isTabletViewport ? 32 : 0;
            return (
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
                padding: '0',
                overflow: fullscreen ? 'visible' : 'hidden',
                borderRadius,
                height: fullscreen ? '100%' : (lockViewportToCurrent ? '100%' : undefined),
              }}
            >
            <div
              style={{
                width: fullscreenInset ? `calc(100% - ${fullscreenInset}px)` : '100%',
                height: fullscreen
                  ? (fullscreenInset ? `calc(100% - ${fullscreenInset}px)` : '100%')
                  : (lockViewportToCurrent ? '100%' : containerHeight),
                maxWidth: fullscreen ? '100%' : 'min(900px, 100%)',
                maxHeight: fullscreen
                  ? (fullscreenInset ? `calc(100% - ${fullscreenInset}px)` : '100%')
                  : (lockViewportToCurrent ? '100%' : undefined),
                borderRadius,
                overflow: 'hidden',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                flex: fullscreen ? 1 : undefined,
              }}
            >
              <img
                 src={resolvedSrc}
                 alt={img.alt || ''}
                 className=""
                 loading={fullscreen && !isActiveSlide ? 'lazy' : 'eager'}
                 decoding="async"
                 fetchPriority={fullscreen ? (isActiveSlide ? 'high' : 'low') : 'auto'}
                 style={{
                   objectFit,
                   objectPosition: 'center',
                   display: 'block',
                   width: '100%',
                   height: lockViewportToCurrent ? '100%' : imgHeight,
                   maxWidth: '100%',
                   maxHeight: lockViewportToCurrent ? '100%' : imgMaxHeight,
                   margin: '0',
                 }}
                 onLoad={(e) => {
                   const { naturalWidth, naturalHeight } = e.currentTarget;
                   if (!naturalWidth || !naturalHeight) return;
                   const nextRatio = naturalWidth / naturalHeight;
                   setImgRatios((prev) => (prev[img.src] ? prev : { ...prev, [img.src]: nextRatio }));
                 }}
                 onError={() => {
                   setImgSrcOverrides((prev) => {
                     if (prev[img.src]) return prev;
                     // Fallback para proxy Hive quando gateway original falhar (404/timeout).
                     return {
                       ...prev,
                       [img.src]: `https://images.hive.blog/0x0/${img.src}`,
                     };
                   });
                 }}
                 draggable={false}
               />
            </div>
          </div>
        );
        })}
      </div>
      </div>
      {/* Navegação por bolinhas abaixo da imagem */}
      {images.length > 1 && (
        <div
          className={
            fullscreen
              ? "absolute inset-x-0 bottom-2 flex flex-wrap items-center justify-center gap-x-2 gap-y-2 sm:bottom-3 sm:flex-nowrap sm:gap-3"
              : "mt-1 flex items-center justify-center gap-2"
          }
          style={fullscreen ? { pointerEvents: 'none', zIndex: 5 } : undefined}
        >
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
                pointerEvents: 'auto',
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
