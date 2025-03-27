import { Photo } from '@/photo/components/types';
import { Tags } from '@/tag';
import { Discussion } from '@hiveio/dhive';

export function extractAndCountTags(posts: Discussion[], paginatedPosts: Photo[]): Tags {
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