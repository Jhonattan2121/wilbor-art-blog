"use client";
import { Photo, PhotoDateRange } from "@/photo";
import PhotoGridContainer from "@/photo/PhotoProjectsContainer";
import FocalLengthHeader from "./FocalLengthHeader";
import { useState } from "react";

export default function FocalLengthOverview({
  focal,
  photos,
  count,
  dateRange,
  animateOnFirstLoadOnly,
}: {
  focal: number,
  photos: Photo[],
  count: number,
  dateRange?: PhotoDateRange,
  animateOnFirstLoadOnly?: boolean,
}) {
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  return (
    <PhotoGridContainer
      cacheKey={`focal-${focal}`}
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
      header={<FocalLengthHeader
        focal={focal}
        photos={photos}
        count={count}
        dateRange={dateRange} />}
      animateOnFirstLoadOnly={animateOnFirstLoadOnly}
      sidebar={undefined}
      selectedTag={selectedTag}
      setSelectedTag={setSelectedTag}
    />
  );
}