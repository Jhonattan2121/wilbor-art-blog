'use client';
import { getPostsByBlog, getUserAccount } from '@/../lib/hive/hive-client';
import Markdown from '@/components/Markdown';
import { useEffect, useState } from 'react';
import ViewSwitcher from '../../src/app/ViewSwitcher';
import React from 'react';

const CONTACT_KEYWORDS = [
  'contato',
  'contact',
  'fale conosco',
  'get in touch',
  'email',
  'telefone',
];

export const dynamic = 'force-static';
export const maxDuration = 60;

interface HivePost {
  title: string;
  body: string;
  author: string;
  permlink: string;
  created: string;
  json_metadata: string;
  url: string;
}

function useDynamicContactPost(username: string) {
  const [post, setPost] = useState<HivePost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    setLoading(true);
    setError(null);
    (async () => {
      try {
        const userAccount = await getUserAccount(username);
        if (!userAccount) {
          setError(`Usuário '${username}' não encontrado no Hive.`);
          setLoading(false);
          return;
        }
        const allPosts = await getPostsByBlog(username);
        const matchingPost = allPosts.find((post: any) =>
          post.title && CONTACT_KEYWORDS.some(keyword =>
            post.title.toLowerCase().includes(keyword.toLowerCase()),
          ),
        );
        if (matchingPost) {
          setPost(matchingPost);
        } else {
          setError('Nenhum post de contato encontrado.');
        }
      } catch {
        setError('Erro ao buscar post de contato.');
      }
      setLoading(false);
    })();
  }, [username]);
  return { post, loading, error };
}

export default function ContactPage() {
  const { post, loading, error } = useDynamicContactPost(process.env.NEXT_PUBLIC_HIVE_USERNAME || '');

  // Função para inserir <br> entre links, se estiverem juntos
  function formatContactBody(body: string) {
    // Regex para links Markdown: [texto](url)
    return body.replace(/\]\([^)]*\)\s+/g, "]($1)<br>").replace(/<br>\s*/g, '<br>');
  }

  return (
    <>
      <React.Suspense fallback={null}>
        <ViewSwitcher currentSelection="contact" />
      </React.Suspense>
      <div className="w-full px-4 sm:px-8 pt-2 md:px-12 py-8 dark:text-gray-200 text-left">
        <div className="max-w-4xl w-full text-left space-y-2 sm:space-y-3 mx-0">
          {!loading && !error && post && (
            <article className="mb-6 p-3">
              <Markdown className="markdown-contact" columns>{formatContactBody(post.body)}</Markdown>
            </article>
          )}
          {loading && <div>Carregando...</div>}
          {error && <div className="text-red-500">{error}</div>}
        </div>
      </div>
    </>
  );
}
