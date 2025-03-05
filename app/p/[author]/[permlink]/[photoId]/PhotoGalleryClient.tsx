'use client';
export const dynamic = 'force-dynamic';
import { useCallback, useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import styles from './PhotoGallery.module.css';

export const PhotoGalleryClient = ({
  urls,
  postTitle,
  postBody
}: {
  urls: string[];
  postTitle?: string;
  postBody?: string;
}) => {
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

  return (
    <div>
      <div className={styles.container}>
        <div
          className={styles.mainImageContainer}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {!imagesLoaded[currentIndex] && (
            <div className={styles.loadingIndicator}>
              Loading...
            </div>
          )}
          <button
            onClick={previousImage}
            className={styles.prevButton}
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
            className={styles.nextButton}
            aria-label="Next image"
          >
            →
          </button>

          <div className={styles.counter}>
            {currentIndex + 1} / {urls.length}
          </div>
        </div>
      </div>

      <div className={styles.infoContainer}>
        {postTitle && (
          <h1 className={styles.title}>
            {postTitle}
          </h1>
        )}
        {postBody && (
          <div className={styles.body}>
            <ReactMarkdown
              components={{
                h1: ({ node, ...props }) => <h1 className={styles.heading} {...props} />,
                h2: ({ node, ...props }) => <h2 className={styles.heading} {...props} />,
                h3: ({ node, ...props }) => <h3 className={styles.heading} {...props} />,
                p: ({ node, ...props }) => <p className={styles.paragraph} {...props} />,
                a: ({ node, ...props }) => <a className={styles.link} {...props} />,
                ul: ({ node, ...props }) => <ul className={styles.list} {...props} />,
                ol: ({ node, ...props }) => <ol className={styles.orderedList} {...props} />,
                li: ({ node, ...props }) => <li className={styles.listItem} {...props} />
              }}
            >
              {postBody}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
};