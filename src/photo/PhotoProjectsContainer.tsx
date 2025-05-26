'use client';

import { MarkdownRenderer } from '@/lib/markdown/MarkdownRenderer';
import '@/styles/slider-custom.css';
import { clsx } from 'clsx/lite';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import 'swiper/css';
import 'swiper/css/pagination';
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
  const [fullscreenImg, setFullscreenImg] = useState<string | null>(null);
  const [fullscreenIndex, setFullscreenIndex] = useState(0);
  const images = extractImagesFromMarkdown(mainItem.hiveMetadata?.body || '');
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
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
          <div className="bg-black flex flex-col justify-center items-start px-4 py-6 w-full rounded-b-lg group-hover:bg-white transition-colors duration-100">
            <div className="text-gray-400 text-xl font-bold line-clamp-2 text-left group-hover:text-black transition-colors duration-100">
              {media.title}
            </div>
            {media.tags && media.tags.length > 0 && (
              <div className="mt-1 flex flex-wrap justify-start gap-x-2 gap-y-0.5">
                {media.tags.map(tag => (
                  <span key={tag} className="text-base text-gray-400 font-mono group-hover:text-black transition-colors duration-100">{tag}</span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };
  return (
    <div className={clsx(
      'rounded-lg overflow-hidden h-full group transition-colors duration-100',
      isExpanded && 'border-none',
      isExpanded
        ? 'w-full bg-black text-white'
        : 'cursor-pointer hover:opacity-90 border-l-8 border-r-8 border-t-8 border-black hover:border-white hover:bg-white hover:text-black'
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
            <div className="sm:hidden w-full">
              {mainItem.hiveMetadata?.body && updatedThumbnail ? (
                <div className="flex flex-col h-full w-full">
                  <div className="relative w-full aspect-[4/3]">
                    <Image
                      src={updatedThumbnail}
                      alt={mainItem.title || ''}
                      fill
                      className="object-cover filter grayscale group-hover:grayscale-0 rounded-t-lg"
                      sizes="(max-width: 640px) 100vw, (max-width: 768px) 100vw, 33vw"
                      style={{ objectFit: 'cover', objectPosition: 'center' }}
                    />
                  </div>
                  <div className="bg-black flex flex-col justify-center items-start px-4 py-6 w-full rounded-b-lg group-hover:bg-white transition-colors duration-100">
                    <div className="text-gray-400 text-xl font-bold line-clamp-2 text-left group-hover:text-black transition-colors duration-100">
                      {mainItem.title}
                    </div>
                    {mainItem.tags && mainItem.tags.length > 0 && (
                      <div className="mt-1 flex flex-wrap justify-start gap-x-2 gap-y-0.5">
                        {mainItem.tags.map(tag => (
                          <span key={tag} className="text-base text-gray-400 font-mono group-hover:text-black transition-colors duration-100">{tag}</span>
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
                          <div className="bg-black flex flex-col justify-center px-2 py-1.5 sm:px-3 sm:py-2 md:px-4 md:py-3 group-hover:bg-white transition-colors duration-100">
                            <div className="text-gray-400 text-xs sm:text-sm md:text-base font-medium line-clamp-1 group-hover:text-black transition-colors duration-100">
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
                                    className="text-xs text-gray-400 px-1.5 py-0.5 rounded cursor-pointer hover:bg-gray-700 group-hover:text-black transition-colors duration-100"
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
                                    className="text-xs text-gray-400 px-1.5 py-0.5 rounded cursor-pointer hover:bg-gray-700"
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
                                    className="text-xs text-gray-400 bg-gray-800 px-1.5 py-0.5 rounded cursor-pointer hover:bg-gray-700"
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
            <div className="flex items-center px-3 sm:px-8 py-2 sm:py-5 sticky top-0 z-20 bg-black shadow-md">
              <h2 className="flex-1 text-lg sm:text-3xl font-bold text-white tracking-wide leading-tight" style={{ fontFamily: 'IBMPlexMono, monospace' }}>{mainItem.title}</h2>
              <button
                onClick={e => { e.stopPropagation(); onExpand(); }}
                className="ml-2 sm:ml-6 rounded-full transition-colors p-1 sm:p-2 flex items-center justify-center focus:outline-none"
                aria-label="Fechar"
                title="Fechar"
                style={{ width: 44, height: 44, background: '#bbb', border: 'none', boxShadow: 'none' }}
              >
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="14" cy="14" r="14" fill="#bbb" />
                  <line x1="9" y1="9" x2="19" y2="19" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
                  <line x1="19" y1="9" x2="9" y2="19" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar overscroll-contain px-1.5 sm:px-8 py-3 sm:py-8 bg-black/90 flex flex-col items-start">
              {mainItem.src?.includes(SKATEHIVE_URL) && (
                <div className="w-full max-w-3xl mx-auto p-0 m-0" style={{ background: 'none', boxShadow: 'none', borderRadius: 0 }}>
                  <div className="relative w-full aspect-[16/9] p-0 m-0" style={{ background: 'none', boxShadow: 'none', borderRadius: 0 }}>
                    <VideoWithFullPoster
                      src={mainItem.src}
                      poster={updatedThumbnail || thumbnailUrl || mainItem.thumbnailSrc || ''}
                    />
                  </div>
                </div>
              )}
              {images.length > 0 && (
                <div className="w-full max-w-3xl mx-auto p-0 m-0 mt-3 sm:mt-0" style={{ background: 'none', boxShadow: 'none', borderRadius: 0 }}>
                  <div className="relative w-full aspect-[4/3] sm:aspect-[5/4] p-0 m-0 flex items-center justify-center">
                    <img
                      src={images[fullscreenIndex]}
                      alt="Imagem do post"
                      className="object-contain absolute top-0 left-0 w-full h-full cursor-pointer select-none"
                      onClick={e => {
                        const bounds = (e.target as HTMLElement).getBoundingClientRect();
                        const x = (e as React.MouseEvent).clientX - bounds.left;
                        if (x < bounds.width / 3) {
                          setFullscreenIndex(fullscreenIndex === 0 ? images.length - 1 : fullscreenIndex - 1);
                        } else if (x > (2 * bounds.width) / 3) {
                          setFullscreenIndex(fullscreenIndex === images.length - 1 ? 0 : fullscreenIndex + 1);
                        } else if (window.innerWidth < 640) {
                          setFullscreenImg(images[fullscreenIndex]);
                        }
                      }}
                    />
                    <button
                      className="absolute left-0 top-0 h-full w-1/3 cursor-pointer z-10 bg-transparent border-none p-0 m-0"
                      tabIndex={-1}
                      style={{ outline: 'none', border: 'none', background: 'transparent' }}
                      onClick={() => setFullscreenIndex(fullscreenIndex === 0 ? images.length - 1 : fullscreenIndex - 1)}
                      aria-label="Imagem anterior"
                    />
                    <button
                      className="absolute right-0 top-0 h-full w-1/3 cursor-pointer z-10 bg-transparent border-none p-0 m-0"
                      tabIndex={-1}
                      style={{ outline: 'none', border: 'none', background: 'transparent' }}
                      onClick={() => setFullscreenIndex(fullscreenIndex === images.length - 1 ? 0 : fullscreenIndex + 1)}
                      aria-label="Próxima imagem"
                    />
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                      {images.map((_, idx) => (
                        <button
                          key={idx}
                          className={`w-4 h-4 rounded-full flex items-center justify-center transition-all duration-200 focus:outline-none ${idx === fullscreenIndex ? 'bg-red-500 scale-110 shadow-lg' : 'bg-white/20 hover:bg-red-400/40'}`}
                          onClick={() => setFullscreenIndex(idx)}
                          aria-label={`Ir para imagem ${idx + 1}`}
                          style={{ boxShadow: 'none', border: 'none', padding: 0, margin: 0 }}
                        >
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              {mainItem.hiveMetadata?.body && (
                <div className="prose prose-invert prose-base sm:prose-lg max-w-3xl mx-auto bg-black/80 rounded-xl p-4 sm:p-8 shadow-lg mt-0 sm:mt-6 text-left pl-4 sm:pl-12 sm:ml-[-3rem]">
                  <ReactMarkdown
                    rehypePlugins={[rehypeRaw]}
                    components={{
                      img: () => null,
                      video: () => null,
                      iframe: () => null,
                      p: ({ node, children, ...props }) => (
                        <p className="mb-3 sm:mb-5 text-gray-200 leading-relaxed text-base sm:text-lg" {...props}>{children}</p>
                      ),
                      h1: ({ node, children, ...props }) => (
                        <h1 className="text-2xl sm:text-4xl font-bold mb-3 sm:mb-5 mt-4 sm:mt-8 text-white" {...props}>{children}</h1>
                      ),
                      h2: ({ node, children, ...props }) => (
                        <h2 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-4 mt-3 sm:mt-6 text-white" {...props}>{children}</h2>
                      ),
                      h3: ({ node, children, ...props }) => (
                        <h3 className="text-lg sm:text-xl font-semibold mb-1 sm:mb-2 mt-2 sm:mt-4 text-white" {...props}>{children}</h3>
                      ),
                      a: ({ node, children, ...props }) => (
                        <a className="text-blue-400 underline hover:text-blue-200" {...props}>{children}</a>
                      ),
                      ul: ({ node, children, ...props }) => (
                        <ul className="list-disc pl-4 sm:pl-6 mb-2 sm:mb-4 text-gray-200" {...props}>{children}</ul>
                      ),
                      ol: ({ node, children, ...props }) => (
                        <ol className="list-decimal pl-4 sm:pl-6 mb-2 sm:mb-4 text-gray-200" {...props}>{children}</ol>
                      ),
                      li: ({ node, children, ...props }) => (
                        <li className="mb-0.5 sm:mb-1" {...props}>{children}</li>
                      ),
                      blockquote: ({ node, children, ...props }) => (
                        <blockquote className="border-l-4 border-gray-500 pl-2 sm:pl-4 italic my-2 sm:my-4 text-gray-300" {...props}>{children}</blockquote>
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
        {fullscreenImg && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md">
            <button
              className="absolute top-4 right-4 text-white bg-black/60 rounded-full p-2 z-50 flex items-center justify-center border-2 border-gray-300 shadow-lg hover:border-red-500 hover:rotate-90 transition-all"
              onClick={() => setFullscreenImg(null)}
              aria-label="Fechar imagem em tela cheia"
              style={{ width: 44, height: 44 }}
            >
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="14" cy="14" r="12" stroke="#fff" strokeWidth="2" fill="#222" />
                <circle cx="14" cy="14" r="4" stroke="#fff" strokeWidth="2" fill="#d32f2f" />
                <rect x="13" y="7" width="2" height="14" rx="1" fill="#fff" />
                <rect x="7" y="13" width="14" height="2" rx="1" fill="#fff" />
              </svg>
            </button>
            <div className="relative w-full max-w-xl flex flex-col items-center">
              <div className="relative w-full flex items-center justify-center">
                <img
                  src={images[fullscreenIndex]}
                  alt="Imagem em tela cheia"
                  className="max-w-full max-h-[80vh] rounded-lg shadow-lg object-contain select-none"
                  style={{ objectFit: 'contain' }}
                  onClick={e => {
                    const bounds = (e.target as HTMLElement).getBoundingClientRect();
                    const x = (e as React.MouseEvent).clientX - bounds.left;
                    if (x < bounds.width / 3) {
                      setFullscreenIndex(fullscreenIndex === 0 ? images.length - 1 : fullscreenIndex - 1);
                    } else if (x > (2 * bounds.width) / 3) {
                      setFullscreenIndex(fullscreenIndex === images.length - 1 ? 0 : fullscreenIndex + 1);
                    }
                  }}
                />
                <button
                  className="absolute left-0 top-0 h-full w-1/3 cursor-pointer z-10 bg-transparent border-none p-0 m-0"
                  tabIndex={-1}
                  style={{ outline: 'none', border: 'none', background: 'transparent' }}
                  onClick={() => setFullscreenIndex(fullscreenIndex === 0 ? images.length - 1 : fullscreenIndex - 1)}
                  aria-label="Imagem anterior"
                />
                <button
                  className="absolute right-0 top-0 h-full w-1/3 cursor-pointer z-10 bg-transparent border-none p-0 m-0"
                  tabIndex={-1}
                  style={{ outline: 'none', border: 'none', background: 'transparent' }}
                  onClick={() => setFullscreenIndex(fullscreenIndex === images.length - 1 ? 0 : fullscreenIndex + 1)}
                  aria-label="Próxima imagem"
                />
              </div>
              <div className="flex gap-2 mt-4">
                {images.map((_, idx) => (
                  <button
                    key={idx}
                    className={`w-4 h-4 rounded-full border-2 border-red-500 flex items-center justify-center transition-all duration-200 ${idx === fullscreenIndex ? 'bg-red-500 scale-110 shadow-lg' : 'bg-transparent'}`}
                    onClick={() => setFullscreenIndex(idx)}
                    aria-label={`Ir para imagem ${idx + 1}`}
                  >
                    {idx === fullscreenIndex && (
                      <span className="block w-1.5 h-1.5 bg-white rounded-full" />
                    )}
                  </button>
                ))}
              </div>
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
  return (
    <div className="w-full">
      <div className={clsx(
        'max-w-[2000px] mx-auto px-4 sm:px-6 md:px-8',
        header ? 'mb-5 sm:mb-5' : 'mb-2'
      )}>
        {header}
       
        <div className="grid gap-y-10 sm:gap-y-6 gap-x-2 sm:gap-x-4 md:gap-5 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 grid-flow-dense">
          {mediaGroups.map(({ permlink, group }, idx) => {
            const isExpanded = expandedPermlinks.includes(permlink);
            const isOdd = idx % 2 === 1;
            return (
              <div
                key={permlink}
                className={clsx(
                  'relative overflow-hidden rounded-lg w-full shadow-sm',
                  'transition-all duration-300',
                  isExpanded
                    ? (hasLargeContentMap[permlink]
                      ? 'sm:col-span-2 md:col-span-3 lg:col-span-3 row-span-3 h-auto'
                      : 'sm:col-span-2 md:col-span-3 lg:col-span-3 row-span-2 h-auto')
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
      </div>
      {sidebar && (
        <div className="hidden md:block">
          {sidebar}
        </div>
      )}
    </div>
  );
}

function VideoWithFullPoster({ src, poster }: { src: string; poster: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <video
      ref={videoRef}
      src={src}
      poster={poster}
      className={`absolute top-0 left-0 w-full h-full bg-black rounded-lg transition-all duration-200 ${isPlaying ? 'object-contain' : 'object-cover'}`}
      controls
      autoPlay={false}
      playsInline
      muted={true}
      onPlay={() => setIsPlaying(true)}
      onPause={() => setIsPlaying(false)}
      onLoadedMetadata={e => { const video = e.target as HTMLVideoElement; video.volume = 0.2; }}
    />
  );
}