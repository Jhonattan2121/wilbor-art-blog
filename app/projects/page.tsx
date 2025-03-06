import { Cameras } from '@/camera';
import { getPostsByAuthor } from '@/lib/hive/hive-client';
import { MarkdownRenderer } from '@/lib/markdown/MarkdownRenderer';
import { Photo } from '@/photo/PhotoGridContainer';
import PhotoGridPage from '@/photo/PhotoGridPage';
import PhotosEmptyState from '@/photo/PhotosEmptyState';
import { FilmSimulations } from '@/simulation';
import { Tags } from '@/tag';
import { Discussion } from '@hiveio/dhive';
import { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
export const dynamic = 'force-dynamic';

const extractIpfsHash = (url: string) => {

  if (url.includes('ipfs.skatehive.app/ipfs/')) {
    const ipfsMatch = url.match(/ipfs\.skatehive\.app\/ipfs\/([A-Za-z0-9]+)/);
    if (ipfsMatch) {
      return ipfsMatch[1];
    }
  }

  if (url.includes('hackmd.io/_uploads/')) {
    const hackmdMatch = url.match(/hackmd\.io\/_uploads\/([A-Za-z0-9-_]+)/);
    if (hackmdMatch) {
      return hackmdMatch[1];
    }
  }

  if (url.includes('.blob.vercel-storage.com/')) {
    const blobMatch = url.match(/([A-Za-z0-9-_]+)\.(jpg|jpeg|png|gif|webp)/i);
    if (blobMatch) {
      return blobMatch[1];
    }
  }

  if (url.includes('files.peakd.com/')) {
    const peakdMatch = url.match(/([A-Za-z0-9]+)\.(jpg|jpeg|png|gif|webp)/i);
    if (peakdMatch) {
      return peakdMatch[1];
    }
  }

  const genericMatch = url.match(/\/([A-Za-z0-9-_]+)\.(jpg|jpeg|png|gif|webp)$/i);
  if (genericMatch) {
    return genericMatch[1];
  }

  return url.split('/').pop()?.split('.')[0] || '';
};

const getMediaType = (url: string, mediaType?: string) => {
  if (url.includes('3speak.tv/embed')) {
    return 'iframe';
  }

  if (url.includes('3speak.tv/embed') || url.includes('3speak.tv/watch')) {
    return 'iframe';
  }

  if (url.includes('ipfs.skatehive.app/ipfs/')) {
    return 'iframe';
  }
  const isVideo = url.toLowerCase().match(/\.(mp4|webm|ogg|mov|m4v)$/) ||
    url.includes('type=video') ||
    mediaType === 'video' ||
    url.includes('skatehype.com/ifplay.php') ||
    url.includes('3speak.tv/watch') || 
    url.includes('3speak.tv/embed');   

  if (isVideo) return 'video';

  if (url.includes('hackmd.io/_uploads/')) return 'photo';

  if (url.toLowerCase().match(/\.(jpg|jpeg|png|gif|webp)$/)) return 'photo';

  if (url.includes('ipfs.skatehive.app/ipfs/') ||
    url.includes('.blob.vercel-storage.com/') ||
    url.includes('files.peakd.com/')) {
    return 'photo';
  }

  return 'photo';
};

async function getHivePosts(username: string) {
  try {
    const posts = await getPostsByAuthor(username);

    const formattedPosts = posts.flatMap(post => {
      const mediaItems = MarkdownRenderer.extractMediaFromHive(post);

      return mediaItems.map((media) => {
        let postTags: string[] = [];
        try {
          const metadata = JSON.parse(post.json_metadata || '{}');
          postTags = metadata.tags || [];
          if (post.category && !postTags.includes(post.category)) {
            postTags.unshift(post.category);
          }
        } catch (e) {
          console.warn('Error parsing post tags:', e);
          postTags = post.category ? [post.category] : [];
        }

        const type = getMediaType(media.url);

        return {
          id: `${post.author}/${post.permlink}/${extractIpfsHash(media.url)}`,
          title: post.title,
          url: `/p/${post.author}/${post.permlink}/${extractIpfsHash(media.url)}`,
          src: media.url,
          type: type,
          videoUrl: getMediaType(media.url, media.type) === 'video' ? media.url : undefined,
          blurData: '',
          takenAt: new Date(),
          takenAtNaive: new Date().toISOString(),
          takenAtNaiveFormatted: new Date().toLocaleDateString(),
          updatedAt: new Date(post.last_update),
          createdAt: new Date(post.created),
          aspectRatio: 1.5,
          priority: false,
          tags: Array.isArray(JSON.parse(post.json_metadata).tags)
            ? JSON.parse(post.json_metadata).tags
            : [],
          cameraKey: 'hive',
          camera: null,
          simulation: null,
          width: 0,
          height: 0,
          extension: media.url.split('.').pop() || '',
          hiveMetadata: {
            author: post.author,
            permlink: post.permlink,
            body: post.body
          },
          author: post.author,
          permlink: post.permlink,
          iframeHtml: type === 'iframe' ? 
            `<iframe 
              src="${media.url}" 
              width="100%" 
              height="100%" 
              frameborder="0" 
              allowfullscreen
            ></iframe>`
            : undefined
        } as Photo;
      });
    });

    // Remove duplicates using a more specific unique key
    const uniquePosts = formattedPosts.reduce((acc, post) => {
      const key = `${post.author}-${post.permlink}-${post.src}`;

      // If post doesn't exist or is a more recent video, add/update
      const existingPost = acc.find(p => `${p.author}-${p.permlink}-${p.src}` === key);
      if (!existingPost) {
        acc.push(post);
      }

      return acc;
    }, [] as Photo[]);

    return {
      formattedPosts: uniquePosts,
      originalPosts: posts
    };
  } catch (error) {
    console.error('Error fetching posts:', error);
    return {
      formattedPosts: [],
      originalPosts: []
    };
  }
}

// Modify the extractAndCountTags function to receive paginated posts
function extractAndCountTags(posts: Discussion[], paginatedPosts: Photo[]): Tags {
  const tagCount = new Map<string, number>();

  // Filter only posts from the current page
  const currentPagePermlinks = new Set(paginatedPosts.map(post => post.permlink));
  const currentPagePosts = posts.filter(post =>
    currentPagePermlinks.has(post.permlink)
  );

  currentPagePosts.forEach(post => {
    try {
      const metadata = JSON.parse(post.json_metadata || '{}');
      const postTags = metadata.tags || [];

      if (Array.isArray(postTags)) {
        postTags.forEach(tag => {
          if (typeof tag === 'string') {
            tagCount.set(tag, (tagCount.get(tag) || 0) + 1);
          }
        });
      }
    } catch (e) {
      console.warn('Error parsing tags:', { post: post.permlink, error: e });
    }
  });

  return Array.from(tagCount.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count);
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Hive Posts',
    description: 'My posts from Hive blockchain',
  };
}

export default async function GridPage({ 
  searchParams 
}: { 
  searchParams: { page?: string } 
}) {
  const username = process.env.NEXT_PUBLIC_HIVE_USERNAME;
  const ITEMS_PER_PAGE = 12;
  
  // Usando uma variável intermediária para evitar o erro
  const pageParam = searchParams?.page;
  const currentPage = Number(pageParam) || 1;

  if (!username) {
    console.log('Username não definido');
    return <PhotosEmptyState />;
  }

  try {
    const { formattedPosts, originalPosts } = await getHivePosts(username);

    // Adiciona logs para debug
    console.log('Posts originais encontrados:', originalPosts.length);
    console.log('Posts formatados:', formattedPosts.length);

    // Validação adicional
    if (!formattedPosts || formattedPosts.length === 0) {
      console.log('Nenhum post formatado encontrado');
      return 
    }

    // Paginação
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const paginatedPosts = formattedPosts
      .slice(startIndex, endIndex)
      .map(post => ({
        ...post,
        type: post.type as 'photo' | 'video'
      }));

      const postTags = extractAndCountTags(originalPosts, paginatedPosts);


    const photosCount = formattedPosts.length;
    const totalPages = Math.ceil(photosCount / ITEMS_PER_PAGE);

    // Validação de página
    if (currentPage < 1 || (totalPages > 0 && currentPage > totalPages)) {
      console.log('Página inválida, redirecionando...');
      return redirect('/projects?page=1');
    }

 // Sidebar data
 const sidebarData = {
  tags: postTags,
  cameras: [],
  simulations: [],
};
    console.log('Debug final:', {
      totalPosts: photosCount,
      currentPage,
      totalPages,
      postsNaPagina: paginatedPosts.length,
      tagsEncontradas: postTags.length
    });

    return (
      <div className="flex flex-row">
        <div className="flex-1">
          <PhotoGridPage
            photos={paginatedPosts as Photo[]}
            photosCount={photosCount}
            tags={sidebarData.tags}
            cameras={[] as Cameras}
            simulations={[] as FilmSimulations}
          />


          {/* Paginação existente */}
          <div className="flex justify-center gap-4 mt-8 mb-8">
            {currentPage > 1 && (
              <Link
                href={`/projects?page=${currentPage - 1}`}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                Anterior
              </Link>
            )}

            <span className="px-4 py-2">
              Página {currentPage} de {totalPages}
            </span>

            {currentPage < totalPages && (
              <Link
                href={`/projects?page=${currentPage + 1}`}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                Próxima
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error in GridPage:', error);
    return 
  }
}
