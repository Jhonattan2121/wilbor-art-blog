'use client';

import IconMenu from '@/app/IconMenu';
import { MarkdownRenderer } from '@/lib/markdown/MarkdownRenderer';
import '@/styles/slider-custom.css';
import { clsx } from 'clsx/lite';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import Slider from "react-slick";
import rehypeRaw from 'rehype-raw';
import "slick-carousel/slick/slick-theme.css";
import "slick-carousel/slick/slick.css";
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
  const formatPostContent = (content: string): string => {
    if (!content) return '';
    const formattedContent = content.replace(/!\[([^\]]*)\]\(([^)]+)\)\s*!\[/g, '![$1]($2)\n\n![');
    return formattedContent;
  };
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
          <div className="bg-black flex flex-col justify-center px-4 py-3">
            <p className="text-white text-base font-medium">{media.title}</p>
          </div>
        )}
      </div>
    );
  };
  return (
    <div className={clsx(
      'rounded-lg overflow-hidden h-full',
      isExpanded && 'transition-all duration-300 border-none',
      isExpanded
        ? 'w-full bg-black text-white'
        : 'cursor-pointer hover:opacity-90 border-2 border-solid border-black'
    )}
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
            <div className="flex flex-row h-full">
              {mainItem.hiveMetadata?.body && (
                <>
                  {updatedThumbnail ? (
                    <>
                      <div className="flex flex-row h-full w-full">
                        {!isReversedLayout && (
                          <>
                            <div className="bg-black flex flex-col justify-center px-2 py-1.5 w-1/2 sm:px-3 sm:py-2 md:px-4 md:py-3 sm:hidden">
                              <div className="text-white text-base sm:text-sm md:text-base font-medium line-clamp-2">
                                {mainItem.title}
                              </div>
                            </div>
                            <div className="flex-1 relative group h-full sm:hidden" style={{ height: '200px' }}>
                              <Image
                                src={updatedThumbnail}
                                alt={mainItem.title || ''}
                                fill
                                className="object-fill transition-all duration-300 filter grayscale group-hover:grayscale-0"
                                sizes="(max-width: 640px) 50vw, (max-width: 768px) 50vw, 33vw"
                                quality={85}
                                unoptimized={true}
                                style={{ objectFit: 'fill', objectPosition: 'center' }}
                              />
                            </div>
                          </>
                        )}
                        {isReversedLayout && (
                          <>
                            <div className="flex-1 relative group h-full sm:hidden" style={{ height: '200px' }}>
                              <Image
                                src={updatedThumbnail}
                                alt={mainItem.title || ''}
                                fill
                                className="object-fill transition-all duration-300 filter grayscale group-hover:grayscale-0"
                                sizes="(max-width: 640px) 50vw, (max-width: 768px) 50vw, 33vw"
                                quality={85}
                                unoptimized={true}
                                style={{ objectFit: 'fill', objectPosition: 'center' }}
                              />
                            </div>
                            <div className="bg-black flex flex-col justify-center px-2 py-1.5 w-1/2 sm:px-3 sm:py-2 md:px-4 md:py-3 sm:hidden">
                              <div className="text-white text-base sm:text-sm md:text-base font-medium line-clamp-2">
                                {mainItem.title}
                              </div>
                            </div>
                          </>
                        )}
                        <div className="hidden sm:flex sm:flex-col h-full w-full">
                          <div className="flex-1 relative group" style={{ minHeight: '200px' }}>
                            <Image
                              src={updatedThumbnail}
                              alt={mainItem.title || ''}
                              fill
                              className="object-cover transition-all duration-300 filter grayscale group-hover:grayscale-0"
                              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
                              quality={85}
                              unoptimized={true}
                            />
                          </div>
                          <div className="bg-black flex flex-col justify-center px-2 py-1.5 sm:px-3 sm:py-2 md:px-4 md:py-3">
                            <div className="text-white text-xs sm:text-sm md:text-base font-medium line-clamp-1">
                              {mainItem.title}
                            </div>
                            {mainItem.tags && mainItem.tags.length > 0 && (
                              <div className={clsx(
                                "flex flex-wrap gap-1 mt-1",
                                showAllTags ? "max-h-none pb-2" : "min-h-[24px] max-h-[24px] overflow-hidden"
                              )}>
                                {(showAllTags ? mainItem.tags : mainItem.tags.slice(0, 3)).map(tag => (
                                  <span
                                    key={tag}
                                    className="text-xs text-gray-300 px-1.5 py-0.5 rounded cursor-pointer hover:bg-gray-700"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onTagClick(tag);
                                    }}
                                  >
                                    {tag}
                                  </span>
                                ))}
                                {!showAllTags && mainItem.tags.length > 3 && (
                                  <span
                                    className="text-xs text-gray-300 px-1.5 py-0.5 rounded cursor-pointer hover:bg-gray-700"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setShowAllTags(true);
                                    }}
                                  >
                                    +{mainItem.tags.length - 3}
                                  </span>
                                )}
                                {showAllTags && (
                                  <span
                                    className="text-xs text-gray-300 bg-gray-800 px-1.5 py-0.5 rounded cursor-pointer hover:bg-gray-700"
                                    onClick={(e) => {
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
          <div className="flex flex-col h-full overflow-hidden" ref={contentRef}>
            <div className="flex items-center px-6 py-4 sticky top-0 z-20 bg-black shadow-md">
              <h2 className="flex-1 text-lg sm:text-xl font-normal text-white tracking-wide" style={{fontFamily: 'IBMPlexMono, monospace'}}>{mainItem.title}</h2>
              <button
                onClick={e => { e.stopPropagation(); onExpand(); }}
                className="ml-4 text-gray-400 hover:text-white rounded-full hover:bg-gray-800 transition-colors p-2 focus:outline-none focus:ring-2 focus:ring-red-200"
                aria-label="Fechar"
                title="Fechar"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar overscroll-contain px-2 sm:px-8 py-6 bg-black/90">
              {mainItem.src?.includes(SKATEHIVE_URL) && (
                <div className="w-full max-w-3xl mx-auto mb-8">
                  <div className="relative w-full aspect-[16/9] bg-black rounded-lg overflow-hidden shadow-lg">
                    <video
                      src={mainItem.src}
                      className="absolute top-0 left-0 w-full h-full object-contain bg-black rounded-lg"
                      controls
                      autoPlay={false}
                      playsInline
                      muted={true}
                      onLoadedMetadata={e => { const video = e.target as HTMLVideoElement; video.volume = 0.2; }}
                    />
                  </div>
                </div>
              )}
              {extractImagesFromMarkdown(mainItem.hiveMetadata?.body || '').length > 0 && (
                <div className="w-full max-w-3xl mx-auto mb-8">
                  <Slider
                    dots={true}
                    infinite={true}
                    speed={500}
                    slidesToShow={1}
                    slidesToScroll={1}
                    className="carousel-container overflow-hidden"
                    adaptiveHeight={false}
                  >
                    {extractImagesFromMarkdown(mainItem.hiveMetadata?.body || '').map(
                      (imgSrc, index) => (
                        <div key={index} className="px-0">
                          <div className="relative w-full aspect-[16/9] bg-black rounded-lg overflow-hidden shadow-lg">
                            <Image
                              src={imgSrc}
                              alt="Imagem do post"
                              fill
                              className="object-contain absolute top-0 left-0 rounded-lg"
                              unoptimized={true}
                              onError={e => { const target = e.target as HTMLImageElement; target.src = 'https://placehold.co/600x400?text=Image+Error'; }}
                            />
                          </div>
                        </div>
                      ))}
                  </Slider>
                </div>
              )}
              {mainItem.hiveMetadata?.body && (
                <div className="prose prose-invert prose-lg max-w-3xl mx-auto bg-black/80 rounded-xl p-6 shadow-lg">
                  <ReactMarkdown
                    rehypePlugins={[rehypeRaw]}
                    components={{
                      img: () => null,
                      video: () => null,
                      iframe: () => null,
                      p: ({ node, children, ...props }) => (
                        <p className="mb-4 text-gray-200 leading-relaxed text-lg" {...props}>{children}</p>
                      ),
                      h1: ({ node, children, ...props }) => (
                        <h1 className="text-3xl font-bold mb-4 mt-8 text-white" {...props}>{children}</h1>
                      ),
                      h2: ({ node, children, ...props }) => (
                        <h2 className="text-2xl font-bold mb-3 mt-6 text-white" {...props}>{children}</h2>
                      ),
                      h3: ({ node, children, ...props }) => (
                        <h3 className="text-xl font-semibold mb-2 mt-4 text-white" {...props}>{children}</h3>
                      ),
                      a: ({ node, children, ...props }) => (
                        <a className="text-blue-400 underline hover:text-blue-200" {...props}>{children}</a>
                      ),
                      ul: ({ node, children, ...props }) => (
                        <ul className="list-disc pl-6 mb-4 text-gray-200" {...props}>{children}</ul>
                      ),
                      ol: ({ node, children, ...props }) => (
                        <ol className="list-decimal pl-6 mb-4 text-gray-200" {...props}>{children}</ol>
                      ),
                      li: ({ node, children, ...props }) => (
                        <li className="mb-1" {...props}>{children}</li>
                      ),
                      blockquote: ({ node, children, ...props }) => (
                        <blockquote className="border-l-4 border-gray-500 pl-4 italic my-4 text-gray-300" {...props}>{children}</blockquote>
                      ),
                    }}
                  >
                    {mainItem.hiveMetadata.body}
                  </ReactMarkdown>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

function extractImagesFromMarkdown(markdown: string): string[] {
  if (!markdown) return [];
  const imageRegex = /!\[.*?\]\((.*?)\)/g;
  const images: string[] = [];
  let match;
  while ((match = imageRegex.exec(markdown)) !== null) {
    const imageUrl = formatPinataUrl(match[1]);
    images.push(imageUrl);
  }
  return images;
}

export default function PhotoGridContainer({
  sidebar,
  media = [],
  header,
  ...props
}: PhotoGridContainerProps) {
  const [expandedPermlinks, setExpandedPermlinks] = useState<string[]>([]);
  const [hasLargeContentMap, setHasLargeContentMap] = useState<Record<string, boolean>>({});
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [showMobileTags, setShowMobileTags] = useState(false);
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
  };
  const handleContentSizeChange = (permlink: string, isLarge: boolean) => {
    setHasLargeContentMap(prev => ({ ...prev, [permlink]: isLarge }));
  };
  return (
    <div className="w-full">
      {allTags.length > 0 && (
        <div className="sm:hidden z-40 w-full flex flex-row items-center justify-start mt-2 mb-4 bg-transparent">
          <button
            className="flex items-center gap-2 px-3 py-2 rounded-md text-base font-bold text-gray-200 border border-gray-400  focus:ring-2 focus:ring-red-200 transition-colors shadow-sm w-auto outline-none"
            style={{marginLeft: 0}}
            onClick={() => setShowMobileTags(true)}
            aria-label="Abrir menu de tags"
            title="Abrir menu de tags"
          >
            <IconMenu width={22} />
            <span className="font-bold text-gray-200">
              {selectedTag ? selectedTag : 'Tags'}
            </span>
          </button>
          {showMobileTags && (
            <>
              <div
                className="fixed inset-0 z-40 transition-opacity animate-fade-in bg-black/30 dark:bg-black/60"
                style={{backdropFilter: 'blur(2px)'}}
                onClick={() => setShowMobileTags(false)}
                aria-label="Fechar menu de tags"
                title="Fechar menu de tags"
              />
              <aside
                id="mobile-tags-drawer"
                className="fixed top-0 left-0 h-full w-64 shadow-2xl z-50 flex flex-col animate-slide-in-left bg-white dark:bg-black border-r border-gray-200 dark:border-gray-800"
                style={{ maxWidth: '80vw' }}
                aria-label="Menu lateral de tags"
              >
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-black">
                  <span className="font-bold text-lg text-gray-800 dark:text-white">{selectedTag ? selectedTag : 'Tags'}</span>
                  <button
                    onClick={() => setShowMobileTags(false)}
                    className="hover:text-black dark:hover:text-white p-1 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                    aria-label="Fechar menu"
                    title="Fechar menu"
                  >
                    <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto py-2 bg-white dark:bg-black">
                  <div className="flex flex-col gap-2 px-1">
                    {allTags.map(tag => (
                      <button
                        key={tag}
                        onClick={() => { setSelectedTag(tag); setShowMobileTags(false); }}
                        className={clsx(
                          'w-full text-left px-5 py-2 text-base rounded transition font-medium dark:text-gray-200 bg-white dark:bg-black hover:bg-gray-100 dark:hover:bg-gray-900 hover:text-black dark:hover:text-white',
                          selectedTag === tag && 'bg-gray-200 dark:bg-gray-800 font-bold text-black dark:text-white border-l-4 border-gray-500 dark:border-gray-400'
                        )}
                        aria-label={`Filtrar por tag ${tag}`}
                        title={`Filtrar por tag ${tag}`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => { setSelectedTag(null); setShowMobileTags(false); }}
                  className="w-full px-5 py-3 text-left font-semibold bg-white dark:bg-black border-t border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-900 transition"
                  aria-label="Limpar filtro de tags"
                  title="Limpar filtro de tags"
                >
                  Limpar filtro
                </button>
              </aside>
            </>
          )}
        </div>
      )}
      <div className={clsx(
        'max-w-[2000px] mx-auto px-1 sm:px-6 md:px-8',
        header ? 'mb-5 sm:mb-5' : 'mb-2'
      )}>
        {header}
        {selectedTag && (
          <div className="mb-4 hidden sm:flex items-center justify-center">
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-900 rounded shadow">
              <span className="text-sm font-medium text-gray-800 dark:text-gray-200">Filtrado por: <span className="font-bold">{selectedTag}</span></span>
              <button
                onClick={() => setSelectedTag(null)}
                className="text-sm text-gray-500 hover:text-black dark:hover:text-white px-2 py-0.5 transition-colors rounded focus:outline-none focus:ring-2 focus:ring-red-200"
                aria-label="Limpar filtro"
                title="Limpar filtro"
              >
                Limpar
              </button>
            </div>
          </div>
        )}
        {expandedPermlinks.length > 0 ? (
          <div className="w-full">
            {mediaGroups.filter(({ permlink }) => expandedPermlinks.includes(permlink)).map(({ permlink, group }, idx) => {
              const isExpanded = true;
              const isOdd = idx % 2 === 1;
              return (
                <div
                  key={permlink}
                  className={clsx(
                    'relative overflow-hidden rounded-lg w-full shadow-sm',
                    'transition-all duration-300',
                    hasLargeContentMap[permlink]
                      ? 'col-span-full h-auto'
                      : 'col-span-full h-auto'
                  )}
                  tabIndex={0}
                  aria-label={`Projeto ${group[0]?.title || ''}`}
                  title={group[0]?.title || ''}
                >
                  <MediaItem
                    items={group}
                    isExpanded={isExpanded}
                    onExpand={() => setExpandedPermlinks([])}
                    onContentSizeChange={isLarge => handleContentSizeChange(permlink, isLarge)}
                    onTagClick={handleTagClick}
                    hasLargeContent={!!hasLargeContentMap[permlink]}
                    isReversedLayout={isOdd}
                  />
                </div>
              );
            })}
          </div>
        ) : (
          <div className="grid gap-y-4 sm:gap-y-6 gap-x-2 sm:gap-x-4 md:gap-5 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 grid-flow-dense">
            {mediaGroups.map(({ permlink, group }, idx) => {
              const isExpanded = expandedPermlinks.includes(permlink);
              const isOdd = idx % 2 === 1;
              return (
                <div
                  key={permlink}
                  className={clsx(
                    'relative overflow-hidden rounded-lg w-full shadow-sm',
                    isExpanded && 'transition-all duration-300 ',
                    isExpanded
                      ? hasLargeContentMap[permlink]
                        ? 'col-span-full sm:col-span-2 md:col-span-3 lg:col-span-3 row-span-3 h-auto'
                        : 'col-span-full sm:col-span-2 md:col-span-2 lg:col-span-3 row-span-2 h-auto'
                      : 'col-span-1'
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
                          : [permlink]
                      );
                    }}
                    onContentSizeChange={isLarge => handleContentSizeChange(permlink, isLarge)}
                    onTagClick={handleTagClick}
                    hasLargeContent={!!hasLargeContentMap[permlink]}
                    isReversedLayout={isOdd}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>
      {sidebar && (
        <div className="hidden md:block">
          {sidebar}
        </div>
      )}
    </div>
  );
}