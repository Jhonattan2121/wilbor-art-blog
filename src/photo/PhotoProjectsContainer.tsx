'use client';

import { IconX } from '@/components/IconX';
import ImageCarousel from '@/components/ImageCarousel';
import Markdown from '@/components/Markdown';
import { MarkdownRenderer } from '@/lib/markdown/MarkdownRenderer';
import '@/styles/slider-custom.css';
import { clsx } from 'clsx/lite';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import 'swiper/css';
import 'swiper/css/pagination';
import { extractImagesFromMarkdown } from './components/markdownUtils';
import { Media, PhotoGridContainerProps } from './components/types';

const formatPinataUrl = (url: string): string => {
  if (!url) return '';
  if (url.includes('pinataGatewayToken')) {
    return url.split('?')[0];
  }
  if (url.includes('images.hive.blog')) {
    return url.trim().replace(/['"]+/g, '');
  }
  return url;
};

function enhanceMediaWithMetadata(media: Media[]): Media[] {
  return media.map(item => {
    if (!item.hiveMetadata) return item;
    const enhancedItem = { ...item };
    if (item.thumbnailSrc && item.thumbnailSrc.startsWith('http')) {
      enhancedItem.thumbnailSrc = formatPinataUrl(item.thumbnailSrc);
      return enhancedItem;
    }
    try {
      const metadata = item.hiveMetadata as any;
      if (metadata.json_metadata) {
        const metadataStr = metadata.json_metadata;
        const parsedMetadata = typeof metadataStr === 'string' ? JSON.parse(metadataStr) : metadataStr;
        if (parsedMetadata?.image && Array.isArray(parsedMetadata.image) && parsedMetadata.image.length > 0) {
          enhancedItem.thumbnailSrc = formatPinataUrl(parsedMetadata.image[0]);
        }
      }
    } catch (error) {
      console.error("Error processing JSON metadata:", error);
    }
    if (!enhancedItem.thumbnailSrc && item.hiveMetadata.body) {
      const images = extractImagesFromMarkdown(item.hiveMetadata.body);
      if (images.length > 0) {
        enhancedItem.thumbnailSrc = images[0];
      }
    }
    if (!enhancedItem.thumbnailSrc && item.url?.includes('images.hive.blog')) {
      enhancedItem.thumbnailSrc = formatPinataUrl(item.url);
    }
    const specificHiveImageURL = 'https://images.hive.blog/DQmTgsmbnbqwmTCkRk54nu9bvkcNFVfa2v83rPQkzq9Mb7q/prt_1313385051.jpg';
    if (!enhancedItem.thumbnailSrc && (
      item.url?.includes('DQmTgsmbnbqwmTCkRk54nu9bvkcNFVfa2v83rPQkzq9Mb7q') ||
      (item.hiveMetadata.body && item.hiveMetadata.body.includes('DQmTgsmbnbqwmTCkRk54nu9bvkcNFVfa2v83rPQkzq9Mb7q'))
    )) {
      enhancedItem.thumbnailSrc = specificHiveImageURL;
    }
    return enhancedItem;
  });
}

function groupMediaByPermlink(media: Media[]): Map<string, Media[]> {
  const enhancedMedia = enhanceMediaWithMetadata(media);
  const mediaGroups = new Map<string, Media[]>();
  const processedUrls = new Set<string>();
  enhancedMedia.forEach(item => {
    if (item.hiveMetadata) {
      const permlink = item.hiveMetadata.permlink;
      if (!mediaGroups.has(permlink)) {
        mediaGroups.set(permlink, []);
      }
      const group = mediaGroups.get(permlink);
      if (group && !processedUrls.has(item.src)) {
        processedUrls.add(item.src);
        group.push(item);
      }
    }
  });
  mediaGroups.forEach((group, permlink) => {
    if (group.length > 0) {
      const mainItem = group[0];
      const extractedMedia = MarkdownRenderer.extractMediaFromHive({
        body: mainItem.hiveMetadata?.body || '',
        author: mainItem.hiveMetadata?.author || '',
        permlink: permlink,
        json_metadata: JSON.stringify({ image: [mainItem.src] })
      });
      extractedMedia.forEach(mediaContent => {
        if (!processedUrls.has(mediaContent.url)) {
          processedUrls.add(mediaContent.url);
          group.push({
            id: `${permlink}-${mediaContent.url}`,
            url: mediaContent.url,
            src: mediaContent.url,
            title: mainItem.title,
            type: mediaContent.type === 'iframe' ? 'video' : 'photo',
            iframeHtml: mediaContent.iframeHtml,
            thumbnailSrc: mainItem.thumbnailSrc,
            hiveMetadata: mainItem.hiveMetadata
          });
        }
      });
    }
  });
  return mediaGroups;
}

const SKATEHIVE_URL = 'ipfs.skatehive.app/ipfs';

const MediaItem = ({
  items,
  isExpanded,
  onExpand,
  onContentSizeChange,
  onTagClick,
  hasLargeContent = false,
  isReversedLayout = false
}: {
  items: Media[];
  isExpanded: boolean;
  onExpand: () => void;
  onContentSizeChange: (isLarge: boolean) => void;
  onTagClick: (tag: string) => void;
  hasLargeContent?: boolean;
  isReversedLayout?: boolean;
}) => {
  const mainItem = items[0];
  const [isHovered, setIsHovered] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const [imageError, setImageError] = useState(false);
  const [showAllTags, setShowAllTags] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const images = extractImagesFromMarkdown(mainItem.hiveMetadata?.body || '');

  // Fecha fullscreen com ESC e bloqueia scroll do body enquanto aberto
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsFullscreen(false);
    };
    if (isFullscreen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', onKey);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [isFullscreen]);
  function getThumbnailUrl(item: Media): string | null {
    try {
      if (item.hiveMetadata) {
        const metadata = item.hiveMetadata as any;
        if (metadata.json_metadata) {
          try {
            const parsedMetadata = typeof metadata.json_metadata === 'string'
              ? JSON.parse(metadata.json_metadata)
              : metadata.json_metadata;
            if (parsedMetadata.image && parsedMetadata.image.length > 0) {
              return parsedMetadata.image[0];
            }
          } catch (parseError) {
            console.error("Error parsing JSON metadata:", parseError);
          }
        }
      }
      const images = extractImagesFromMarkdown(item.hiveMetadata?.body || '');
      if (images.length > 0) {
        return images[0];
      }
      return item.src;
    } catch (e) {
      console.error('Error getting thumbnail:', e);
      return item.src;
    }
  }
  async function fetchPostFromHive(author: string, permlink: string): Promise<any> {
    try {
      const response = await fetch('https://api.hive.blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'condenser_api.get_content',
          params: [author, permlink],
          id: 1
        })
      });
      const data = await response.json();
      if (data && data.result) {
        return data.result;
      }
      return null;
    } catch (error) {
      console.error("Error fetching post data:", error);
      return null;
    }
  }
  const thumbnailUrl = getThumbnailUrl(mainItem);
  const [updatedThumbnail, setUpdatedThumbnail] = useState<string | null>(thumbnailUrl);
  useEffect(() => {
    if (mainItem.hiveMetadata) {
      const { author, permlink } = mainItem.hiveMetadata;
      fetchPostFromHive(author, permlink).then(post => {
        if (post && post.json_metadata) {
          try {
            const metadata = typeof post.json_metadata === 'string'
              ? JSON.parse(post.json_metadata)
              : post.json_metadata;
            if (metadata.image && metadata.image.length > 0) {
              setUpdatedThumbnail(metadata.image[0]);
            }
          } catch (e) {
            console.error("Erro ao analisar o JSON metadata:", e);
          }
        }
      });
    }
  }, [mainItem.hiveMetadata]);
  useEffect(() => {
    if (isExpanded && mainItem.hiveMetadata?.body) {
      const imageCount = extractImagesFromMarkdown(mainItem.hiveMetadata.body).length;
      const textLength = mainItem.hiveMetadata.body.length;
      const hasComplexContent = imageCount > 1 || textLength > 300 || (imageCount > 0 && textLength > 200);
      onContentSizeChange(hasComplexContent);
    } else if (isExpanded && mainItem.src?.includes(SKATEHIVE_URL)) {
      onContentSizeChange(true);
    } else {
      onContentSizeChange(false);
    }
  }, [isExpanded, mainItem.hiveMetadata?.body, mainItem.src]);

  const renderMedia = (media: Media, isMainVideo: boolean = false) => {
    if (media.src?.includes(SKATEHIVE_URL)) {
      return (
        <div
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="flex flex-col h-full"
        >
          <div className="flex-1 relative" style={isMainVideo ? { paddingTop: '56.25%' } : {}}>
            <video
              src={media.src}
              poster={updatedThumbnail || thumbnailUrl || undefined} // thumbnail como poster
              className={clsx(
                "transition-all duration-300 filter grayscale hover:grayscale-0",
                isMainVideo ? "absolute top-0 left-0 w-full h-full object-contain" : "absolute inset-0 w-full h-full object-cover"
              )}
              autoPlay={isHovered || (!isMainVideo && isExpanded)}
              loop={!isMainVideo}
              muted={!isMainVideo}
              controls={isMainVideo}
              playsInline
              style={{ backgroundColor: 'black' }}
              onLoadedMetadata={(e) => {
                const video = e.target as HTMLVideoElement;
                if (isMainVideo) {
                  video.volume = 0.2;
                }
              }}
              onMouseEnter={(e) => {
                const video = e.target as HTMLVideoElement;
                video.play();
              }}
              onMouseLeave={(e) => {
                const video = e.target as HTMLVideoElement;
                video.pause();
              }}
            />
          </div>
          {!isMainVideo && media.title && (
            <div className="bg-black flex flex-col justify-center px-4 py-3">
              <p className="text-white text-base font-medium">{media.title}</p>
            </div>
          )}
        </div>
      );
    }
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 relative group">
          <Image
            src={updatedThumbnail || thumbnailUrl || media.src || 'https://placehold.co/600x400?text=No+Image'}
            alt={media.title || ''}
            fill
            className="object-cover transition-all duration-300 filter grayscale group-hover:grayscale-0"
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
            quality={85}
            unoptimized={true}
            onError={() => {
              setImageError(true);
              if (imageError && media.src) {
                return media.src;
              }
            }}
          />
        </div>
        {media.title && (
          <div
            className={clsx(
              'bg-white dark:bg-black flex flex-col justify-center items-start px-4 py-6 w-full rounded-b-lg transition-colors duration-100',
              'group-hover:bg-black group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black'
            )}

          >
            <div className="text-sm font-normal line-clamp-2 text-center text-gray-700 dark:text-gray-300 mt-0 mb-1 transition-colors duration-100">
              {media.title}
            </div>
            {media.tags && media.tags.length > 0 && (
              <div className="mt-1 flex flex-wrap justify-start gap-x-2 gap-y-0.5">
                {media.tags.map(tag => (
                  <span
                    key={tag}
                    className="text-xs px-1.5 py-0.5 rounded transition-colors duration-100"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      className={clsx(
        'rounded-lg overflow-hidden h-full group transition-colors duration-100',
        'bg-white text-black dark:bg-black dark:text-white',
        !isExpanded && 'md:border-t-8 md:border-l-8 md:border-r-8 md:border-b-0 md:border-white md:dark:border-black md:hover:bg-black md:hover:text-white md:hover:border-t-black md:hover:border-l-black md:hover:border-r-black md:dark:hover:bg-white md:dark:hover:text-black md:dark:hover:border-t-white md:dark:hover:border-l-white md:dark:hover:border-r-white',
        isExpanded && 'p-2'
      )}
      style={{ fontFamily: 'Inter, Arial, sans-serif' }}
      onClick={e => {
        if (!isExpanded) onExpand();
      }}
    >
      <div className={clsx(
        'w-full h-full',
        isExpanded && 'transition-all duration-300',
        isExpanded
          ? hasLargeContent
            ? 'flex flex-col h-auto min-h-[550px] sm:min-h-[600px]'
            : 'flex flex-col h-auto min-h-[200px] sm:min-h-[450px]'
          : 'min-h-[200px]'
      )}>
        {!isExpanded && (
          <>
            <div className="sm:hidden w-full">
              {mainItem.hiveMetadata?.body && updatedThumbnail ? (
                <div className="flex flex-col h-full w-full">
                  <div className="relative w-full aspect-square">
                    <Image
                      src={updatedThumbnail}
                      alt={mainItem.title || ''}
                      fill
                      className="object-cover filter grayscale group-hover:grayscale-0 rounded-t-lg"
                      sizes="(max-width: 640px) 100vw, (max-width: 768px) 100vw, 33vw"
                      style={{ objectFit: 'cover', objectPosition: 'center' }}
                    />
                  </div>
                  <div
                    className={
                      clsx(
                        'bg-white dark:bg-black flex flex-col justify-start items-start w-full rounded-b-lg transition-colors duration-100',
                        'group-hover:bg-black group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black',
                        'px-3 py-2', // mobile compact
                        'sm:px-4 sm:py-6' // desktop mantém espaçamento original
                      )
                    }
                  >
                    <div className="text-xs font-medium line-clamp-2 text-left text-gray-700 dark:text-gray-300 mt-0 mb-0.5 transition-colors duration-100">
                      {mainItem.title}
                    </div>
                    {mainItem.tags && mainItem.tags.length > 0 && (
                      <div className="mt-0 flex flex-wrap justify-start gap-x-1 gap-y-0.5">
                        {mainItem.tags.map(tag => (
                          <span
                            key={tag}
                            className="text-[10px] px-1 py-0.5 rounded transition-colors duration-100"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex-1 relative group h-full">
                  {renderMedia(mainItem)}
                </div>
              )}
            </div>
            <div className="hidden sm:flex flex-row h-full w-full">
              {mainItem.hiveMetadata?.body && (
                <>
                  {updatedThumbnail ? (
                    <>
                      <div className="flex flex-row h-full w-full">
                        <div className="hidden sm:flex sm:flex-col h-full w-full">
                          <div className="flex-1 relative group" style={{ minHeight: '200px' }}>
                            <Image
                              src={updatedThumbnail}
                              alt={mainItem.title || ''}
                              fill
                              className="object-cover filter grayscale group-hover:grayscale-0"
                              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
                              quality={85}
                              unoptimized={true}
                            />
                          </div>
                          <div className={
                            clsx(
                              'bg-white dark:bg-black flex flex-col justify-center px-2 py-1.5 sm:px-3 sm:py-2 md:px-4 md:py-3 transition-colors duration-100',
                              'group-hover:bg-black group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black'
                            )
                          }>
                            <div className="text-xs sm:text-sm md:text-base font-medium line-clamp-1 transition-colors duration-100">
                              {mainItem.title}
                            </div>
                            {mainItem.tags && mainItem.tags.length > 0 && (
                              <div className={clsx(
                                'flex flex-wrap gap-1 mt-1',
                                showAllTags ? 'max-h-none pb-2' : 'min-h-[24px] max-h-[24px] overflow-hidden'
                              )}>
                                {(showAllTags ? mainItem.tags : mainItem.tags.slice(0, 3)).map(tag => (
                                  <span
                                    key={tag}
                                    className="text-xs px-1.5 py-0.5 rounded transition-colors duration-100"
                                  >
                                    {tag}
                                  </span>
                                ))}
                                {!showAllTags && mainItem.tags.length > 3 && (
                                  <span
                                    className="text-xs px-1.5 py-0.5 rounded cursor-pointer hover:bg-gray-700"
                                    onClick={e => {
                                      e.stopPropagation();
                                      setShowAllTags(true);
                                    }}
                                  >
                                    +{mainItem.tags.length - 3}
                                  </span>
                                )}
                                {showAllTags && (
                                  <span
                                    className="text-xs px-1.5 py-0.5 rounded cursor-pointer hover:bg-gray-700"
                                    onClick={e => {
                                      e.stopPropagation();
                                      setShowAllTags(false);
                                    }}
                                  >
                                    Menos
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex-1 relative group h-full">
                      {renderMedia(mainItem)}
                    </div>
                  )}
                </>
              )}
              {!mainItem.hiveMetadata?.body && (
                <div className="flex-1 relative group h-full">
                  {renderMedia(mainItem)}
                </div>
              )}
            </div>
          </>
        )}
        {isExpanded && (
          <div className="flex flex-col h-full overflow-hidden w-full" ref={contentRef}>
            <div className="flex items-center px-2 sm:px-8 py-2 sm:py-5 sticky top-0 z-20 bg-white dark:bg-black shadow-md">
              <h2
                className="flex-1 text-lg sm:text-3xl font-bold tracking-wide leading-tight"
                style={{ fontFamily: 'Inter, Arial, sans-serif' }}
              >
                {mainItem.title}
              </h2>
              {/* Botão de zoom para abrir fullscreen reutilizando ImageCarousel */}
              {images.length > 0 && (
                <button
                  onClick={e => { e.stopPropagation(); setIsFullscreen(true); }}
                  className="mr-2 p-0 bg-transparent border-none shadow-none flex items-center justify-center"
                  aria-label="Abrir em tela cheia"
                  title="Abrir em tela cheia"
                  style={{ background: 'transparent', border: 'none', boxShadow: 'none', padding: 0 }}
                >
                  <Image
                    src="/wilborPhotos/Full-Screen-Icon-Wilbor-site.png"
                    alt="Abrir em tela cheia"
                    width={28}
                    height={28}
                    style={{ display: 'inline-block' }}
                  />
                </button>
              )}
              <button
                onClick={e => { e.stopPropagation(); onExpand(); }}
                className="ml-2 sm:ml-6 rounded-full transition-colors p-1 sm:p-2 flex items-center justify-center focus:outline-none"
                aria-label="Fechar"
                title="Fechar"
                style={{ background: 'transparent', border: 'none', boxShadow: 'none' }}
              >
                <IconX size={35} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar overscroll-contain px-0 sm:px-8 py-1 sm:py-8 bg-white dark:bg-black flex flex-col items-start w-full">
              {images.length > 0 && (
                <div className="prose prose-invert prose-base sm:prose-lg w-full bg-white dark:bg-black rounded-xl p-2 sm:p-8 shadow-lg mt-0 sm:mt-6 text-center">
                  <Markdown videoPoster={updatedThumbnail || thumbnailUrl || undefined}>
                    {mainItem.hiveMetadata?.body ?? ''}
                  </Markdown>
                </div>
              )}
              {/* Modal fullscreen reutilizando ImageCarousel */}
              {isFullscreen && (
                <div
                  className="fixed inset-0 z-50 flex items-start justify-center bg-black/90 p-0 sm:p-6"
                  onClick={() => setIsFullscreen(false)}
                >
                  {/* Header do overlay: garante espaçamento e área para o botão fechar */}
                  <div
                    className="absolute top-3 sm:top-0 left-0 right-0 z-50 flex justify-end items-center h-12 sm:h-16 px-3 sm:px-6 bg-gradient-to-b from-black/70 to-transparent backdrop-blur-sm"
                    onClick={e => e.stopPropagation()}
                  >
                    <button
                      onClick={() => setIsFullscreen(false)}
                      className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white shadow-lg mr-2 sm:mr-4 border border-white/10 transform translate-y-1 sm:translate-y-0"
                      aria-label="Fechar fullscreen"
                      title="Fechar"
                    >
                      <IconX size={28} />
                    </button>
                  </div>

                  <div className="w-full h-auto pt-12 sm:pt-20 max-w-[1400px] max-h-[95vh] flex items-center justify-center relative overflow-hidden" onClick={e => e.stopPropagation()}>
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageCarousel
                        images={images.map(src => ({ src, alt: mainItem.title || '' }))}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};


export default function PhotoGridContainer({
  sidebar,
  media = [],
  header,
  selectedTag,
  setSelectedTag,
  ...props
}: PhotoGridContainerProps & {
  selectedTag: string | null;
  setSelectedTag: (tag: string | null) => void;
}) {
  const [expandedPermlinks, setExpandedPermlinks] = useState<string[]>([]);
  const [hasLargeContentMap, setHasLargeContentMap] = useState<Record<string, boolean>>({});
  const groupedMedia = groupMediaByPermlink(media);
  const allTags = Array.from(new Set(media.flatMap(item => item.tags || [])));
  const mediaGroups = Array.from(groupedMedia.entries())
    .filter(([_, group]) => {
      if (!selectedTag) return true;
      return group[0].tags?.includes(selectedTag);
    })
    .map(([permlink, group]) => ({
      permlink,
      group,
      mainItem: group[0]
    }));
  const handleTagClick = (tag: string) => {
    setSelectedTag(selectedTag === tag ? null : tag);
    setExpandedPermlinks([]);

    const url = new URL(window.location.href);
    if (selectedTag !== tag) {
      url.searchParams.set('tag', tag);
    } else {
      url.searchParams.delete('tag');
    }
    window.history.pushState({}, '', url);
  };
  const handleContentSizeChange = (permlink: string, isLarge: boolean) => {
    setHasLargeContentMap(prev => ({ ...prev, [permlink]: isLarge }));
  };
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (expandedPermlinks.length === 1) {
      const permlink = expandedPermlinks[0];
      const ref = cardRefs.current[permlink];
      if (ref) {
        setTimeout(() => {
          const isMobile = window.innerWidth < 768;
          if (isMobile) {
            // No mobile, queremos o card um pouco mais acima para aparecer título / começo do texto
            const headerOffset = 90; // altura aproximada do header fixo + respiro
            const rect = ref.getBoundingClientRect();
            const targetY = rect.top + window.scrollY - headerOffset;
            window.scrollTo({
              top: targetY < 0 ? 0 : targetY,
              behavior: 'smooth',
            });
          } else {
            // Em telas maiores mantemos o alinhamento central
            ref.scrollIntoView({
              behavior: 'smooth',
              block: 'center',
              inline: 'nearest',
            });
          }
        }, 100);
      }
    }
  }, [expandedPermlinks]);
  return (
    <div className="w-full">
      <div className={clsx(
        'max-w-[2000px] mx-auto px-3.5 sm:px-6 md:px-8',
        header ? 'mb-5 sm:mb-5' : 'mb-2'
      )}>
        {header}

        <div className={clsx(
          'grid',
          'gap-y-8 sm:gap-y-6 gap-x-2 sm:gap-x-4 md:gap-5',
          'grid-cols-2 sm:grid-cols-2 md:grid-cols-3',
          'lg:grid-cols-4 xl:grid-cols-4',
          'grid-flow-dense',
          'mt-8 sm:mt-0',
        )}>
          {mediaGroups.map(({ permlink, group }, idx) => {
            const isExpanded = expandedPermlinks.includes(permlink);
            const isOdd = idx % 2 === 1;
            return (
              <div
                key={permlink}
                ref={el => { cardRefs.current[permlink] = el; }}
                className={clsx(
                  'relative overflow-hidden w-full shadow-sm',
                  'transition-all duration-300',
                  'rounded-none sm:rounded-lg',

                  isExpanded
                    ? (
                      hasLargeContentMap[permlink]
                        ? (
                          'col-span-2 justify-self-center sm:col-span-2 '
                          + 'md:col-span-3 lg:col-span-3 row-span-3 h-auto'
                        )
                        : 'col-span-1'
                    )
                    : 'w-full',
                )}
                tabIndex={0}
                aria-label={`Projeto ${group[0]?.title || ''}`}
                title={group[0]?.title || ''}
              >
                <MediaItem
                  items={group}
                  isExpanded={isExpanded}
                  onExpand={() => {
                    setExpandedPermlinks(prev =>
                      prev.includes(permlink)
                        ? []
                        : [permlink],
                    );
                  }}
                  onContentSizeChange={function onSizeChange(isLarge) {
                    handleContentSizeChange(permlink, isLarge);
                  }}
                  onTagClick={handleTagClick}
                  hasLargeContent={!!hasLargeContentMap[permlink]}
                  isReversedLayout={isOdd}
                />
              </div>
            );
          })}
        </div>
      </div>
      {sidebar && (
        <div className="hidden md:block">
          {sidebar}
        </div>
      )}
    </div>
  );
}
