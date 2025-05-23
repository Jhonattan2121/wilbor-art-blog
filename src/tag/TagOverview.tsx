"use client";
import { Photo, PhotoDateRange } from '@/photo';
import PhotoGridContainer from '@/photo/PhotoProjectsContainer';
import TagHeader from './TagHeader';
import { useState } from 'react';

export default function TagOverview({
  tag,
  photos,
  count,
  dateRange,
  animateOnFirstLoadOnly,
}: {
  tag: string,
  photos: Photo[],
  count: number,
  dateRange?: PhotoDateRange,
  animateOnFirstLoadOnly?: boolean,
}) {
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  return (
    <PhotoGridContainer
      media={photos.map(photo => ({
        id: photo.id,
        url: photo.url,
        src: photo.src,
        title: photo.title,
        type: photo.type || 'photo',
        thumbnailSrc: photo.type === 'video' ? photo.src : undefined,
        videoUrl: photo.type === 'video' ? photo.src : undefined,
        width: photo.width,
        height: photo.height,
        tags: photo.tags,
        hiveMetadata: photo.hiveMetadata && {
          author: photo.hiveMetadata.author || '',
          permlink: photo.hiveMetadata.permlink || '',
          body: photo.hiveMetadata.body || ''
        }
      }))}
      cacheKey={`tag-${tag}`}
      header={
        <TagHeader
          tag={tag}
          photos={photos}
          count={count}
          dateRange={dateRange}
        />
      }
      animateOnFirstLoadOnly={animateOnFirstLoadOnly}
      selectedTag={selectedTag}
      setSelectedTag={setSelectedTag}
    />
  );
}
