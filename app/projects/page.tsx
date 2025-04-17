import { Cameras } from '@/camera';
import { getPostsByAuthor } from '@/lib/hive/hive-client';
import { MarkdownRenderer } from '@/lib/markdown/MarkdownRenderer';
import { Photo } from '@/photo/components/types';
import PhotoGridPage from '@/photo/PhotoGridPage';
import PhotosEmptyState from '@/photo/PhotosEmptyState';
import { FilmSimulations } from '@/simulation';
import { Tags } from '@/tag';
import { createMetadata } from '@/utility/metadata';
import { Discussion } from '@hiveio/dhive';
import { Metadata } from 'next/types';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  return createMetadata({
    title: 'Projetos',
    description: 'Explore as exposições e exibições de Wilson Domingues "Wilbor", artista multifacetado que une skate, arte e audiovisual.',
    path: '/projects'
  });
}

const getMediaType = (url: string, mediaType?: string) => {
  if (url.includes('ipfs.skatehive.app/ipfs/')) {
    console.log('Encontrado URL do IPFS skatehive:', url);
    return 'iframe';
  }

  // First check if it is an IPFS skatehive link
  if (url.includes('ipfs.skatehive.app/ipfs/')) {
    return 'iframe';
  }

  const isVideo = url.toLowerCase().match(/\.(mp4|webm|ogg|mov|m4v)$/);
  if (isVideo) return 'video';

  if (url.includes('hackmd.io/_uploads/')) return 'photo';

  if (url.toLowerCase().match(/\.(jpg|jpeg|png|gif|webp)$/)) return 'photo';

  if (url.includes('ipfs.skatehive.app/') ||
    url.includes('.blob.vercel-storage.com/') ||
    url.includes('files.peakd.com/')) {
    return 'photo';
  }

  return 'photo';
};

async function getHivePosts(username: string) {
  try {
    const posts = await retryOperation(async () => {
      return await getPostsByAuthor(username);
    });
    
    console.log('Posts found:', posts.length);

    const formattedPosts = posts.flatMap(post => {
      // Check if the post has the "hidden" tag
      try {
        const metadata = JSON.parse(post.json_metadata || '{}');
        const postTags = metadata.tags || [];
        if (postTags.includes('hidden')) {
          return [];
        }
      } catch (e) {
        console.warn('Error checking hidden tag:', e);
      }

      const mediaItems = MarkdownRenderer.extractMediaFromHive(post);
      console.log('Media items found:', mediaItems.length);

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

        const extractIpfsHash = (url: string): string => {
          if (url.includes('ipfs.skatehive.app/ipfs/')) {
            const match = url.match(/ipfs\/([a-zA-Z0-9]+)/);
            return match ? match[1] : '';
          }
          return '';
        };

        return {
          id: `${post.author}/${post.permlink}/${extractIpfsHash(media.url)}`,
          title: post.title,
          url: `/p/${post.author}/${post.permlink}/${extractIpfsHash(media.url)}`,
          type: media.type === 'iframe' || media.url.includes('ipfs.skatehive.app/ipfs/')
            ? 'iframe'
            : getMediaType(media.url),
          src: media.url,
          iframeHtml: media.url.includes('ipfs.skatehive.app/ipfs/')
            ? `<iframe 
                src="${media.url}?autoplay=1&controls=0&muted=1&loop=1"
                className="w-full h-full"
                style="aspect-ratio: 1/1;"
                allow="autoplay"
                frameborder="0"
              ></iframe>`
            : undefined,
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
    console.error('Erro ao processar posts:', error);
    return {
      formattedPosts: [],
      originalPosts: []
    };
  }
}

// Move the retryOperation function to local scope if needed
async function retryOperation<T>(operation: () => Promise<T>, maxRetries = 3): Promise<T> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (attempt === maxRetries) throw error;
      const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
      console.warn(`Attempt ${attempt} failed, retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw new Error('All attempts failed');
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

export default async function GridPage(props: any) {
  const username = process.env.NEXT_PUBLIC_HIVE_USERNAME;

  if (!username) {
    console.error('Username not defined');
    return <PhotosEmptyState />;
  }

  const { formattedPosts, originalPosts } = await getHivePosts(username);

  // Debug
  console.log('Original posts:', originalPosts.length);

  const posts = formattedPosts.map(post => {
    return {
      ...post,
      type: post.src?.includes('ipfs.skatehive.app/ipfs/')
        ? 'iframe'
        : post.type
    } as Photo;
  });

  const postTags = extractAndCountTags(originalPosts, posts);

  const photosCount = formattedPosts.length;

  if (photosCount === 0) {
    console.log('No posts found');
    return <PhotosEmptyState />;
  }

  // Sidebar data com todas as tags
  const sidebarData = {
    tags: postTags,
    cameras: [],
    simulations: [],
  };

  return (
    <div className="flex flex-row">
      <div className="flex-1">
        <PhotoGridPage
          photos={posts as Photo[]}
          photosCount={photosCount}
          tags={[]}
          cameras={[] as Cameras}
          simulations={[] as FilmSimulations}
        />
      </div>
    </div>
  );
}