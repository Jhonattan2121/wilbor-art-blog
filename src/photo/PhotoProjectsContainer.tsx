'use client';

import HivePostModal from '@/components/HivePostModal';
import SiteGrid from '@/components/SiteGrid';
import { MarkdownRenderer } from '@/lib/markdown/MarkdownRenderer';
import '@/styles/slider-custom.css';
import { clsx } from 'clsx/lite';
import Image from 'next/image';
import { useEffect, useState } from 'react';
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
        json_metadata: mainItem.hiveMetadata?.json_metadata || JSON.stringify({ image: [mainItem.src] })
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
            hiveMetadata: mainItem.hiveMetadata ? {
              author: mainItem.hiveMetadata.author,
              permlink: mainItem.hiveMetadata.permlink,
              body: mainItem.hiveMetadata.body,
              json_metadata: mainItem.hiveMetadata.json_metadata
            } : undefined
          });
        }
      });
    }
  });

  return groupedMedia;
}

// Function to get thumbnail URL from metadata or first image in content
function getThumbnailUrl(item: Media): string | null {
  try {
    console.log("Trying to get thumbnail for post:", item.title);
    
    if (item.hiveMetadata?.json_metadata) {
      console.log("JSON Metadata available, parsing...");
      
      try {
        const metadata = JSON.parse(item.hiveMetadata.json_metadata);
        console.log("Parsed metadata:", metadata);
        
        if (metadata.image && metadata.image.length > 0) {
          console.log("Found thumbnail in metadata:", metadata.image[0]);
          return metadata.image[0]; 
        } else {
          console.log("No image field found in metadata or it's empty");
        }
      } catch (parseError) {
        console.error("Error parsing JSON metadata:", parseError);
      }
    } else {
      console.log("No JSON metadata available for this post");
    }
    
    const images = extractImagesFromMarkdown(item.hiveMetadata?.body || '');
    console.log("Images found in markdown:", images.length > 0 ? images : "None");
    
    if (images.length > 0) {
      console.log("Using first image from post content:", images[0]);
      return images[0];
    }
    
    console.log("No suitable thumbnail found, using src:", item.src);
    return item.src;
  } catch (e) {
    console.error('Error getting thumbnail:', e);
    return item.src;
  }
}

// Constants for service URLs
const SKATEHIVE_URL = 'ipfs.skatehive.app/ipfs';
const PINATA_URL = 'lime-useful-snake-714.mypinata.cloud/ipfs';
const PEAKD_URL = 'files.peakd.com/file/peakd-hive';

// Debug function to fetch a specific post from Hive
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
      console.log("Post data fetched directly from Hive:", data.result);
      console.log("JSON Metadata:", data.result.json_metadata);
      return data.result;
    }
    return null;
  } catch (error) {
    console.error("Error fetching post data:", error);
    return null;
  }
}

// Modify MediaItem to work with media groups
const MediaItem = ({
  items,
  isExpanded,
  onExpand,
  onOpenModal
}: {
  items: Media[];
  isExpanded: boolean;
  onExpand: () => void;
  onOpenModal: () => void;
}) => {
  const mainItem = items[0];
  const [isCarousel, setIsCarousel] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const loggedUser = typeof window !== 'undefined' ? localStorage.getItem('hive_username') : null;
  const isAuthor = loggedUser && mainItem.hiveMetadata?.author === loggedUser;
  
  const thumbnailUrl = getThumbnailUrl(mainItem);

  const [updatedThumbnail, setUpdatedThumbnail] = useState<string | null>(thumbnailUrl);

  useEffect(() => {
    if (mainItem.hiveMetadata) {
      const { author, permlink } = mainItem.hiveMetadata;
      fetchPostFromHive(author, permlink).then(post => {
        if (post) {
          try {
            const metadata = JSON.parse(post.json_metadata);
            if (metadata.image && metadata.image.length > 0) {
              console.log("Thumbnail atualizada da API:", metadata.image[0]);
              setUpdatedThumbnail(metadata.image[0]);
            }
          } catch (e) {
            console.error("Erro ao analisar o JSON metadata:", e);
          }
        }
      });
    }
  }, [mainItem.hiveMetadata]);

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
   
    onOpenModal();
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.hive_keychain || !mainItem.hiveMetadata) return;

    const operations = [
      ["delete_comment", {
        author: mainItem.hiveMetadata.author,
        permlink: mainItem.hiveMetadata.permlink
      }]
    ];

    window.hive_keychain.requestBroadcast(
      mainItem.hiveMetadata.author,
      operations,
      'posting',
      (response: any) => {
        if (response.success) {
          alert('Post deleted successfully!');
          window.location.reload();
        } else {
          alert('Error deleting post: ' + response.message);
        }
      }
    );
  };

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
              {updatedThumbnail ? (
                <>
                  <Image
                    src={updatedThumbnail}
                    alt={mainItem.title || ''}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
                    quality={85}
                    unoptimized={true}
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                    <p className="text-white text-sm line-clamp-2">{mainItem.title}</p>
                  </div>
                </>
              ) : (
                renderMedia(mainItem)
              )}
            </div>
          </>
        )}

        {isExpanded && (
          <div className="sm:p-6 p-4">
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-2xl font-bold text-white">{mainItem.title}</h2>
              <div className="flex items-center gap-2">
                {isAuthor && (
                  <>
                    <button
                      onClick={handleEdit}
                      className="text-white bg-blue-600 rounded-full p-2 hover:bg-blue-700 transition-colors"
                      title="Edit post"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={handleDelete}
                      className="text-white bg-red-600 rounded-full p-2 hover:bg-red-700 transition-colors"
                      title="Delete post"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </>
                )}
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
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [postData, setPostData] = useState(media);
  const [refreshKey, setRefreshKey] = useState(0);
  const groupedMedia = groupMediaByPermlink(postData);

  const [isFirstRender, setIsFirstRender] = useState(true);

  useEffect(() => {
    if (isFirstRender) {
      setIsFirstRender(false);
      
      if (media.length > 0) {
        const updatedPosts: Media[] = [...media];
        let updatedCount = 0;
        
        media.forEach((item, index) => {
          if (item.hiveMetadata) {
            const { author, permlink } = item.hiveMetadata;
            
            fetchPostFromHive(author, permlink).then(post => {
              if (post && item.hiveMetadata) {
                updatedPosts[index] = {
                  ...item,
                  hiveMetadata: {
                    author: item.hiveMetadata.author,
                    permlink: item.hiveMetadata.permlink,
                    body: post.body,
                    json_metadata: post.json_metadata
                  }
                };
                
                updatedCount++;
                
                if (updatedCount === media.length) {
                  console.log("Todos os posts foram atualizados com dados frescos da API");
                  setPostData(updatedPosts);
                  setRefreshKey(prev => prev + 1);
                }
              }
            });
          }
        });
      }
    }
  }, [isFirstRender, media]);

  useEffect(() => {
    setPostData(media);
  }, [media]);

  const mediaGroups = Array.from(groupedMedia.entries())
    .filter(([_, group]) => group.length > 0)
    .map(([permlink, group]) => ({
      permlink,
      group,
      mainItem: group[0]
    }));

  const handleCloseModal = () => {
    setIsPostModalOpen(false);
    setExpandedPermlink(null);
    
    setRefreshKey(prevKey => prevKey + 1);
    
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  return (
    <>
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
                  key={`${permlink}-${refreshKey}`}
                  items={group}
                  isExpanded={expandedPermlink === permlink}
                  onExpand={() => {
                    setExpandedPermlink(expandedPermlink === permlink ? null : permlink);
                  }}
                  onOpenModal={() => {
                    setExpandedPermlink(permlink);
                    setIsPostModalOpen(true);
                  }}
                />
              ))}
            </div>
          </div>
        }
        contentSide={sidebar}
        sideHiddenOnMobile
      />

      {/* Modal Portal */}
      {isPostModalOpen && expandedPermlink && (
        <div className="fixed inset-0 z-[9999]">
          {mediaGroups.map(({ permlink, group }) => {
            const mainItem = group[0];
            if (mainItem.hiveMetadata && permlink === expandedPermlink) {
              return (
                <HivePostModal
                  key={`modal-${permlink}-${refreshKey}`}
                  isOpen={true}
                  onClose={handleCloseModal}
                  editPost={{
                    author: mainItem.hiveMetadata.author,
                    permlink: mainItem.hiveMetadata.permlink,
                    title: mainItem.title || '',
                    body: mainItem.hiveMetadata.body,
                    json_metadata: mainItem.hiveMetadata.json_metadata || JSON.stringify({ tags: [], app: 'wilbor-art-blog' })
                  }}
                />
              );
            }
            return null;
          })}
        </div>
      )}
    </>
  );
}