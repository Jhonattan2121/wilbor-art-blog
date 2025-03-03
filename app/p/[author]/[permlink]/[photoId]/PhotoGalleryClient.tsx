'use client';
export const dynamic = 'force-dynamic';
import { CSSProperties, useCallback, useEffect, useState } from 'react';
import styles from './PhotoGallery.module.css';

export const PhotoGalleryClient = ({ urls }: { urls: string[] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [imagesLoaded, setImagesLoaded] = useState<boolean[]>([]);
  const [preloadedImages, setPreloadedImages] = useState<HTMLImageElement[]>([]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') nextImage();
      if (e.key === 'ArrowLeft') previousImage();
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % urls.length);
  };

  const previousImage = () => {
    setCurrentIndex((prev) => (prev - 1 + urls.length) % urls.length);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;

    if (Math.abs(diff) > 50) {
      if (diff > 0) nextImage();
      else previousImage();
    }
  }, [touchStart]);

  const preloadImages = useCallback(() => {
    urls.forEach((url, index) => {
      const img = new Image();
      img.src = url;
      img.onload = () => {
        setImagesLoaded(prev => {
          const newLoaded = [...prev];
          newLoaded[index] = true;
          return newLoaded;
        });
      };
      setPreloadedImages(prev => [...prev, img]);
    });
  }, [urls]);

  useEffect(() => {
    preloadImages();
  }, [preloadImages]);

  const galleryStyles: { [key: string]: CSSProperties } = {

    button: {
      position: 'absolute' as const,
      top: '50%',
      transform: 'translateY(-50%)',
      background: '#fff',
      color: '#333',
      border: 'none',
      padding: '15px',
      cursor: 'pointer',
      borderRadius: '50%',
      fontSize: '18px',
      width: '46px',
      height: '46px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
      transition: 'all 0.2s ease',

    },
    prevButton: {
      left: '20px',
    },
    nextButton: {
      right: '20px',
    },
    counter: {
      position: 'absolute' as const,
      bottom: '20px',
      right: '20px',
      background: '#fff',
      color: '#333',
      padding: '8px 16px',
      borderRadius: '20px',
      fontSize: '14px',
      fontWeight: '500',
      boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
    },
    loadingIndicator: {
      position: 'absolute' as const,
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      display: imagesLoaded[currentIndex] ? 'none' : 'block',
    }
  };


  return (
    <div style={galleryStyles.container}>
      <div
        className={styles.mainImageContainer}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {!imagesLoaded[currentIndex] && (
          <div style={galleryStyles.loadingIndicator}>
            Loading...
          </div>
        )}
        <button
          onClick={previousImage}
          style={{ ...galleryStyles.button, ...galleryStyles.prevButton }}
          aria-label="Previous image"
        >
          ←
        </button>

        <img
          src={urls[currentIndex]}
          alt={`Image ${currentIndex + 1}`}
          loading="eager"
          decoding="async"
          className={styles.image}
          style={{
            opacity: imagesLoaded[currentIndex] ? 1 : 0.5,
            transition: 'opacity 0.3s ease-in-out'
          }}
        />

        <button
          onClick={nextImage}
          style={{ ...galleryStyles.button, ...galleryStyles.nextButton }}
          aria-label="Next image"
        >
          →
        </button>

        <div style={galleryStyles.counter}>
          {currentIndex + 1} / {urls.length}
        </div>


      </div>


    </div>
  );
};