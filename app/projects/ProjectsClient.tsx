"use client";
import ViewSwitcher from '@/app/ViewSwitcher';
import PhotoGridPage from '@/photo/PhotoGridPage';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

export default function ProjectsClient({ 
  posts, 
  tags, 
  photosCount, 
  cameras, 
  simulations, 
  hideSwitcher = false,
  externalSelectedTag,
  onTagChange
}: any) {
  const [internalSelectedTag, setInternalSelectedTag] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();

  const selectedTag = externalSelectedTag !== undefined ? externalSelectedTag : internalSelectedTag;

  useEffect(() => {
    if (externalSelectedTag !== undefined) return;

    const tagFromUrl = searchParams.get('tag');
    if (tagFromUrl) {
      const tagExists = tags.some((t: any) => t.tag === tagFromUrl);
      if (tagExists) {
        setInternalSelectedTag(tagFromUrl);
      }
    } else {
      setInternalSelectedTag(null);
    }
  }, [searchParams, tags, externalSelectedTag]);

  const handleTagChange = useCallback((tag: string | null) => {
    if (onTagChange) {
      onTagChange(tag);
    } else {
      const url = new URL(window.location.href);
      if (tag) {
        url.searchParams.set('tag', tag);
      } else {
        url.searchParams.delete('tag');
      }
      window.history.pushState({}, '', url.toString());
      // Also update internal state directly for immediate feedback
      setInternalSelectedTag(tag);
    }
  }, [onTagChange]);

  return (
    <>
      {!hideSwitcher && (
        <ViewSwitcher
          drawerTagsProps={{
            tags: tags.map((t: any) => t.tag),
            selectedTag,
            setSelectedTag: handleTagChange,
          }}
        />
      )}
      <PhotoGridPage
        photos={posts}
        photosCount={photosCount}
        selectedTag={selectedTag}
        setSelectedTag={handleTagChange}
      />
    </>
  );
}
