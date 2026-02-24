'use client';

import { getPostsByBlog, getUserAccount } from "@/../lib/hive/hive-client";
import Markdown from "@/components/Markdown";
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { A11y, Navigation, Pagination, Scrollbar } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

import 'swiper/css';
import 'swiper/css/pagination';

const TITLE_KEYWORDS = [
  'exposições',
  'exhibitions',
  'exibições',
];

interface HivePost {
  title: string;
  body: string;
  author: string;
  permlink: string;
  created: string;
  json_metadata: string;
  url: string;
}

function normalizeExhibitionSpacing(body: string): string {
  const normalized = body
    .replace(/\r\n/g, '\n')
    .replace(/\\<br\s*\/?>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n');

  const lines = normalized.split('\n').map((line) => line.trim());
  const dateLike = /^(?:#{1,6}\s*)?(\d{2}\/\d{2}\/\d{4}|\d{1,2}\/\d{4}|\d{4}(?:\s*[–-]\s*\d{4})?)\s*$/;
  const blocks: string[] = [];
  let currentBlock: string[] = [];

  const flushBlock = () => {
    if (currentBlock.length === 0) return;
    blocks.push(currentBlock.join('  \n').trim());
    currentBlock = [];
  };

  for (const line of lines) {
    if (!line) {
      flushBlock();
      continue;
    }

    const dateMatch = line.match(dateLike);
    if (dateMatch) {
      flushBlock();
      currentBlock.push(`<span class="exhibition-date">${dateMatch[1]}</span>`);
      continue;
    }

    currentBlock.push(line);
  }
  flushBlock();

  return blocks.join('\n\n').trim();
}

function extractMediaFromPost(post: any) {
  const images: string[] = [];
  const videos: string[] = [];

  if (post.json_metadata) {
    let meta;
    try {
      meta = typeof post.json_metadata === 'string' ? JSON.parse(post.json_metadata) : post.json_metadata;
      if (meta && Array.isArray(meta.image)) {
        images.push(...meta.image);
      }
      if (meta && Array.isArray(meta.video)) {
        videos.push(...meta.video);
      }
    } catch { }
  }

  if (post.body) {
    const imgRegex = /!\[[^\]]*\]\(([^)]+)\)/g;
    let match;
    while ((match = imgRegex.exec(post.body))) {
      images.push(match[1]);
    }

    const videoRegex = /<video[^>]*src=["']([^"'>\s]+)["'][^>]*>/g;
    while ((match = videoRegex.exec(post.body))) {
      videos.push(match[1]);
    }
  }

  return {
    images: Array.from(new Set(images)),
    videos: Array.from(new Set(videos))
  };
}

function useDynamicExhibitionsPost(username: string) {
  const [posts, setPosts] = useState<HivePost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    (async () => {
      try {
        console.log(`Buscando posts de exposições para o usuário: ${username}`);

        const userAccount = await getUserAccount(username);
        if (!userAccount) {
          setError(`Usuário '${username}' não encontrado no Hive.`);
          setLoading(false);
          return;
        }

        console.log(`Usuário ${username} encontrado, buscando posts...`);
        const allPosts = await getPostsByBlog(username);
        console.log(`Total de posts encontrados: ${allPosts.length}`);
        console.log('Títulos dos posts:', allPosts.map((p: any) => p.title));

        const matchingPosts = allPosts.filter((post: any) =>
          post.title && TITLE_KEYWORDS.some(keyword =>
            post.title.toLowerCase().includes(keyword.toLowerCase())
          )
        );

        console.log(`Posts filtrados: ${matchingPosts.length}`);
        console.log('Títulos filtrados:', matchingPosts.map((p: any) => p.title));

        if (matchingPosts.length > 0) {
          setPosts(matchingPosts);
        } else {
          console.log('Nenhum post específico encontrado, mostrando posts recentes');
          setPosts(allPosts.slice(0, 5));
        }
      } catch (err) {
        console.error('Erro ao buscar posts:', err);
        setError('Erro ao buscar posts do usuário.');
      }
      setLoading(false);
    })();
  }, [username]);

  return { posts, loading, error };
}

export default function ExhibitionsContent() {
  const { posts: hivePosts, loading, error } = useDynamicExhibitionsPost(process.env.NEXT_PUBLIC_HIVE_USERNAME || '');

  if (loading || error || hivePosts.length === 0) {
    return null;
  }

  return (
    <div className="w-full px-2 sm:px-8 pt-2 md:px-12 py-6 sm:py-8 dark:text-gray-200 text-left">
      <div className="max-w-full sm:max-w-4xl w-full text-left space-y-4 sm:space-y-3 mx-0">
        <div className="space-y-3">
          {hivePosts.map((post, index) => {
            const media = extractMediaFromPost(post);
            return (
              <article key={post.permlink} className="mb-4 sm:mb-6 p-2 sm:p-3">
                <div className="space-y-1 sm:space-y-0">
                  {media.images.length > 0 && (
                    <div className="w-full mb-2">
                      {media.images.length === 1 ? (
                        <div className="relative w-full h-48 sm:h-60 md:h-80 rounded-lg overflow-hidden">
                          <Image
                            src={media.images[0]}
                            alt={`Imagem do post: ${post.title}`}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, 100vw"
                            unoptimized
                          />
                        </div>
                      ) : (
                        <Swiper
                          modules={[Navigation, Pagination, Scrollbar, A11y]}
                          spaceBetween={6}
                          slidesPerView={1}
                          navigation
                          pagination={{ clickable: true }}
                          scrollbar={{ draggable: true }}
                          className="w-full h-48 sm:h-60 md:h-80 rounded-lg overflow-hidden"
                        >
                          {media.images.map((img, imgIndex) => (
                            <SwiperSlide key={imgIndex}>
                              <div className="relative w-full h-full">
                                <Image
                                  src={img}
                                  alt={`Imagem ${imgIndex + 1} do post: ${post.title}`}
                                  fill
                                  className="object-cover"
                                  sizes="(max-width: 768px) 100vw, 100vw"
                                  unoptimized
                                />
                              </div>
                            </SwiperSlide>
                          ))}
                        </Swiper>
                      )}
                    </div>
                  )}
                  {media.videos.length > 0 && (
                    <div className="grid grid-cols-1 gap-4">
                      {media.videos.map((video, videoIndex) => (
                        <div key={videoIndex} className="relative w-full">
                          <video
                            src={video}
                            controls
                            className="w-full rounded-lg"
                            style={{ maxHeight: '400px' }}
                          >
                            Seu navegador não suporta o elemento de vídeo.
                          </video>
                        </div>
                      ))}
                    </div>
                  )}
                  <Markdown className="exhibition-content" removeMedia>
                    {normalizeExhibitionSpacing(post.body)}
                  </Markdown>
                  {index < hivePosts.length - 1 && (
                    <hr className="border-t border-gray-200 dark:border-gray-700 my-4" />
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}
