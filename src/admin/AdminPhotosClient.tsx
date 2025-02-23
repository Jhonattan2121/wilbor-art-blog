'use client';

import AdminPhotosTable from '@/admin/AdminPhotosTable';
import AdminPhotosTableInfinite from '@/admin/AdminPhotosTableInfinite';
import {
  AI_TEXT_GENERATION_ENABLED,
  PRESERVE_ORIGINAL_UPLOADS,
} from '@/app/config';
import { PATH_ADMIN_OUTDATED } from '@/app/paths';
import { HiveAuth } from '@/auth/hive/HiveAuth';
import PathLoaderButton from '@/components/primitives/PathLoaderButton';
import SiteGrid from '@/components/SiteGrid';
import { Photo } from '@/photo';
import PhotoUpload from '@/photo/PhotoUpload';
import { StorageListResponse } from '@/platforms/storage';
import { Timezone } from '@/utility/timezone';
import { clsx } from 'clsx/lite';
import { useEffect, useState } from 'react';
import { FaHive } from 'react-icons/fa';
import { LiaBroomSolid } from 'react-icons/lia';
import AdminUploadsTable from './AdminUploadsTable';
const HIVE_USERNAME = process.env.NEXT_PUBLIC_HIVE_USERNAME || '';
export default function AdminPhotosClient({
  photos,
  photosCount,
  photosCountOutdated,
  onLastPhotoUpload,
  blobPhotoUrls,
  infiniteScrollInitial,
  infiniteScrollMultiple,
  timezone,
}: {
  photos: Photo[]
  photosCount: number
  photosCountOutdated: number
  onLastPhotoUpload: () => Promise<void>
  blobPhotoUrls: StorageListResponse
  infiniteScrollInitial: number
  infiniteScrollMultiple: number
  timezone: Timezone
}) {
  const [isHiveMode, setIsHiveMode] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [hivePhotos, setHivePhotos] = useState<Photo[]>([]);
  const [hiveUsername, setHiveUsername] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadHiveContent = async () => {
      const username = localStorage.getItem(HIVE_USERNAME);
      if (!username) return;

      setLoading(true);
      try {
        const hiveAuth = new HiveAuth();
        const user = await hiveAuth.authenticateUser(username, '');

        if (user) {
          setHiveUsername(username);
          const posts = await hiveAuth.getUserPosts(username, 100);

          const photos: Photo[] = [];
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

          setHivePhotos(photos);
          setIsHiveMode(true);
        }
      } catch (error) {
        console.error('Error loading Hive content:', error);
      } finally {
        setLoading(false);
      }
    };

    loadHiveContent();
  }, []);

  return (
    <SiteGrid
      contentMain={
        <div>
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsHiveMode(!isHiveMode)}
                className={clsx(
                  "flex items-center space-x-2 px-4 py-2 rounded",
                  isHiveMode ? "bg-blue-600 text-white" : "bg-gray-200"
                )}
              >
                <FaHive />
                <span>{isHiveMode ? 'Hive Mode' : 'Local Mod'}</span>
              </button>
              {isHiveMode && <span className="text-sm">(@{hiveUsername})</span>}
            </div>
          </div>

          {isHiveMode ? (
            <div className="space-y-[6px] sm:space-y-[10px]">
              <AdminPhotosTable
                photos={hivePhotos}
                hasAiTextGeneration={false}
                canEdit={false}
                canDelete={false}
                timezone={timezone}
              />
            </div>
          ) : (
            <>
              <div className="flex">
                <div className="grow min-w-0">
                  <PhotoUpload
                    shouldResize={!PRESERVE_ORIGINAL_UPLOADS}
                    isUploading={isUploading}
                    setIsUploading={setIsUploading}
                    onLastUpload={onLastPhotoUpload}
                  />
                </div>
                {photosCountOutdated > 0 && (
                  <PathLoaderButton
                    path={PATH_ADMIN_OUTDATED}
                    icon={<LiaBroomSolid size={18} className="translate-y-[-1px]" />}
                    title={`${photosCountOutdated} Outdated Photos`}
                    className={clsx(isUploading && 'hidden md:inline-flex')}
                    hideTextOnMobile={false}
                  >
                    {photosCountOutdated}
                  </PathLoaderButton>
                )}
              </div>

              {blobPhotoUrls.length > 0 && (
                <div className={clsx(
                  'border-b pb-6',
                  'border-gray-200 dark:border-gray-700',
                  'space-y-4'
                )}>
                  <div className="font-bold">
                    Photo Blobs ({blobPhotoUrls.length})
                  </div>
                  <AdminUploadsTable urlAddStatuses={blobPhotoUrls} />
                </div>
              )}

              <div className="space-y-[6px] sm:space-y-[10px]">
                <AdminPhotosTable
                  photos={photos}
                  hasAiTextGeneration={AI_TEXT_GENERATION_ENABLED}
                  timezone={timezone}
                />
                {photosCount > photos.length && (
                  <AdminPhotosTableInfinite
                    initialOffset={infiniteScrollInitial}
                    itemsPerPage={infiniteScrollMultiple}
                    hasAiTextGeneration={AI_TEXT_GENERATION_ENABLED}
                    timezone={timezone}
                  />
                )}
              </div>
            </>
          )}
        </div>
      }
    />
  );
}