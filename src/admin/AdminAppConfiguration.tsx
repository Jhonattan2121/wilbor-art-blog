"use client"
import { HiveAuth } from '@/auth/hive/HiveAuth';
import SiteGrid from '@/components/SiteGrid';
import { Photo } from '@/photo';
import { useEffect, useState } from 'react';
import AdminPhotosTable from './AdminPhotosTable';

const HIVE_USERNAME = process.env.NEXT_PUBLIC_HIVE_USERNAME || '';

interface HiveContent {
  photos: Photo[];
  videos: string[];
  posts: any[];
}

export default function AdminAppConfiguration() {
  const [content, setContent] = useState<HiveContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadHiveContent() {
      setLoading(true);
      try {
        const hiveAuth = new HiveAuth();
        console.log('Starting posts search...');
        const posts = await hiveAuth.getUserPosts(HIVE_USERNAME, 100);
        console.log('Posts received:', posts);

        const photos: Photo[] = [];
        const videos: string[] = [];

        posts.forEach((post: any) => {
          console.log('Processing post:', post.id);
          const json = JSON.parse(post.json_metadata);
          console.log('Post metadata:', json);
          if (json.image) {
            json.image.forEach((url: string) => {
              const now = new Date();
              photos.push({
                id: `${post.id}-${url}`,
                url: 'title',
                createdAt: new Date(post.created),
                updatedAt: new Date(post.last_update),
                blurData: '',
                tags: json.tags || [],
                takenAt: now,
                takenAtNaive: now.toISOString(),
                takenAtNaiveFormatted: now.toLocaleDateString(),
                extension: url.split('.').pop() || '',
                aspectRatio: 1,
              });
            });
          }
        });

        console.log('Photos processed:', photos.length);
        setContent({ photos, videos, posts });
      } catch (error: any) {
        console.error('Detailed error loading Hive content:', error);
        setError(`Error loading Hive content: ${error.message}`);
      } finally {
        setLoading(false);
      }
    }

    loadHiveContent();
  }, []);

  if (loading) {
    return <div>Loading Hive content...</div>;
  }

  if (error) {
    return <div className="text-error">{error}</div>;
  }

  return (
    <SiteGrid
      contentMain={
        <div className="space-y-8">
          <div className="text-lg font-bold mb-4">
            User content @{HIVE_USERNAME}
          </div>
          {content?.photos && content.photos.length > 0 ? (
            <AdminPhotosTable
              photos={content.photos}
              hasAiTextGeneration={false}
              canEdit={false}
              canDelete={false}
            />
          ) : (
            <p>No photos found</p>
          )}
        </div>
      }
    />
  );
}