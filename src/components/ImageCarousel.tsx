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
  isMobileViewport: boolean;
  isLandscape: boolean;
  ratio: number;
  isTabletViewport: boolean;
}

const getViewportMetrics = (): ViewportMetrics => {
  if (typeof window === 'undefined') {
    return {
      isMobileViewport: false,
      isLandscape: false,
      ratio: 1,
      isTabletViewport: false,
    };
  }
  const coarse = typeof window.matchMedia === 'function' && window.matchMedia('(pointer: coarse)').matches;
  const width = window.innerWidth;
  const height = window.innerHeight;
  const shortestSide = Math.min(width, height);
  return {
    isMobileViewport: coarse || width < 640 || height < 520,
    isLandscape: width > height,
    ratio: width / height,
    isTabletViewport: coarse && shortestSide >= 700,
  };
};

export default function ImageCarousel({ images, fullscreen = false, inExpandedCard = false, hasLittleContent = false, currentIndex, onIndexChange }: ImageCarouselProps) {
  const [internalCurrent, setInternalCurrent] = useState(0);
  const current = currentIndex !== undefined ? currentIndex : internalCurrent;
  const [isMobile, setIsMobile] = useState<boolean>(() => getViewportMetrics().isMobileViewport);
  const [isLandscapeViewport, setIsLandscapeViewport] = useState<boolean>(() => getViewportMetrics().isLandscape);
  const [viewportRatio, setViewportRatio] = useState<number>(() => getViewportMetrics().ratio);
  const [isTabletViewport, setIsTabletViewport] = useState<boolean>(() => getViewportMetrics().isTabletViewport);

  // Detecta tamanho de tela para ajustar o fit apenas no fullscreen mobile
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleResize = () => {
      const viewport = getViewportMetrics();
      setIsMobile(viewport.isMobileViewport);
      setIsLandscapeViewport(viewport.isLandscape);
      setViewportRatio(viewport.ratio);
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
  const touchStartY = useRef<number | null>(null);
  const [imgRatios, setImgRatios] = useState<Record<string, number>>({});
  const [imgHasBars, setImgHasBars] = useState<Record<string, boolean | null>>({});
  const [imgSrcOverrides, setImgSrcOverrides] = useState<Record<string, string>>({});
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

  // Próxima imagem
  const getNextIndex = () => (current === images.length - 1 ? 0 : current + 1);
  // Imagem anterior
  const getPrevIndex = () => (current === 0 ? images.length - 1 : current - 1);

  // Eventos de swipe
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
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
  if (isDragging && touchStartX !== null && touchMoveXRef.current !== null) {
    offset = -slideWidth + ((touchMoveXRef.current - touchStartX) / window.innerWidth) * slideWidth;
  } else if (transition && translateX !== 0) {
    offset = translateX < 0 ? -2 * slideWidth : 0;
  }

  const borderRadius = fullscreen ? undefined : 20;
  const containerHeight = fullscreen ? '100%' : 'auto';
  const baseAspectRatio = '16 / 9';
  const detectBlackBars = (imgEl: HTMLImageElement): boolean | null => {
    try {
      const { naturalWidth, naturalHeight } = imgEl;
      if (!naturalWidth || !naturalHeight) return false;
      const canvas = document.createElement('canvas');
      const sampleHeight = Math.max(4, Math.round(naturalHeight * 0.06));
      canvas.width = Math.min(naturalWidth, 320);
      canvas.height = sampleHeight * 3;
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;
      const midY = Math.max(0, Math.floor(naturalHeight / 2 - sampleHeight / 2));
      ctx.drawImage(imgEl, 0, 0, naturalWidth, sampleHeight, 0, 0, canvas.width, sampleHeight);
      ctx.drawImage(imgEl, 0, midY, naturalWidth, sampleHeight, 0, sampleHeight, canvas.width, sampleHeight);
      ctx.drawImage(imgEl, 0, naturalHeight - sampleHeight, naturalWidth, sampleHeight, 0, sampleHeight * 2, canvas.width, sampleHeight);
      const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      const segmentPixels = canvas.width * sampleHeight;
      const avgSegment = (segmentIndex: number) => {
        const start = segmentIndex * segmentPixels * 4;
        const end = start + segmentPixels * 4;
        let sum = 0;
        for (let i = start; i < end; i += 4) {
          sum += 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
        }
        return sum / segmentPixels;
      };
      const avgTop = avgSegment(0);
      const avgMid = avgSegment(1);
      const avgBottom = avgSegment(2);
      const avgTopBottom = (avgTop + avgBottom) / 2;
      return avgTopBottom < 42 && avgTopBottom < avgMid * 0.7;
    } catch {
      return null;
    }
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!images.length) return;
    const shouldDetectBars = inExpandedCard && !fullscreen;
    const prevIndex = current === 0 ? images.length - 1 : current - 1;
    const nextIndex = current === images.length - 1 ? 0 : current + 1;
    const priorityTargets = [images[prevIndex], images[current], images[nextIndex]];
    const uniqueTargets = priorityTargets.filter((img, index, arr) => {
      if (!img?.src) return false;
      return arr.findIndex((item) => item?.src === img.src) === index;
    });
    const probeImage = (img: { src: string; alt?: string }) => {
      if (preloadedRef.current[img.src]) return;
      preloadedRef.current[img.src] = true;
      const probe = new Image();
      probe.crossOrigin = 'anonymous';
      probe.onload = () => {
        const { naturalWidth, naturalHeight } = probe;
        if (naturalWidth && naturalHeight) {
          const ratio = naturalWidth / naturalHeight;
          setImgRatios((prev) => (prev[img.src] ? prev : { ...prev, [img.src]: ratio }));
          if (ratio > 1.05 && shouldDetectBars) {
            const has = detectBlackBars(probe);
            setImgHasBars((prev) => (prev[img.src] !== undefined ? prev : { ...prev, [img.src]: has }));
          } else {
            setImgHasBars((prev) => (prev[img.src] !== undefined ? prev : { ...prev, [img.src]: false }));
          }
        }
      };
      probe.onerror = () => {
        setImgHasBars((prev) => (prev[img.src] !== undefined ? prev : { ...prev, [img.src]: null }));
      };
      probe.src = img.src;
    };

    uniqueTargets.forEach(probeImage);

    // Em card expandido, processa o restante em lotes leves para evitar travar a UI.
    const timeoutIds: number[] = [];
    if (inExpandedCard && !fullscreen) {
      const remaining = images.filter((img) => !uniqueTargets.some((p) => p.src === img.src));
      let delay = 120;
      remaining.forEach((img) => {
        const timeoutId = window.setTimeout(() => probeImage(img), delay);
        timeoutIds.push(timeoutId);
        delay += 120;
      });
    }
    return () => {
      timeoutIds.forEach((timeoutId) => window.clearTimeout(timeoutId));
    };
  }, [images, inExpandedCard, fullscreen, current]);

  const shouldZoomFullscreen = fullscreen && isMobile && isLandscapeViewport && !isTabletViewport;
  const getFullscreenZoom = (ratio?: number, hasBars?: boolean | null) => {
    if (!shouldZoomFullscreen) return 1;
    if (hasBars === true) return 1.12;
    if (!ratio || !viewportRatio) return 1.08;
    const diff = ratio / viewportRatio;
    if (diff > 1) {
      return Math.min(1.18, diff);
    }
    const widen = 1 / diff;
    return Math.min(1.12, 1 + (widen - 1) * 0.25);
  };

  if (images.length === 0) return null;
  const useBlackBg = fullscreen;
  const currentRatio = images[current]?.src ? imgRatios[images[current].src] : undefined;
  const lockViewportToCurrent = Boolean(inExpandedCard && !fullscreen && currentRatio);

  return (
    <div 
      className={fullscreen ? "fixed top-0 left-0 right-0 z-50" : inExpandedCard ? "relative w-full flex flex-col items-center" : "relative w-full flex flex-col items-center my-6"}
      style={fullscreen ? { margin: 0, padding: 0, width: '100vw', height: 'var(--fullscreen-vh, 100svh)' } : (inExpandedCard && !fullscreen ? { marginTop: '0', marginBottom: '0' } : undefined)}
    >
      <div
        className={
          fullscreen 
            ? "w-full h-full flex justify-center items-center overflow-hidden bg-black"
            : inExpandedCard
              ? "w-full flex justify-center items-center max-w-full mx-auto overflow-hidden rounded-2xl bg-black"
              : "w-full flex justify-center items-center max-w-full mx-auto overflow-hidden rounded-2xl bg-black"
        }
        style={{
          background: useBlackBg ? 'black' : 'transparent',
          position: 'relative',
          isolation: fullscreen ? 'auto' : 'isolate',
          borderRadius,
          overflow: 'hidden',
          width: fullscreen ? '100%' : undefined,
          height: fullscreen ? '100%' : undefined,
          aspectRatio: lockViewportToCurrent ? currentRatio : undefined,
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
            height: fullscreen ? '100%' : (lockViewportToCurrent ? '100%' : 'auto'),
            transform: `translateX(${offset}%)`,
            transition: transition ? 'transform 0.3s' : 'none',
            position: 'relative',
            willChange: 'transform'
          }}
        >
          {imagesToShow.map((img, idx) => {
            const resolvedSrc = imgSrcOverrides[img.src] || img.src;
            const ratio = imgRatios[img.src];
            const isPortrait = ratio ? ratio < 1 : false;
            const isLandscape = ratio ? ratio > 1.05 : false;
            const isActiveSlide = idx === 1;
            const barsKnown = imgHasBars[img.src] !== undefined;
            const hasBars = imgHasBars[img.src] === true;
            const forceCrop = false;
            const innerAspectRatio = undefined;
            const objectFit = 'contain';
            const imgHeight = fullscreen ? '100%' : 'auto';
            const imgMaxHeight = fullscreen ? '100%' : '100%';
            const zoomScale = getFullscreenZoom(ratio, imgHasBars[img.src]);
            const baseScale = forceCrop ? 1.08 : 1;
            const finalScale = Math.max(baseScale, zoomScale);
            const imgScale = finalScale > 1 ? `scale(${finalScale})` : 'none';
            const ready = isLandscape && inExpandedCard ? barsKnown : true;
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
                background: fullscreen ? 'transparent' : 'transparent',
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
                aspectRatio: innerAspectRatio,
                borderRadius,
                overflow: 'hidden',
                background: fullscreen ? 'transparent' : '#000',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                flex: fullscreen ? 1 : undefined,
              }}
            >
              <img
                 src={resolvedSrc}
                 alt={img.alt || ''}
                 className={fullscreen ? '' : 'shadow-lg'}
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
                   maxHeight: fullscreen ? '100%' : (lockViewportToCurrent ? '100%' : imgMaxHeight),
                   transform: imgScale,
                   opacity: ready ? 1 : 0,
                   transition: 'opacity 140ms ease-out',
                   background: 'transparent',
                   margin: '0',
                   borderRadius,
                   clipPath: fullscreen ? undefined : `inset(0 round ${borderRadius}px)`,
                   willChange: fullscreen ? 'transform' : undefined,
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
