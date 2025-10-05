/* eslint-disable */
'use client';

import { getPostsByBlog, getUserAccount } from "@/../lib/hive/hive-client";
import Markdown from '@/components/Markdown';
import { useEffect, useState } from 'react';

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

export default function About() {
  const { posts: hivePosts, loading, error } = useDynamicAboutPost(
    process.env.NEXT_PUBLIC_HIVE_USERNAME || ''
  );

  return (
    <div className="w-full min-h-screen">
      <div className="w-full flex flex-col items-start">
        <section className="w-full flex flex-col items-start">
          <div className="w-full text-left mx-0 px-0 sm:px-8 lg:max-w-4xl space-y-4 sm:space-y-6">
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
                        <Markdown images={media.images.map((img, imgIndex) => ({ src: img, alt: `Imagem ${imgIndex + 1} do post: ${post.title}` }))}>
                          {post.body}
                        </Markdown>
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
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
          <div className="flex mt-8 mb-8 px-3 sm:px-8">
            <a href="/projects">Ver Meus projetos →</a>
          </div>
        </section>
      </div>
    </div>
  );
}
