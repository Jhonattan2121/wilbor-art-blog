"use client";
import PhotoGridPage from '@/photo/PhotoGridPage';
import { useState } from 'react';

export default function HomeGridClient({ photos, photosCount, tags, cameras, simulations }: {
  photos: any[];
  photosCount: number;
  tags: any[];
  cameras: any[];
  simulations: any[];
}) {
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  return (
    <PhotoGridPage
      photos={photos}
      photosCount={photosCount}
      tags={tags}
      cameras={cameras}
      simulations={simulations}
      selectedTag={selectedTag}
      setSelectedTag={setSelectedTag}
    />
  );
}
