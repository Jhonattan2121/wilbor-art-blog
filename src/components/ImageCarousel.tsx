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
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < 640;
  });

  // Detecta tamanho de tela para ajustar o fit apenas no fullscreen mobile
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleResize = () => setIsMobile(window.innerWidth < 640);
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
  const [touchMoveX, setTouchMoveX] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [transition, setTransition] = useState(true);
  const [translateX, setTranslateX] = useState(0);
  const transitionTimeout = useRef<NodeJS.Timeout | null>(null);
  const touchStartY = useRef<number | null>(null);
  const [imgRatios, setImgRatios] = useState<Record<string, number>>({});
  const [imgHasBars, setImgHasBars] = useState<Record<string, boolean>>({});
  const preloadedRef = useRef<Record<string, boolean>>({});

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

  const borderRadius = fullscreen ? undefined : 12;
  const containerHeight = fullscreen ? '100%' : 'auto';
  const baseAspectRatio = '16 / 9';
  const detectBlackBars = (imgEl: HTMLImageElement) => {
    try {
      const { naturalWidth, naturalHeight } = imgEl;
      if (!naturalWidth || !naturalHeight) return false;
      const canvas = document.createElement('canvas');
      const sampleHeight = Math.max(4, Math.round(naturalHeight * 0.06));
      canvas.width = Math.min(naturalWidth, 320);
      canvas.height = sampleHeight * 2;
      const ctx = canvas.getContext('2d');
      if (!ctx) return false;
      const scaleX = canvas.width / naturalWidth;
      ctx.drawImage(imgEl, 0, 0, naturalWidth, sampleHeight, 0, 0, canvas.width, sampleHeight);
      ctx.drawImage(imgEl, 0, naturalHeight - sampleHeight, naturalWidth, sampleHeight, 0, sampleHeight, canvas.width, sampleHeight);
      const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      let sum = 0;
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        sum += 0.2126 * r + 0.7152 * g + 0.0722 * b;
      }
      const avg = sum / (data.length / 4);
      return avg < 18;
    } catch {
      return false;
    }
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    images.forEach((img) => {
      if (preloadedRef.current[img.src]) return;
      preloadedRef.current[img.src] = true;
      const probe = new Image();
      probe.crossOrigin = 'anonymous';
      probe.onload = () => {
        const { naturalWidth, naturalHeight } = probe;
        if (naturalWidth && naturalHeight) {
          const ratio = naturalWidth / naturalHeight;
          setImgRatios((prev) => (prev[img.src] ? prev : { ...prev, [img.src]: ratio }));
          if (ratio > 1.05 && inExpandedCard) {
            const has = detectBlackBars(probe);
            setImgHasBars((prev) => (prev[img.src] !== undefined ? prev : { ...prev, [img.src]: has }));
          } else {
            setImgHasBars((prev) => (prev[img.src] !== undefined ? prev : { ...prev, [img.src]: false }));
          }
        }
      };
      probe.onerror = () => {
        setImgHasBars((prev) => (prev[img.src] !== undefined ? prev : { ...prev, [img.src]: false }));
      };
      probe.src = img.src;
    });
  }, [images, inExpandedCard]);

  return (
    <div 
      className={fullscreen ? "fixed inset-0 z-50" : inExpandedCard ? "relative w-full flex flex-col items-center" : "relative w-full flex flex-col items-center my-6"}
      style={fullscreen ? { margin: 0, padding: 0 } : (inExpandedCard && !fullscreen ? { marginTop: '0', marginBottom: '0' } : undefined)}
    >
      <div
        className={
          fullscreen 
            ? "w-full h-full flex justify-center items-center overflow-hidden bg-black"
            : inExpandedCard
              ? "w-full flex justify-center items-center max-w-full mx-auto overflow-hidden rounded-lg bg-black"
              : "w-full flex justify-center items-center max-w-full mx-auto overflow-hidden rounded-lg bg-black"
        }
        style={{
          background: fullscreen ? 'black' : 'black',
          position: 'relative',
          isolation: fullscreen ? 'auto' : 'isolate',
          borderRadius,
          overflow: 'hidden',
          transform: fullscreen ? undefined : 'translateZ(0)',
          backfaceVisibility: fullscreen ? undefined : 'hidden',
          WebkitBackfaceVisibility: fullscreen ? undefined : 'hidden',
          WebkitMaskImage: fullscreen ? undefined : 'linear-gradient(#fff 0 0)',
          WebkitMaskRepeat: fullscreen ? undefined : 'no-repeat',
          WebkitMaskSize: fullscreen ? undefined : '100% 100%',
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
            height: fullscreen ? '100%' : 'auto',
            transform: `translateX(${offset}%)`,
            transition: transition ? 'transform 0.3s' : 'none',
            position: 'relative',
            willChange: 'transform'
          }}
        >
          {imagesToShow.map((img, idx) => {
            const ratio = imgRatios[img.src];
            const isPortrait = ratio ? ratio < 1 : false;
            const isLandscape = ratio ? ratio > 1.05 : false;
            const barsKnown = imgHasBars[img.src] !== undefined;
            const hasBars = !!imgHasBars[img.src];
            const forceCrop = inExpandedCard && isLandscape && hasBars;
            const innerAspectRatio = fullscreen ? undefined : ((inExpandedCard && !forceCrop) || isPortrait ? undefined : baseAspectRatio);
            const objectFit = (fullscreen && isMobile) || (inExpandedCard && !forceCrop) || isPortrait ? 'contain' : 'cover';
            const imgHeight = fullscreen ? '100%' : ((inExpandedCard && !forceCrop) || isPortrait ? 'auto' : '100%');
            const imgMaxHeight = fullscreen ? '100%' : ((inExpandedCard && !forceCrop) || isPortrait ? 'none' : '100%');
            const imgScale = forceCrop ? 'scale(1.08)' : 'none';
            const ready = isLandscape && inExpandedCard ? barsKnown : true;
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
              background: fullscreen ? 'transparent' : 'black',
            }}
          >
            <div
              style={{
                width: '100%',
                height: containerHeight,
                maxWidth: fullscreen ? '100%' : 'min(900px, 100%)',
                aspectRatio: innerAspectRatio,
                borderRadius,
                overflow: 'hidden',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                flex: fullscreen ? 1 : undefined,
              }}
            >
              <img
                 src={img.src}
                 alt={img.alt || ''}
                 className={fullscreen ? "shadow-2xl" : "shadow-lg"}
                 style={{
                   objectFit,
                   objectPosition: 'center',
                   display: 'block',
                   width: '100%',
                   height: imgHeight,
                   maxWidth: '100%',
                   maxHeight: imgMaxHeight,
                   transform: imgScale,
                   opacity: ready ? 1 : 0,
                   transition: 'opacity 140ms ease-out',
                   background: 'transparent',
                   margin: '0',
                   borderRadius,
                 }}
                 onLoad={(e) => {
                   const { naturalWidth, naturalHeight } = e.currentTarget;
                   if (!naturalWidth || !naturalHeight) return;
                   const nextRatio = naturalWidth / naturalHeight;
                   setImgRatios((prev) => (prev[img.src] ? prev : { ...prev, [img.src]: nextRatio }));
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
