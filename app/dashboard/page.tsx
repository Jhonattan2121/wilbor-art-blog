
import { getPostsByAuthor } from '@/lib/hive/hive-client';
import { MarkdownRenderer } from '@/lib/markdown/MarkdownRenderer';
import { Photo } from '@/photo/components/types';
import PhotosEmptyState from '@/photo/PhotosEmptyState';
import DashboardProjectsClient from './DashboardProjectsClient';

const getMediaType = (url: string, mediaType?: string) => {
  if (url.includes('ipfs.skatehive.app/ipfs/')) return 'iframe';
  if (url.toLowerCase().match(/\.(mp4|webm|ogg|mov|m4v)$/)) return 'video';
  if (url.includes('hackmd.io/_uploads/')) return 'photo';
  if (url.toLowerCase().match(/\.(jpg|jpeg|png|gif|webp)$/)) return 'photo';
  if (url.includes('ipfs.skatehive.app/') || url.includes('.blob.vercel-storage.com/') || url.includes('files.peakd.com/')) return 'photo';
  return 'photo';
};

async function getHivePosts(username: string) {
  try {
    const posts = await getPostsByAuthor(username);
    const formattedPosts = posts.flatMap(post => {
      try {
        const metadata = JSON.parse(post.json_metadata || '{}');
        const postTags = metadata.tags || [];
        if (postTags.includes('hidden')) return [];
      } catch {}
      const mediaItems = MarkdownRenderer.extractMediaFromHive(post);
      return mediaItems.map((media) => {
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
          type: media.type === 'iframe' || media.url.includes('ipfs.skatehive.app/ipfs/') ? 'iframe' : getMediaType(media.url),
          src: media.url,
          iframeHtml: media.url.includes('ipfs.skatehive.app/ipfs/')
            ? `<iframe src="${media.url}?autoplay=1&controls=0&muted=1&loop=1" className=\"w-full h-full\" style=\"aspect-ratio: 1/1;\" allow="autoplay" frameborder="0"></iframe>`
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
    // Remove duplicados
    const uniquePosts = formattedPosts.reduce((acc, post) => {
      const key = `${post.author}-${post.permlink}-${post.src}`;
      if (!acc.find(p => `${p.author}-${p.permlink}-${p.src}` === key)) acc.push(post);
      return acc;
    }, [] as Photo[]);
    return uniquePosts;
  } catch {
    return [];
  }
}

export default async function DashboardPage() {
  const username = process.env.NEXT_PUBLIC_HIVE_USERNAME;
  if (!username) return <PhotosEmptyState />;
  const posts = await getHivePosts(username);
  return <DashboardProjectsClient posts={posts} photosCount={posts.length} cameras={[]} simulations={[]} />;
}
