'use client';

import SiteGrid from '@/components/SiteGrid';
import { MarkdownRenderer } from '@/lib/markdown/MarkdownRenderer';
import '@/styles/slider-custom.css';
import { clsx } from 'clsx/lite';
import Image from 'next/image';
import { JSX, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick-theme.css';
import 'slick-carousel/slick/slick.css';

interface HiveMetadata {
  author: string;
  permlink: string;
  body: string;
}

export interface Photo {
  cameraKey?: string;
  camera?: any;
  simulation?: any;
  id: string;
  url: string;
  src: string;
  title: string;
  type: 'photo' | 'video' | 'iframe';
  thumbnailSrc?: string;
  videoUrl?: string;
  width: number;
  height: number;
  blurData: string;
  tags: string[];
  takenAt: Date;
  takenAtNaive: string;
  takenAtNaiveFormatted: string;
  updatedAt: Date;
  createdAt: Date;
  aspectRatio: number;
  priority: boolean;
  extension: string;
  focalLengthFormatted?: string;
  focalLengthIn35MmFormatFormatted?: string;
  fNumberFormatted?: string;
  isoFormatted?: string;
  exposureTimeFormatted?: string;
  exposureCompensationFormatted?: string;
  hiveMetadata?: HiveMetadata;
  author?: string;
  permlink?: string;
  iframeHtml?: string;
}

interface Media {
  id: string;
  url: string;
  src: string;
  title: string;
  type: 'photo' | 'video' | 'iframe';
  thumbnailSrc?: string;
  width?: number;
  videoUrl?: string;
  height?: number;
  iframeHtml?: string;
  tags?: string[];
  // Adicionando hiveMetadata
  hiveMetadata?: {
    author: string;
    permlink: string;
    body: string;
  };
}

interface PhotoGridContainerProps {
  cacheKey: string;
  media: Media[];
  sidebar?: JSX.Element;
  canSelect?: boolean;
  header?: JSX.Element;
  animateOnFirstLoadOnly?: boolean;
}

// Modify the formatPostContent function to also remove PEAKD links
const formatPostContent = (content: string): string => {
  if (!content) return '';

  let text = content;

  // Remove iframes and their content
  text = text.replace(/<iframe[\s\S]*?<\/iframe>/g, '');

  // Remove broken images in markdown format
  text = text.replace(/!\[.*?\]\(\s*!\[.*?\]\(.*?\)\s*\)/g, '');

  // Remove images in markdown format
  text = text.replace(/!\[.*?\]\(.*?\)/g, '');

  // Remove IPFS links
  text = text.replace(/https:\/\/ipfs\.skatehive\.app\/ipfs\/[^\s]*/g, '');

  // Remove URLs from Pinata
  text = text.replace(/https:\/\/lime-useful-snake[^\s]*/g, '');

  // Remove URLs from PEAKD
  text = text.replace(/https:\/\/files\.peakd\.com\/file\/peakd-hive[^\s]*/g, '');

  // Format emojis and section titles
  const sections = text.split('\n').map(line => {
    // Remove lines that contain only empty brackets or parentheses
    if (/^\s*[\[\]()]+\s*$/.test(line)) return '';

    // Add space after emojis for better readability
    line = line.replace(/([\u{1F300}-\u{1F9FF}])/gu, '$1 ');

    // Format Instagram links while keeping the emoji
    line = line.replace(/([\u{1F300}-\u{1F9FF}])\s*@(\w+)/gu, '$1 [@$2](https://instagram.com/$2)');

    return line;
  });

  // Join the lines back together, removing extra empty lines
  text = sections
    .filter(line => line.trim().length > 0)
    .join('\n');

  // Remove extra whitespace and residual characters
  text = text
    .replace(/\n\s*\n/g, '\n\n')
    .replace(/\[\s*\]/g, '') // Remove empty brackets
    .replace(/\(\s*\)/g, '') // Remove empty parentheses
    .trim();

  return text;
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

  // Separar vídeos e fotos baseado na URL do serviço

  const videos = items.filter(item => item.src?.includes(SKATEHIVE_URL));
  const photos = items.filter(item =>
    item.src?.includes(PINATA_URL) ||
    item.src?.includes(PEAKD_URL)
  );

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
              <p className="text-white text-sm">{media.title}</p>
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
              <p className="text-white text-sm">{media.title}</p>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <article
      className={clsx(
        'rounded-lg overflow-hidden transition-all duration-300',
        isExpanded
          ? 'col-span-full'
          : 'cursor-pointer hover:opacity-90'
      )}
      onClick={() => !isExpanded && onExpand()}
    >
      <div className={clsx(
        'w-full transition-all duration-300',
        isExpanded ? 'max-w-6xl mx-auto' : ''
      )}>
        {!isExpanded && (
          <>
            <div className="relative w-full h-0 pb-[100%]">
              {renderMedia(mainItem)}
            </div>

          </>
        )}

        {isExpanded && (
          <div className="p-6">
            <div className="flex items-start justify-between mb-6">
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

            {videos.length > 0 && (
              <div className="mb-8">
                <div className="relative aspect-video rounded-lg overflow-hidden">
                  {renderMedia(videos[0], true)}
                </div>
                {videos[0].title && (
                  <h3 className="text-white text-lg mt-2">{videos[0].title}</h3>
                )}
              </div>
            )}

            {mainItem.hiveMetadata?.body && (
              <div className="prose prose-invert prose-lg max-w-none mb-8">
                <div className=" leading-relaxed markdown-content space-y-4">
                  <ReactMarkdown
                    components={{
                      p: ({ children }) => (
                        <p className="mb-4 last:mb-0">{children}</p>
                      ),
                      a: ({ children, href }) => (
                        <a
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300"
                        >
                          {children}
                        </a>
                      )
                    }}
                  >
                    {formatPostContent(mainItem.hiveMetadata.body)}
                  </ReactMarkdown>
                </div>
              </div>
            )}

            {photos.length > 0 && (
              <div className="mt-8">
                <div className="relative ">
                  <Slider
                    dots={true}
                    dotsClass="slick-dots"
                    infinite={true}
                    speed={500}
                    slidesToShow={3}
                    slidesToScroll={1}
                    autoplay={true}
                    autoplaySpeed={3000}
                    pauseOnHover={true}
                    responsive={[
                      {
                        breakpoint: 1024,
                        settings: {
                          slidesToShow: 2,
                          slidesToScroll: 1,
                        }
                      },
                      {
                        breakpoint: 600,
                        settings: {
                          slidesToShow: 1,
                          slidesToScroll: 1
                        }
                      }
                    ]}

                  >
                    {photos.map((photo, index) => (
                      <div key={photo.id || index} className="px-2">
                        <div className="relative aspect-square rounded-lg overflow-hidden">
                          <Image
                            src={photo.src}
                            alt={photo.title || ''}
                            fill
                            className="object-cover"
                            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
                            quality={50}
                            unoptimized={true}
                            onError={(e) => {
                              console.error('Erro ao carregar imagem:', photo.src);
                            }}
                          />

                        </div>
                      </div>
                    ))}
                  </Slider>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </article>
  );
};

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
          'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
          header && 'space-y-8 mt-1.5'
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