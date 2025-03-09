'use client';
export const dynamic = 'force-dynamic';
import { useCallback, useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import styles from './PhotoGallery.module.css';

interface MediaItem {
  type: 'image' | 'video' | 'iframe';
  url: string;
  iframeHtml?: string;
}

export const PhotoGalleryClient = ({
  media = [],
  postTitle,
  postBody
}: {
  media: MediaItem[];
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

  const nextImage = useCallback(() => {
    setCurrentIndex(prev => {
      const images = media.filter(item => item.type === 'image');
      return (prev + 1) % images.length;
    });
  }, [media]);

  const previousImage = useCallback(() => {
    setCurrentIndex(prev => {
      const images = media.filter(item => item.type === 'image');
      return (prev - 1 + images.length) % images.length;
    });
  }, [media]);

  const preloadImages = useCallback(() => {
    const imageItems = media.filter(item => item.type === 'image');

    // Initialize the array of loaded images
    setImagesLoaded(new Array(imageItems.length).fill(false));

    imageItems.forEach((item, index) => {
      const img = new Image();
      img.src = item.url;
      img.onload = () => {
        setImagesLoaded(prev => {
          const newLoaded = [...prev];
          newLoaded[index] = true;
          return newLoaded;
        });
      };
      setPreloadedImages(prev => [...prev, img]);
    });
  }, [media]);

  useEffect(() => {
    preloadImages();
  }, [preloadImages]);

  useEffect(() => {
    console.log('Media received:', media);
    console.log('Images filtered:', media.filter(item => item.type === 'image'));
    console.log('IFrames filtered:', media.filter(item => item.type === 'iframe'));
  }, [media]);

  const renderMedia = (item: MediaItem) => {
    console.log('Trying to render item:', item);
    switch (item.type) {
      case 'iframe':
        return (
          <div
            className={styles.iframeContainer}
            dangerouslySetInnerHTML={{ __html: item.iframeHtml || '' }}
          />
        );
      case 'image':
        console.log('Rendering image:', item.url);
        return (
          <img
            src={item.url}
            alt={`Image ${currentIndex + 1}`}
            loading="eager"
            decoding="async"
            className={styles.image}
            style={{
              opacity: imagesLoaded[currentIndex] ? 1 : 0.5,
              transition: 'opacity 0.3s ease-in-out'
            }}
            onError={(e) => {
              console.error('Error loading image:', item.url);
              const imgElement = e.target as HTMLImageElement;
              if (imgElement.src.includes('pinataGatewayToken')) {
                const newSrc = imgElement.src.split('?')[0];
                console.log('Trying to reload without token:', newSrc);
                imgElement.src = newSrc;
              }
            }}
            onLoad={() => {
              console.log('Image loaded successfully:', item.url);
            }}
          />
        );
      default:
        console.warn('Unsupported media type:', item.type);
        return null;
    }
  };

  // Modify the render condition to be more specific
  if (!media || media.length === 0) {
    console.log('No media found');
    return (
      <div className={styles.infoContainer}>
        <div className={styles.loadingIndicator}>
          No media found. Check console for details.
        </div>
        {postTitle && <h1 className={styles.title}>{postTitle}</h1>}
        {postBody && (
          <div className={styles.body}>
            <ReactMarkdown>{postBody}</ReactMarkdown>
          </div>
        )}
      </div>
    );
  }

  // Separate iframes and images
  const iframes = media.filter(item => item.type === 'iframe');
  const images = media.filter(item => item.type === 'image');

  return (
    <div>
      {/* Featured iframe section */}
      {iframes.length > 0 && (
        <div className={styles.mainIframeContainer}>
          {iframes.map((iframe, index) => (
            <div key={index} className={styles.iframeWrapper}>
              <div
                className={styles.iframeContainer}
                dangerouslySetInnerHTML={{ __html: iframe.iframeHtml || '' }}
              />
            </div>
          ))}
        </div>
      )}

      {/* Text section */}
      <div className={styles.infoContainer}>
        {postTitle && (
          <h1 className={styles.title}>{postTitle}</h1>
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

      {/* Image gallery */}
      {images.length > 0 && (
        <div className={styles.imageGalleryContainer}>
          <div className={styles.mainImageContainer}>
            {images[currentIndex] && !imagesLoaded[currentIndex] && (
              <div className={styles.loadingIndicator}>Carregando...</div>
            )}
            <button
              onClick={previousImage}
              className={styles.prevButton}
              disabled={images.length <= 1}
            >
              ←
            </button>
            {images[currentIndex] && renderMedia(images[currentIndex])}
            <button
              onClick={nextImage}
              className={styles.nextButton}
              disabled={images.length <= 1}
            >
              →
            </button>
            <div className={styles.counter}>
              {currentIndex + 1} / {images.length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};