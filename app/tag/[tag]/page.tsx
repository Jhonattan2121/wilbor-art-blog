import { IS_PRODUCTION, STATICALLY_OPTIMIZED_PHOTO_CATEGORIES } from '@/app/config';
import { getPostsByAuthor } from '@/lib/hive/hive-client';
import { MarkdownRenderer } from '@/lib/markdown/MarkdownRenderer';
import { INFINITE_SCROLL_GRID_INITIAL } from '@/photo';
import { Photo } from '@/photo/PhotoGridContainer';
import PhotoGridPage from '@/photo/PhotoGridPage';
import { getUniqueTags } from '@/photo/db/query';
import { generateMetaForTag } from '@/tag';
import { getPhotosTagDataCached } from '@/tag/data';
import type { Metadata } from 'next';
import { cache } from 'react';

interface TagPageParams {
  tag: string;
}

interface PageProps {
  params: Promise<TagPageParams>;
}

const getPhotosTagDataCachedCached = cache((tag: string) =>
  getPhotosTagDataCached({ tag, limit: INFINITE_SCROLL_GRID_INITIAL }));

export let generateStaticParams:
  (() => Promise<{ tag: string }[]>) | undefined = undefined;

if (STATICALLY_OPTIMIZED_PHOTO_CATEGORIES && IS_PRODUCTION) {
  generateStaticParams = async () => {
    const tags = await getUniqueTags();
    return tags.map(({ tag }) => ({ tag }));
  };
}

export async function generateMetadata({ 
  params 
}: PageProps): Promise<Metadata> {
  const { tag } = await params;
  const decodedTag = decodeURIComponent(tag);
  
  const [photos, { count, dateRange }] = await getPhotosTagDataCachedCached(decodedTag);

  if (photos.length === 0) return {};

  const { url, title, description, images } = generateMetaForTag(decodedTag, photos, count, dateRange);

  return {
    title,
    openGraph: { title, description, images, url },
    twitter: {
      images,
      description,
      card: 'summary_large_image',
    },
    description,
  };
}

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

export default async function TagPage({ 
  params 
}: PageProps) {
  const { tag } = await params;
  const decodedTag = decodeURIComponent(tag);
  const username = process.env.NEXT_PUBLIC_HIVE_USERNAME;

  if (!username) {
    return <div>Username not defined</div>;
  }

  // Fetch all user posts
  const posts = await getPostsByAuthor(username);

  // Filter posts containing the specific tag
  const postsWithTag = posts.filter(post => {
    try {
      const metadata = JSON.parse(post.json_metadata || '{}');
      const postTags = metadata.tags || [];
      
      const hasHiddenTag = postTags.includes('hidden');
      
      return postTags.includes(decodedTag) && !hasHiddenTag;
    } catch (e) {
      console.warn('Error parsing tags:', e);
      return false;
    }
  });

  // Format filtered posts (using the same logic as projects/page.tsx)
  const formattedPosts = postsWithTag.flatMap(post => {
    const mediaItems = MarkdownRenderer.extractMediaFromHive(post);
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
    return mediaItems.map((media) => {
      const type = getMediaType(media.url);

      return {
        id: `${post.author}/${post.permlink}/${extractIpfsHash(media.url)}`,
        title: post.title,
        url: `/p/${post.author}/${post.permlink}/${extractIpfsHash(media.url)}`,
        src: media.url,
        type: type,
        videoUrl: type === 'video' ? media.url : undefined,
        blurData: '',
        takenAt: new Date(),
        takenAtNaive: new Date().toISOString(),
        takenAtNaiveFormatted: new Date().toLocaleDateString(),
        updatedAt: new Date(post.last_update),
        createdAt: new Date(post.created),
        aspectRatio: 1.5,
        priority: false,
        tags: JSON.parse(post.json_metadata).tags || [],
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

  // Remove duplicates
  const uniquePosts = formattedPosts.reduce((acc, post) => {
    const key = `${post.author}-${post.permlink}-${post.src}`;
    if (!acc.find(p => `${p.author}-${p.permlink}-${p.src}` === key)) {
      acc.push(post);
    }
    return acc;
  }, [] as Photo[]);

  return (
    <div>

      <PhotoGridPage
        photos={uniquePosts}
        photosCount={uniquePosts.length}
        tags={[{ tag: decodedTag, count: uniquePosts.length }]}
        cameras={[]}
        simulations={[]}
      />
    </div>
  );
}
