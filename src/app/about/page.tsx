/* eslint-disable */
'use client';

import { getPostsByBlog, getUserAccount } from "@/../lib/hive/hive-client";
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { A11y, Navigation, Pagination, Scrollbar } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/scrollbar';

const TITLE_KEYWORDS = [
  'sobre mim',
  'about',
  'me',
  'sobre',
  'about me',
  'sobre wilbor',
  'wilbor',
  'biografia',
  'perfil',
  'artist',
  'artista'
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

function extractMediaFromPost(post: any) {
  const images: string[] = [];
  const videos: string[] = [];
  
  // Extrair da metadata JSON
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
    } catch {}
  }
  
  // Extrair do corpo do post
  if (post.body) {
    // Imagens do markdown
    const imgRegex = /!\[[^\]]*\]\(([^)]+)\)/g;
    let match;
    while ((match = imgRegex.exec(post.body))) {
      images.push(match[1]);
    }
    
    // Videos do HTML
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

function useDynamicAboutPost(username: string) {
  const [posts, setPosts] = useState<HivePost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    
    (async () => {
      try {
        console.log(`Buscando posts para o usuário: ${username}`);
        
        // Primeiro, verificar se o usuário existe
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
        
        // Filtrar posts que contenham palavras-chave no título
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
          // Se não encontrar posts específicos, mostrar os 5 mais recentes
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

export default function About() {
  const { posts: hivePosts, loading, error } = useDynamicAboutPost(process.env.NEXT_PUBLIC_HIVE_USERNAME || '');

  return (
    <div className="w-full min-h-screen">
      <div className="w-full flex flex-col items-start">
        <section className="w-full flex flex-col items-start">
          <div className="w-full max-w-4xl text-left mx-0 px-3 sm:px-8 space-y-4 sm:space-y-6">
            {/* Conteúdo 100% dinâmico dos posts do Hive */}
            {!loading && !error && hivePosts.length > 0 && (
              <div className="space-y-8">
                {hivePosts.map((post, index) => {
                  const media = extractMediaFromPost(post);
                  
                  return (
                    <article key={post.permlink} className="mb-12 p-6">
                      {/* <header className="mb-6">
                        <h2 className="text-xl sm:text-2xl font-bold mb-3 text-gray-900 dark:text-white">
                          {post.title}
                        </h2>
                      </header> */}
                      
                      <div className="space-y-6">
                        {/* Galeria de imagens com Swiper */}
                        {media.images.length > 0 && (
                          <div className="w-full">
                            {media.images.length === 1 ? (
                              <div className="relative w-full h-64 sm:h-96 rounded-lg overflow-hidden">
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
                                spaceBetween={20}
                                slidesPerView={1}
                                navigation
                                pagination={{ clickable: true }}
                                scrollbar={{ draggable: true }}
                                className="w-full h-64 sm:h-96 rounded-lg overflow-hidden"
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
                        
                        {/* Mostrar vídeos se houver */}
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
                        
                        <div className="prose prose-lg dark:prose-invert max-w-none">
                          <div 
                            className="text-gray-700 dark:text-gray-300 leading-relaxed text-base sm:text-lg"
                            dangerouslySetInnerHTML={{
                              __html: post.body
                                .replace(/!\[.*?\]\(.*?\)/g, '') // Remove markdown images
                                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
                                .replace(/\*(.*?)\*/g, '<em>$1</em>') // Italic
                                .replace(/\n\n/g, '</p><p>') // Paragraphs
                                .replace(/\n/g, '<br>') // Line breaks
                                .replace(/^/, '<p>') // Start with paragraph
                                .replace(/$/, '</p>') // End with paragraph
                            }}
                          />
                        </div>
                        
                      
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
          
          <div className="flex mt-8 mb-8 px-3 sm:px-8">
            <a
              href="/projects"
              className="group px-8 py-3 rounded-md text-lg font-medium transition-all flex items-center gap-2 bg-blue-500 text-white hover:bg-blue-600 shadow-md hover:shadow-lg"
            >
              Ver Meus projetos →
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}
