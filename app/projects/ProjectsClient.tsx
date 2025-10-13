"use client";
import ViewSwitcher from '@/app/ViewSwitcher';
import PhotoGridPage from '@/photo/PhotoGridPage';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

export default function ProjectsClient({ posts, tags, photosCount, cameras, simulations }: any) {
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const tagFromUrl = searchParams.get('tag');
    if (tagFromUrl) {
      const tagExists = tags.some((t: any) => t.tag === tagFromUrl);
      if (tagExists) {
        setSelectedTag(tagFromUrl);
      }
    } else {
      setSelectedTag(null);
    }
  }, [searchParams, tags]);

  const handleTagChange = useCallback((tag: string | null) => {
    const url = new URL(window.location.href);
    if (tag) {
      url.searchParams.set('tag', tag);
    } else {
      url.searchParams.delete('tag');
    }
    window.history.pushState({}, '', url.toString());
  }, []);

  return (
    <>
      <ViewSwitcher
        drawerTagsProps={{
          tags: tags.map((t: any) => t.tag),
          selectedTag,
          setSelectedTag: handleTagChange,
        }}
      />
      <PhotoGridPage
        photos={posts}
        photosCount={photosCount}
        tags={tags}
        cameras={cameras}
        simulations={simulations}
        selectedTag={selectedTag}
        setSelectedTag={handleTagChange}
      />
    </>
  );
}
