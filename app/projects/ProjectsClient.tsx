"use client";
import ViewSwitcher from '@/app/ViewSwitcher';
import PhotoGridPage from '@/photo/PhotoGridPage';
import { useState } from 'react';

export default function ProjectsClient({ posts, tags, photosCount, cameras, simulations }: any) {
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  return (
    <>
      <ViewSwitcher
        drawerTagsProps={{
          tags: tags.map((t: any) => t.tag),
          selectedTag,
          setSelectedTag,
        }}
      />
      <PhotoGridPage
        photos={posts}
        photosCount={photosCount}
        tags={tags}
        cameras={cameras}
        simulations={simulations}
        selectedTag={selectedTag}
        setSelectedTag={setSelectedTag}
      />
    </>
  );
}
