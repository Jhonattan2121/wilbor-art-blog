import { Photo } from '@/photo';
import { unstable_cache } from 'next/cache';

export async function getHivePosts(username: string): Promise<Photo[]> {
  const cachedFunction = unstable_cache(
    async () => {
      const photos: Photo[] = []; // Replace with actual logic to fetch photos
      return photos;
    },
    [`hive-posts-${username}`],
    {
      revalidate: 3600 
    }
  );
  return cachedFunction();
}