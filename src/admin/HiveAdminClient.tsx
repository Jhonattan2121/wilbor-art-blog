'use client';

import { HiveAuth } from '@/auth/hive/HiveAuth';
import SiteGrid from '@/components/SiteGrid';
import { Photo } from '@/photo';
import { Client as HiveClient } from '@hiveio/dhive';
import { useEffect, useState } from 'react';
import AdminPhotosTable from './AdminPhotosTable';

interface HiveContent {
  photos: Photo[];
  videos: string[];
  posts: any[];
  metadata: {
    name: string;
    about: string;
    location: string;
    website: string;
    avatar: string;
  }
}
const HIVE_USERNAME = process.env.NEXT_PUBLIC_HIVE_USERNAME || '';

export default function HiveAdminClient() {
  const [content, setContent] = useState<HiveContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadHiveContent() {
      try {
        const hiveAuth = new HiveAuth();
        const username = localStorage.getItem(HIVE_USERNAME);
        
        if (!username) {
          setError('Hive user not found');
          return;
        }

        const user = await hiveAuth.authenticateUser(username, '');
        if (!user) {
          setError('Error authenticating Hive user');
          return;
        }

        const client = new HiveClient(['https://api.hive.blog']);
        const posts = await client.database.getDiscussions('blog', {
          tag: username,
          limit: 100,
        });

        const photos: Photo[] = [];
        const videos: string[] = [];

        posts.forEach((post: any) => {
          const json = JSON.parse(post.json_metadata);
          if (json.image) {
            json.image.forEach((url: string) => {
              const now = new Date();
              photos.push({
                id: `${post.id}-${url}`,
                url: url,
                title: post.title,
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

        const profile = JSON.parse(user.posting_json_metadata)?.profile || {};

        setContent({
          photos,
          videos,
          posts,
          metadata: {
            name: profile.name || username,
            about: profile.about || '',
            location: profile.location || '',
            website: profile.website || '',
            avatar: profile.profile_image || '',
          },
        });

      } catch (error) {
        console.error('Error loading Hive content:', error);
        setError('Error loading Hive content');
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
          {content?.metadata && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">
                {content.metadata.name}
              </h2>
              <p>{content.metadata.about}</p>
              <div className="flex gap-4 text-sm text-dim">
                {content.metadata.location && (
                  <span>{content.metadata.location}</span>
                )}
                {content.metadata.website && (
                  <a 
                    href={content.metadata.website}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {content.metadata.website}
                  </a>
                )}
              </div>
            </div>
          )}

          <div className="space-y-4">
            <h3 className="text-xl font-bold">
              Photos ({content?.photos.length || 0})
            </h3>
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

          <div className="space-y-4">
            <h3 className="text-xl font-bold">
              Posts ({content?.posts.length || 0})
            </h3>
            {content?.posts.map(post => (
              <div key={post.id} className="border-b pb-4">
                <h4 className="font-bold">{post.title}</h4>
                <p className="text-sm text-dim">
                  {new Date(post.created).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      } 
    />
  );
}