'use client';

import SiteGrid from '@/components/SiteGrid';
import { MarkdownRenderer } from '@/lib/markdown/MarkdownRenderer';
import '@/styles/slider-custom.css';
import { clsx } from 'clsx/lite';
import Image from 'next/image';
import { useState } from 'react';
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
  onExpand
}: {
  items: Media[];
  isExpanded: boolean;
  onExpand: () => void;
}) => {
  const mainItem = items[0];
  const [isCarousel, setIsCarousel] = useState(false);

  const formatPostContent = (content: string): string => {
    if (!content) return '';

    const formattedContent = content.replace(/!\[([^\]]*)\]\(([^)]+)\)\s*!\[/g, '![[$1]]($2)\n\n![');

    return formattedContent;
  };

  const renderMedia = (media: Media, isMainVideo: boolean = false) => {


    if (media.src?.includes(PINATA_URL) || media.src?.includes(PEAKD_URL)) {
      return (
        <div className="group relative">
          <Image
            src={media.src}
            alt={media.title || ''}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
            quality={85}
            unoptimized={true}
          />
          {media.title && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
              <p className=" text-sm">{media.title}</p>
            </div>
          )}
        </div>
      );
    }
    // If it's a Skatehive IPFS video
    if (media.src?.includes(SKATEHIVE_URL)) {
      return (
        <div>
          <video
            src={media.src}
            className="absolute inset-0 w-full h-full object-cover"
            autoPlay={!isMainVideo}
            loop={!isMainVideo}
            muted={!isMainVideo}
            controls={isMainVideo}
            playsInline
            style={{ backgroundColor: 'black' }}
          />
          {!isMainVideo && media.title && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
              <p className="text-white text-sm">{media.title}</p>
            </div>
          )}
        </div>
      );
    }

    // If it's a picture of the Pinata
    if (media.src?.includes(PINATA_URL)) {
      return (
        <div className="group relative">
          <Image
            src={media.src}
            alt={media.title || ''}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
            quality={85}
            unoptimized={true}
          />
          {media.title && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
              <p className=" text-sm">{media.title}</p>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className={clsx(
      'rounded-lg overflow-hidden transition-all duration-300',
      isExpanded
        ? 'col-span-full w-full mx-auto sm:px-4 px-0'
        : 'cursor-pointer hover:opacity-90'
    )}
      onClick={() => !isExpanded && onExpand()}
    >
      <div className={clsx(
        'w-full transition-all duration-300',
        isExpanded ? 'sm:max-w-2xl mx-auto' : ''
      )}>
        {!isExpanded && (
          <>
            <div className="relative w-full h-0 pb-[100%]">
              {renderMedia(mainItem)}
            </div>
          </>
        )}

        {isExpanded && (
          <div className="sm:p-6 p-4">
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-2xl font-bold text-white">{mainItem.title}</h2>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onExpand();
                }}
                className="text-white bg-black/30 rounded-full p-2 hover:bg-black/50 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {mainItem.hiveMetadata?.body && (
              <div className="prose prose-invert prose-lg max-w-none mb-8">
                <div className="leading-relaxed markdown-content space-y-4">
                  <ReactMarkdown
                    rehypePlugins={[rehypeRaw]}
                    components={{
                      img: ({ src, alt }) => {
                        const formattedSrc = formatPinataUrl(src || '');
                        return (
                          <Image
                            src={formattedSrc}
                            alt={alt || ''}
                            width={800}
                            height={600}
                            className="rounded-lg w-full h-auto"
                            unoptimized={true}
                          />
                        );
                      }
                    }}
                  >

                    {formatPostContent(mainItem.hiveMetadata.body.split('![')[0])}
                  </ReactMarkdown>

                  <div className="mt-4">
                    {extractImagesFromMarkdown(mainItem.hiveMetadata.body).length > 1 && (
                      <div className="flex items-center justify-between mb-6">
                        <div className="border-t border-gray-800 flex-grow"></div>
                        <button
                          onClick={() => setIsCarousel(!isCarousel)}
                          className="ml-4 px-3 py-1 text-sm rounded-full bg-gray-800 dark:bg-gray-700 text-gray-100 hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
                        >
                          {isCarousel ? 'Modo Vertical' : 'Modo Carrossel'}
                        </button>
                      </div>
                    )}

                    {extractImagesFromMarkdown(mainItem.hiveMetadata.body).length > 0 && (
                      isCarousel ? (
                        <Slider
                          dots={true}
                          dotsClass="slick-dots"
                          infinite={true}
                          speed={500}
                          slidesToShow={1}
                          slidesToScroll={1}
                          className="carousel-container"
                          adaptiveHeight={true}
                          responsive={[
                            {
                              breakpoint: 1024,
                              settings: {
                                slidesToShow: 2,
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
                            <div key={index} className="px-2">
                              <div className="relative w-full" style={{ minHeight: '300px' }}>
                                <Image
                                  src={imgSrc}
                                  alt=""
                                  layout="responsive"
                                  width={16}
                                  height={9}
                                  className="object-contain"
                                  unoptimized={true}
                                  style={{
                                    maxHeight: '80vh',
                                    margin: '0 auto'
                                  }}
                                />
                              </div>
                            </div>
                          ))}
                        </Slider>
                      ) : (
                        <div className="space-y-4">
                          {extractImagesFromMarkdown(mainItem.hiveMetadata.body).map((imgSrc, index) => (
                            <div key={index} className="my-4">
                              <div className="relative w-full">
                                <Image
                                  src={imgSrc}
                                  alt=""
                                  width={0}
                                  height={0}
                                   sizes="(max-width: 640px) 100vw, 50vw"
                                  className="w-full h-auto object-contain"
                                  unoptimized={true}
                                  style={{
                                    maxHeight: '80vh',
                                    margin: '0 auto'
                                  }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      )
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
  const groupedMedia = groupMediaByPermlink(media);

  const mediaGroups = Array.from(groupedMedia.entries())
    .filter(([_, group]) => group.length > 0)
    .map(([permlink, group]) => ({
      permlink,
      group,
      mainItem: group[0]
    }));

  return (
    <SiteGrid
      contentMain={
        <div className={clsx(
          'max-w-5xl mx-auto',
          header ? 'mb-8' : 'mb-4'
        )}>
          {header}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
            {mediaGroups.map(({ permlink, group }) => (
              <MediaItem
                key={permlink}
                items={group}
                isExpanded={expandedPermlink === permlink}
                onExpand={() => {
                  setExpandedPermlink(expandedPermlink === permlink ? null : permlink);
                }}
              />
            ))}
          </div>
        </div>
      }
      contentSide={sidebar}
      sideHiddenOnMobile
    />
  );
}