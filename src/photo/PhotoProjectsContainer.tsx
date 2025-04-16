'use client';

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
  if (url.includes('pinataGatewayToken')) {
    return url.split('?')[0];
  }
  return url;
};

// First, let's create a function to group the media by permlink
function groupMediaByPermlink(media: Media[]): Map<string, Media[]> {
  const groupedMedia = new Map<string, Media[]>();
  const processedUrls = new Set<string>();

  // First, let's group by permlink
  media.forEach(item => {
    if (item.hiveMetadata) {
      const permlink = item.hiveMetadata.permlink;

      if (!groupedMedia.has(permlink)) {
        groupedMedia.set(permlink, []);
      }

      const group = groupedMedia.get(permlink);
      if (group && !processedUrls.has(item.src)) {
        processedUrls.add(item.src);
        group.push(item);
      }
    }
  });

  // Now we will process the markdown content only once per group
  groupedMedia.forEach((group, permlink) => {
    if (group.length > 0) {
      const mainItem = group[0];

      // Process the post's markdown content only once per group
      const extractedMedia = MarkdownRenderer.extractMediaFromHive({
        body: mainItem.hiveMetadata?.body || '',
        author: mainItem.hiveMetadata?.author || '',
        permlink: permlink,
        json_metadata: JSON.stringify({ image: [mainItem.src] })
      });

      // Add only raw media to the group
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
            hiveMetadata: mainItem.hiveMetadata
          });
        }
      });
    }
  });

  return groupedMedia;
}

// Constants for service URLs
const SKATEHIVE_URL = 'ipfs.skatehive.app/ipfs';
const PINATA_URL = 'lime-useful-snake-714.mypinata.cloud/ipfs';
const PEAKD_URL = 'files.peakd.com/file/peakd-hive';

// Modify MediaItem to work with media groups
const MediaItem = ({
  items,
  isExpanded,
  onExpand,
  onContentSizeChange,
  onTagClick
}: {
  items: Media[];
  isExpanded: boolean;
  onExpand: () => void;
  onContentSizeChange: (isLarge: boolean) => void;
  onTagClick: (tag: string) => void;
}) => {
  const mainItem = items[0];
  const [isHovered, setIsHovered] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isExpanded && mainItem.hiveMetadata?.body) {
      const imageCount = extractImagesFromMarkdown(mainItem.hiveMetadata.body).length;
      const textLength = mainItem.hiveMetadata.body.length;
      onContentSizeChange(imageCount > 3 || textLength > 1000);
    }
  }, [isExpanded, mainItem.hiveMetadata?.body, onContentSizeChange]);

  const formatPostContent = (content: string): string => {
    if (!content) return '';

    const formattedContent = content.replace(/!\[([^\]]*)\]\(([^)]+)\)\s*!\[/g, '![[$1]]($2)\n\n![');

    return formattedContent;
  };

  const renderMedia = (media: Media, isMainVideo: boolean = false) => {
    // If it's a Skatehive IPFS video
    if (media.src?.includes(SKATEHIVE_URL)) {
      return (
        <div
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="flex flex-col h-full"
        >
          <div className="flex-1 relative">
            <video
              src={media.src}
              className="absolute inset-0 w-full h-full object-cover transition-all duration-300 filter grayscale hover:grayscale-0"
              autoPlay={isHovered || (!isMainVideo && isExpanded)}
              loop={!isMainVideo}
              muted={!isMainVideo}
              controls={isMainVideo}
              playsInline
              style={{ backgroundColor: 'black' }}
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
              <div className="flex items-center gap-2 mt-2">
                {mainItem.tags?.slice(0, 2).map((tag, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation();
                      onTagClick(tag);
                    }}
                    className="text-sm text-gray-300 hover:text-white transition-colors cursor-pointer appearance-none bg-transparent border-0 p-0 font-normal"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      );
    }

    // If it's a picture of the Pinata
    if (media.src?.includes(PINATA_URL)) {
      return (
        <div className="flex flex-col h-full">
          <div className="flex-1 relative group">
            <Image
              src={media.src}
              alt={media.title || ''}
              fill
              className="object-cover transition-all duration-300 filter grayscale group-hover:grayscale-0"
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
              quality={85}
              unoptimized={true}
            />
          </div>
          {media.title && (
            <div className="bg-black flex flex-col justify-center px-4 py-3">
              <p className="text-white text-base font-medium">{media.title}</p>
              <div className="flex items-center gap-2 mt-2">
                {mainItem.tags?.slice(0, 2).map((tag, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation();
                      onTagClick(tag);
                    }}
                    className="text-sm text-gray-300 hover:text-white transition-colors cursor-pointer appearance-none bg-transparent border-0 p-0 font-normal"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className={clsx(
      'rounded-lg overflow-hidden transition-all duration-300 h-full',
      isExpanded
        ? 'w-full'
        : 'cursor-pointer hover:opacity-90'
    )}
      onClick={() => !isExpanded && onExpand()}
    >
      <div className={clsx(
        'w-full h-full transition-all duration-300',
        isExpanded ? 'flex flex-col h-[520px]' : ''
      )}>
        {!isExpanded && (
          <>
            <div className="flex flex-col h-full">
              {mainItem.hiveMetadata?.body ? (
                <>
                  {extractImagesFromMarkdown(mainItem.hiveMetadata.body)[0] ? (
                    <>
                      <div className="flex flex-col h-full">
                        <div className="flex-1 relative group">
                          <Image
                            src={extractImagesFromMarkdown(mainItem.hiveMetadata.body)[0]}
                            alt={mainItem.title || ''}
                            fill
                            className="object-cover transition-all duration-300 filter grayscale group-hover:grayscale-0"
                            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
                            quality={85}
                            unoptimized={true}
                          />
                        </div>
                        <div className="bg-black flex flex-col justify-center px-4 py-3">
                          <div className="text-white text-base font-medium line-clamp-1">
                            {mainItem.title}
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            {mainItem.tags?.slice(0, 2).map((tag, index) => (
                              <button
                                key={index}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onTagClick(tag);
                                }}
                                className="text-sm text-gray-300 hover:text-white transition-colors cursor-pointer appearance-none bg-transparent border-0 p-0 font-normal"
                              >
                                {tag}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    renderMedia(mainItem)
                  )}
                </>
              ) : (
                renderMedia(mainItem)
              )}
            </div>
          </>
        )}

        {isExpanded && (
          <div className="flex flex-col h-full overflow-hidden" ref={contentRef}>
            <div className="flex items-center px-4 py-3 sticky top-0 z-10">
              <h2 className="text-base font-medium truncate flex-1">{mainItem.title}</h2>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onExpand();
                }}
                className="ml-2 text-gray-400 hover:text-white rounded-full hover:bg-black/20 transition-colors p-1.5"
                aria-label="Close"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar overscroll-contain">
              {mainItem.hiveMetadata?.body && (
                <div className="prose prose-sm w-full p-0.5 max-w-full">
                  <div className="leading-tight markdown-content text-sm w-full break-words">
                    <ReactMarkdown
                      rehypePlugins={[rehypeRaw]}
                      components={{
                        img: ({ src, alt }) => {
                          const formattedSrc = formatPinataUrl(src || '');
                          return (
                            <div className="w-full overflow-hidden">
                              <Image
                                src={formattedSrc}
                                alt={alt || ''}
                                width={800}
                                height={600}
                                className="rounded w-full h-auto max-w-full"
                                unoptimized={true}
                              />
                            </div>
                          );
                        }
                      }}
                    >
                      {formatPostContent(mainItem.hiveMetadata.body.split('![')[0])}
                    </ReactMarkdown>

                    <div className="mt-1">
                      {extractImagesFromMarkdown(mainItem.hiveMetadata.body).length > 1 && (
                        <div className="flex items-center justify-between mb-2">
                          <div className="border-t border-gray-800 flex-grow"></div>
                        </div>
                      )}

                      {extractImagesFromMarkdown(mainItem.hiveMetadata.body).length > 0 && (
                        <Slider
                          dots={false}
                          infinite={true}
                          speed={500}
                          slidesToShow={1}
                          slidesToScroll={1}
                          className="carousel-container overflow-hidden"
                          adaptiveHeight={false}
                          responsive={[
                            {
                              breakpoint: 1024,
                              settings: {
                                slidesToShow: 1,
                                slidesToScroll: 1,
                                dots: false
                              }
                            },
                            {
                              breakpoint: 600,
                              settings: {
                                slidesToShow: 1,
                                slidesToScroll: 1,
                                dots: false
                              }
                            }
                          ]}
                        >
                          {extractImagesFromMarkdown(mainItem.hiveMetadata.body).map((imgSrc, index) => (
                            <div key={index}>
                              <div className="relative w-full h-[320px]">
                                <Image
                                  src={imgSrc}
                                  alt=""
                                  fill
                                  className="object-contain"
                                  unoptimized={true}
                                />
                              </div>
                            </div>
                          ))}
                        </Slider>
                      )}
                    </div>

                    <ReactMarkdown
                      rehypePlugins={[rehypeRaw]}
                      components={{
                        img: () => null
                      }}
                    >
                      {formatPostContent(mainItem.hiveMetadata.body.split('![').slice(-1)[0]?.split(')')[1] || '')}
                    </ReactMarkdown>
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

// Helper function to extract URLs from markdown images
function extractImagesFromMarkdown(markdown: string): string[] {
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
  const [expandedPermlink, setExpandedPermlink] = useState<string | null>(null);
  const [hasLargeContent, setHasLargeContent] = useState(false);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const groupedMedia = groupMediaByPermlink(media);

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
    setExpandedPermlink(null);
  };

  return (
    <div className="w-full">
      <div className={clsx(
        'max-w-[2000px] mx-auto px-8',
        header ? 'mb-5' : 'mb-2'
      )}>
        {header}
        {selectedTag && (
          <div className="mb-4 flex items-center gap-2">
            <span className="text-sm text-gray-400">Filtrando por:</span>
            <button
              onClick={() => handleTagClick(selectedTag)}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-800 text-white hover:bg-gray-700 transition-colors"
            >
              #{selectedTag}
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        <div className="grid gap-2 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 auto-rows-[290px]">
          {mediaGroups.map(({ permlink, group }, idx) => {
            const isExpanded = expandedPermlink === permlink;

            return (
              <div
                key={permlink}
                className={clsx(
                  'relative overflow-hidden rounded-lg transition-all duration-300 w-full',
                  isExpanded 
                    ? hasLargeContent 
                      ? 'col-span-2 row-span-4 sm:col-span-2 md:col-span-2 lg:col-span-2' 
                      : 'col-span-2 row-span-2 sm:col-span-2 md:col-span-2 lg:col-span-2'
                    : 'col-span-1'
                )}
              >
                <MediaItem
                  items={group}
                  isExpanded={isExpanded}
                  onExpand={() => {
                    if (expandedPermlink === permlink) {
                      setExpandedPermlink(null);
                      setHasLargeContent(false);
                    } else {
                      setExpandedPermlink(permlink);
                    }
                  }}
                  onContentSizeChange={setHasLargeContent}
                  onTagClick={handleTagClick}
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